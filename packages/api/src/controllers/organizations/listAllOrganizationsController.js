const { db } = require("../../utils/db");

const listAllOrganizations = async (req, res) => {
  const { verification_status } = req.query;

  const whereClause = {};

  // Filtrar por verification_status se fornecido
  if (verification_status) {
    whereClause.verification_status = verification_status;
  }

  const organizations = await db.organization.findMany({
    where: whereClause,
    omit: {
      password: true,
      updated_at: true,
      id: true,
    },
  });
  res.status(200).json(organizations);
};

module.exports = listAllOrganizations;
