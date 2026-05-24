const stripe = require("../lib/stripe");
const { FRONTEND_URL } = require("../utils/constants");

class StripeService {
  /**
   * Create a new Express Account for an organization
   */
  async createCustomAccount(email) {
    const account = await stripe.accounts.create({
      type: "express",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    return account;
  }

  /**
   * Create an onboarding link for the Express Account
   */
  async createAccountLink(accountId) {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${FRONTEND_URL}/organization/profile`,
      return_url: `${FRONTEND_URL}/organization/profile`,
      type: "account_onboarding",
    });
    return accountLink.url;
  }

  /**
   * Create a login link for the Express Account Dashboard
   */
  async createLoginLink(accountId) {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }

  /**
   * Check if the account has details submitted and charges enabled
   */
  async getAccountStatus(accountId) {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    };
  }

  /**
   * Create a Checkout Session for a donation
   */
  async createCheckoutSession(
    amount,
    currency,
    donationId,
    organizationName,
    stripeAccountId,
    customerEmail = null
  ) {
    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    // Calculate application fee (e.g., 0% for now or calculate accordingly)
    // We can also not use application_fee_amount and just use transfer_data to route funds
    // To route 100% of the funds to the connected account, we don't need application_fee_amount
    // but the platform pays Stripe fees in this model unless configured otherwise.

    const sessionData = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amountInCents,
            product_data: {
              name: `Doação para ${organizationName}`,
              description: `Apoio ao projeto/instituição`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/pagamento/sucesso/${donationId}`,
      cancel_url: `${FRONTEND_URL}/pagamento/cancelado/${donationId}`,
      client_reference_id: donationId,
      payment_intent_data: {
        transfer_data: {
          destination: stripeAccountId,
        },
      },
    };

    if (customerEmail) {
      sessionData.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    return session;
  }
}

module.exports = new StripeService();
