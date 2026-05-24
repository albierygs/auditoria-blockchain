const Stripe = require("stripe");
const { STRIPE_SECRET_KEY } = require("../utils/constants.js");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

module.exports = stripe;
