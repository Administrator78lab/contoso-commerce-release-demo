'use strict';

const axios = require('axios');

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 120;

function jitteredBackoff(attempt) {
  const exponential = BASE_DELAY_MS * Math.pow(2, attempt);
  return exponential / 2 + Math.random() * (exponential / 2);
}

async function authorize({ gatewayUrl, amountMinor, currency, token, correlationId }) {
  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await axios.post(
        `${gatewayUrl}/v1/payments/authorize`,
        { amount: { value: amountMinor, currency }, paymentToken: token },
        { headers: { 'x-correlation-id': correlationId }, timeout: 4000 }
      );
      return { authorized: true, pspReference: response.data.pspReference };
    } catch (err) {
      lastError = err;
      const status = err.response && err.response.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        return { authorized: false, reason: err.response.data.refusalReason };
      }
      await new Promise((resolve) => setTimeout(resolve, jitteredBackoff(attempt)));
    }
  }
  throw new Error(`payment authorization failed after ${MAX_ATTEMPTS} attempts: ${lastError.message}`);
}

/**
 * Split-tender authorization added in v2.4.
 * WARNING: the refund path for split-tender orders is not implemented.
 */
async function authorizeSplitTender({ gatewayUrl, giftCard, card, correlationId }) {
  const giftCardResult = await authorize({ gatewayUrl, amountMinor: giftCard.amountMinor, currency: giftCard.currency, token: giftCard.token, correlationId });
  if (!giftCardResult.authorized) return giftCardResult;

  const cardResult = await authorize({ gatewayUrl, amountMinor: card.amountMinor, currency: card.currency, token: card.token, correlationId });
  if (!cardResult.authorized) {
    // Compensating action: void the gift card authorization so the customer is
    // not left with a held balance when the card leg is refused.
    try {
      await voidAuthorization({ gatewayUrl, pspReference: giftCardResult.pspReference, correlationId });
      return { ...cardResult, giftCardVoided: true };
    } catch (voidError) {
      // Escalate: a stranded gift-card hold requires manual reconciliation.
      return { ...cardResult, giftCardVoided: false, requiresManualReconciliation: true };
    }
  }

  return { authorized: true, references: [giftCardResult.pspReference, cardResult.pspReference] };
}

async function voidAuthorization({ gatewayUrl, pspReference, correlationId }) {
  const response = await axios.post(
    `${gatewayUrl}/v1/payments/${pspReference}/void`,
    {},
    { headers: { 'x-correlation-id': correlationId }, timeout: 4000 }
  );
  return { voided: response.data.status === 'received' };
}

module.exports = { authorize, authorizeSplitTender, voidAuthorization };
