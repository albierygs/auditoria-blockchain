const stripe = require("../../lib/stripe");
const { db } = require("../../utils/db");
const { STRIPE_WEBHOOK_SECRET } = require("../../utils/constants");
const BlockchainService = require("../../services/blockchainService");

const stripeWebhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Note: express raw body is required for stripe webhook signature validation.
    // Ensure your express app is configured with `express.raw({type: 'application/json'})` for this route.
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const donationId = session.client_reference_id; // public_id of the donation

      if (donationId) {
        // Update the stripe_transaction
        await db.stripe_transaction.update({
          where: { stripe_checkout_session_id: session.id },
          data: { status: "paid" },
        });

        // Update the donation status
        const donation = await db.donation.update({
          where: { public_id: donationId },
          data: {
            status: "CONFIRMED",
            confirmed_at: new Date(),
          },
        });

        // Registrar transação na blockchain (simulada)
        try {
          await BlockchainService.recordTransaction({
            type: "DONATION",
            value: donation.value,
            donation_id: donation.public_id,
            from_address: `0xDonor${donation.donor_id.substring(0, 8)}`,
            to_address: `0xOrg${donation.organization_id.substring(0, 8)}`,
            network: "ETHEREUM_TESTNET",
          });
          console.log(`✅ Blockchain transaction recorded for donation ${donationId}`);
        } catch (error) {
          console.error(`❌ Failed to record blockchain transaction for donation ${donationId}:`, error);
        }
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object;
      
      // Update Stripe Account status in our DB
      await db.stripe_account.updateMany({
        where: { stripe_account_id: account.id },
        data: {
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
        },
      });
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

module.exports = stripeWebhookController;
