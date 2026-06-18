'use strict';

const { Pool } = require('pg');

// Credentials are read from the environment. See config/database.js for the
// legacy configuration that is being retired.
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: Number(process.env.PG_POOL_MAX || 20),
  idleTimeoutMillis: 30000
});

module.exports = { db: pool };
