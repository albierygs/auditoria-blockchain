const { db } = require("../../utils/db");

const listVerifiedOrganizations = async (_req, res) => {
  const organizations = await db.organization.findMany({
    where: {
      verified: true,
      status: "ACTIVE",
      // Somente organizações com conta Stripe habilitada para pagamentos
      stripe_account: {
        charges_enabled: true,
      },
    },
    omit: {
      password: true,
      created_at: true,
      updated_at: true,
      status: true,
      id: true,
    },
    include: {
      stripe_account: {
        select: {
          charges_enabled: true,
        },
      },
    },
  });
  res.status(200).json(organizations);
};

module.exports = listVerifiedOrganizations;
