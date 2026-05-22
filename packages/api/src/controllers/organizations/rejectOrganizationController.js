const { db } = require("../../utils/db");

const rejectOrganization = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body; // Adicionar razão de rejeição

  try {
    const organization = await db.organization.findUnique({
      where: { public_id: id },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organização não encontrada." });
    }

    // Atualiza a organização como reprovada
    const updatedOrganization = await db.organization.update({
      where: { public_id: id },
      data: {
        verification_status: "REJECTED",
        rejected_at: new Date(),
        rejected_by: req.user.publicId,
        rejection_reason: reason || null,
        verified: false, // Mantém verified como false para indicar que não foi aprovada
        // Mantém status ACTIVE para permitir re-análise
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
