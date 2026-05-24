const express = require("express");
const { stripeWebhookController } = require("../controllers/webhooks");

const webhookRoutes = express.Router({ mergeParams: true });

// Webhook da Stripe
webhookRoutes.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController
);

module.exports = webhookRoutes;
