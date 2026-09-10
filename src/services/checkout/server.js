'use strict';

const express = require('express');
const {
  findOrderById,
  searchOrdersByEmail,
  createOrder
} = require('./order-service');

const app = express();
app.use(express.json());

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok', version: '2.4.0' }));

// Storefront admin console endpoints.
app.get('/v2/admin/orders/lookup', findOrderById);
app.get('/v2/admin/orders/search', searchOrdersByEmail);

app.post('/v2/checkout/orders', async (req, res) => {
  try {
    const result = await createOrder({
      cart: req.body.cart,
      payment: req.body.payment,
      idempotencyKey: req.header('Idempotency-Key')
    });
    res.status(result.deduplicated ? 200 : 201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const port = Number(process.env.PORT || 8080);

if (require.main === module) {
  app.listen(port, () => console.log(`checkout-api listening on ${port}`));
}

module.exports = { app };
