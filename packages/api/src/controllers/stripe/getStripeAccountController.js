const { db } = require("../../utils/db");
const stripeService = require("../../services/stripeService");
const ApiException = require("../../exceptions/apiException");

const getStripeAccountController = async (req, res, next) => {
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

    if (!org) {
      throw new ApiException("Organização não encontrada", 404);
    }

    if (!org.stripe_account) {
      return res.status(200).json(null);
    }

    // Refresh status from Stripe
    const status = await stripeService.getAccountStatus(
      org.stripe_account.stripe_account_id
    );

    // Update in DB
    const updatedAccount = await db.stripe_account.update({
      where: { id: org.stripe_account.id },
      data: {
        charges_enabled: status.charges_enabled,
        payouts_enabled: status.payouts_enabled,
        details_submitted: status.details_submitted,
      },
    });

    return res.status(200).json(updatedAccount);
  } catch (error) {
    next(error);
  }
};

module.exports = getStripeAccountController;
