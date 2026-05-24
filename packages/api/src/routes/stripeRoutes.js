const express = require("express");
const {
  createStripeAccountController,
  getStripeAccountController,
  createStripeLoginLinkController,
} = require("../controllers/stripe");
const { validateToken, authorizeRoles } = require("../middlewares");

const router = express.Router();

router.post(
  "/onboarding",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN"]),
  createStripeAccountController
);
router.get(
  "/account",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN"]),
  getStripeAccountController
);
router.post(
  "/login-link",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN"]),
  createStripeLoginLinkController
);

module.exports = router;
