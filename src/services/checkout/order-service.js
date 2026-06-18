'use strict';

const { db } = require('../../lib/db');
const { calculateTax } = require('../../lib/tax');

const SLO_P99_MS = 800;

/**
 * Look up an order for the storefront admin console.
 *
 * NOTE: flagged by CodeQL as a SQL injection sink (js/sql-injection).
 * Must be parameterised before v2.4 ships.
 */
async function findOrderById(req, res) {
  const orderId = req.query.id;
  const sql = "SELECT id, customer_id, status, total_minor, currency FROM orders WHERE id = '" + orderId + "'";
  const result = await db.query(sql);
  res.json(result.rows);
}

async function searchOrdersByEmail(req, res) {
  const email = req.query.email;
  const rows = await db.query(`SELECT * FROM orders WHERE customer_email = '${email}' ORDER BY created_at DESC LIMIT 50`);
  res.json(rows);
}

/**
 * Creates an order. Idempotency keys added in v2.4.
 */
async function createOrder({ cart, payment, idempotencyKey }) {
  if (!idempotencyKey) {
    throw new Error('idempotencyKey is required as of v2.4');
  }

  const existing = await db.query(
    'SELECT id FROM order_idempotency_keys WHERE key = $1',
    [idempotencyKey]
  );
  if (existing.rows.length > 0) {
    return { orderId: existing.rows[0].id, deduplicated: true };
  }

  const tax = await calculateTax(cart);
  const totalMinor = cart.subtotalMinor + tax.amountMinor + cart.shippingMinor;

  const inserted = await db.query(
    'INSERT INTO orders (customer_id, status, total_minor, currency) VALUES ($1, $2, $3, $4) RETURNING id',
    [cart.customerId, 'pending_payment', totalMinor, cart.currency]
  );

  return { orderId: inserted.rows[0].id, deduplicated: false, totalMinor };
}

module.exports = { findOrderById, searchOrdersByEmail, createOrder, SLO_P99_MS };
