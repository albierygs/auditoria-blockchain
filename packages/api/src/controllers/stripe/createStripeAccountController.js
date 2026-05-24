const { db } = require("../../utils/db");
const stripeService = require("../../services/stripeService");
const ApiException = require("../../exceptions/ApiException");

const createStripeAccountController = async (req, res, next) => {
  try {
    const public_id = req.user.publicId; // ORG user ID

    const member = await db.organization_member.findUnique({
      where: {
        public_id,
      },
      select: {
        organization_id: true,
      },
    });

    // Verify organization
    const org = await db.organization.findUnique({
      where: { public_id: member.organization_id },
      include: { stripe_account: true },
    });

    if (!org) {
      throw new ApiException("Organização não encontrada", 404);
    }

    let stripeAccountId = org.stripe_account?.stripe_account_id;

    // If there is no Stripe account created yet
    if (!stripeAccountId) {
      // Create Stripe Express Account
      const account = await stripeService.createCustomAccount(org.email);
      stripeAccountId = account.id;

      // Save in DB
      await db.stripe_account.create({
        data: {
          organization_id: org.public_id,
          stripe_account_id: stripeAccountId,
          account_email: org.email,
        },
      });
    }

    // Generate onboarding link
    const onboardingUrl =
      await stripeService.createAccountLink(stripeAccountId);

    return res.status(200).json({ url: onboardingUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = createStripeAccountController;
