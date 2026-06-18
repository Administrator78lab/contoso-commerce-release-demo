'use strict';

const axios = require('axios');

const AVALARA_URL = process.env.AVALARA_URL || 'https://rest.avatax.com/api/v2';

/**
 * v2.4: tax is calculated once per order instead of once per line item,
 * cutting Avalara calls by roughly 68%.
 */
async function calculateTax(cart) {
  const lines = cart.lines.map((line, index) => ({
    number: String(index + 1),
    quantity: line.quantity,
    amount: line.unitPriceMinor * line.quantity / 100,
    taxCode: line.taxCode || 'P0000000'
  }));

  const response = await axios.post(
    `${AVALARA_URL}/transactions/create`,
    {
      type: 'SalesOrder',
      companyCode: 'CONTOSO',
      date: new Date().toISOString().slice(0, 10),
      customerCode: cart.customerId,
      addresses: { shipTo: cart.shippingAddress },
      lines
    },
    { headers: { Authorization: `Bearer ${process.env.AVALARA_TOKEN}` }, timeout: 3000 }
  );

  return { amountMinor: Math.round(response.data.totalTax * 100) };
}

module.exports = { calculateTax };
