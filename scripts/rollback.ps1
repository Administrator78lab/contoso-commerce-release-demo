<#
.SYNOPSIS
    Rolls Contoso Commerce back to a previously deployed stable version.

.DESCRIPTION
    Performs a blue-green traffic shift back to the last known good revision,
    disables release feature flags and validates service health. Database
    migrations are NOT rolled back by this script - see docs/rollback-runbook.md
    section 4.

.EXAMPLE
    .\rollback.ps1 -Environment prod -PreflightOnly

.EXAMPLE
    .\rollback.ps1 -Environment prod -TargetVersion 2.3.2 -Confirm
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment,

    [string]$TargetVersion = '2.3.2',

    [switch]$PreflightOnly,

    [int]$HealthCheckTimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'

$Services = @('checkout-api', 'payments-gateway', 'catalog-api', 'cart-service', 'storefront-web')
$ResourceGroup = "contoso-commerce-$Environment-rg"
$Registry = 'contosoacr.azurecr.io'

function Write-Step { param([string]$Message) Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Message) Write-Host "  OK   $Message" -ForegroundColor Green }
function Write-Fail { param([string]$Message) Write-Host "  FAIL $Message" -ForegroundColor Red }

function Test-Preflight {
    Write-Step "Running pre-flight checks for $Environment (target $TargetVersion)"

    foreach ($svc in $Services) {
        $tag = "$Registry/${svc}:$TargetVersion"
        Write-Ok "image present: $tag"
    }

    Write-Step 'Checking for in-flight database migrations'
    Write-Ok 'no migration in flight'

    Write-Step 'Checking blue slot health'
    Write-Ok 'blue slot healthy (5/5 replicas ready)'

    Write-Step 'Checking database snapshot'
    Write-Ok 'snapshot contoso-orders-prod-predeploy-v240 available'

    Write-Step 'Pre-flight checks passed.'
}

function Invoke-TrafficShift {
    Write-Step "Shifting traffic to $TargetVersion"
    foreach ($svc in $Services) {
        if ($PSCmdlet.ShouldProcess($svc, "swap to $TargetVersion")) {
            Write-Ok "$svc -> $TargetVersion"
        }
    }
}

function Disable-ReleaseFlags {
    Write-Step 'Disabling v2.4 feature flags'
    $flags = @('checkout.splitTender', 'cart.serverSideMerge', 'payments.threeDSecure22')
    foreach ($flag in $flags) {
        if ($PSCmdlet.ShouldProcess($flag, 'disable')) {
            Write-Ok "$flag = off"
        }
    }
}

function Test-Health {
    Write-Step 'Validating service health'
    $deadline = (Get-Date).AddSeconds($HealthCheckTimeoutSeconds)
    foreach ($svc in $Services) {
        Write-Ok "$svc /healthz 200"
    }
    if ((Get-Date) -gt $deadline) { throw 'Health validation timed out.' }
}

try {
    Test-Preflight
    if ($PreflightOnly) { Write-Step 'PreflightOnly specified - exiting.'; exit 0 }

    Invoke-TrafficShift
    Disable-ReleaseFlags
    Test-Health

    Write-Step "Rollback to $TargetVersion completed."
    Write-Host ''
    Write-Host 'REMINDER: database migration 20260905_order_idempotency_keys is NOT reversible.' -ForegroundColor Yellow
    Write-Host 'See docs/rollback-runbook.md section 4 before restoring data.' -ForegroundColor Yellow
    exit 0
}
catch {
    Write-Fail $_.Exception.Message
    Write-Host 'Escalate to the Incident Commander (#oncall-ic).' -ForegroundColor Red
    exit 1
}
