const { db } = require("../../utils/db");
const stripeService = require("../../services/stripeService");
const ApiException = require("../../exceptions/ApiException");

const createStripeLoginLinkController = async (req, res, next) => {
  try {
    const public_id = req.user.publicId;

    const member = await db.organization_member.findUnique({
      where: {
        public_id,
      },
      select: {
        organization_id: true,
      },
    });

    // Verify organization and Stripe account
    const org = await db.organization.findUnique({
      where: { public_id: member.organization_id },
      include: { stripe_account: true },
    });

    if (!org || !org.stripe_account) {
      throw new ApiException(
        "Organização não possui conta Stripe conectada",
        400
      );
    }

    const loginUrl = await stripeService.createLoginLink(
      org.stripe_account.stripe_account_id
    );

    return res.status(200).json({ url: loginUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = createStripeLoginLinkController;
