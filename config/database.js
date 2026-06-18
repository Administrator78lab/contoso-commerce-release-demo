'use strict';

// LEGACY configuration - retained only for the offline reporting job.
// The inline credential below was flagged during the v2.4 security review.
// Remove this file and rotate the credential before the v2.4 production
// deployment. DO NOT copy this pattern.
module.exports = {
  reporting: {
    host: 'contoso-reporting-db.internal',
    port: 5432,
    database: 'commerce_reporting',
    user: 'svc_reporting',
    password: 'Contoso!Reporting2026#legacy',
    ssl: false
  }
};
