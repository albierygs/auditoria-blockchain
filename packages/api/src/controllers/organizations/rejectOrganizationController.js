const { db } = require("../../utils/db");


const rejectOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await db.organization.findUnique({
      where: { public_id: id },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organização não encontrada." });
    }

    // Atualiza a organização para inativa e não verificada
    const updatedOrganization = await db.organization.update({
      where: { public_id: id },
      data: {
        status: "INACTIVE",
        verified: false,
      },
    });

    return res.status(200).json({
      message: "Organização reprovada com sucesso.",
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error("Erro ao reprovar organização:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

module.exports = { rejectOrganization };