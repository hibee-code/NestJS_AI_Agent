#!/usr/bin/env node
/**
 * Simple mock premium API for local testing.
 * POST /premium
 * body: { email, customerId }
 * returns: { customerId, premiumEstimate, details }
 */
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/premium', (req, res) => {
  const { email, customerId } = req.body || {};
  // simple deterministic mock based on customerId length
  const seed = (customerId || email || '').length || 1;
  const premiumEstimate = 100 + (seed % 10) * 25;
  const details = {
    currency: 'USD',
    premiumEstimate,
    note: 'This is a mock premium result — replace with real service in production',
  };
  res.json({ customerId, email, ...details });
});

const port = process.env.MOCK_PREMIUM_PORT || 4000;
app.listen(port, () => {
  console.log(`Mock premium API listening on http://localhost:${port}`);
});
