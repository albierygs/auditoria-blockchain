const { db } = require("../../utils/db");
const ApiException = require("../../exceptions/apiException");
const { sendOrganizationVerifiedEmail } = require("../../utils/emailService");

const verifyOrganization = async (req, res) => {
  const organizationId = req.params.id;

  // Buscar organização
  const existingOrganization = await db.organization.findUnique({
    where: {
      public_id: organizationId,
    },
  });

  if (!existingOrganization) {
    throw new ApiException("Organização não encontrada", 404);
  }

  if (existingOrganization.verified) {
    throw new ApiException("Organização já foi verificada", 400);
  }

  // Buscar o admin (membro ORG_ADMIN) da organização
  const adminMember = await db.organization_member.findFirst({
    where: {
      organization_id: organizationId,
      role: "ORG_ADMIN",
    },
    include: {
      person: {
        select: {
          public_id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!adminMember) {
    throw new ApiException("Admin da organização não encontrado", 404);
  }

  // Atualizar organização como verificada
  const updatedOrganization = await db.organization.update({
    where: {
      public_id: organizationId,
    },
    data: {
      verified: true,
      verification_status: "APPROVED",
      verified_at: new Date(),
      verified_by: req.user.publicId,
      rejection_reason: null, // Limpar qualquer razão de rejeição anterior
    },
    select: {
      public_id: true,
      name: true,
      email: true,
      verified: true,
      verification_status: true,
      verified_at: true,
    },
  });

  await db.organization_member.update({
    where: {
      public_id: adminMember.public_id,
    },
    data: {
      status: "ACTIVE",
    },
  });

  await db.organization_membership.updateMany({
    where: {
      member_id: adminMember.public_id,
      organization_id: organizationId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  sendOrganizationVerifiedEmail(
    updatedOrganization.name,
    adminMember.person.email,
    adminMember.member_code
  );

  res.status(200).json({
    message: "Organização verificada com sucesso",
    organization: updatedOrganization,
    note: "Email com credenciais foi enviado para o admin da organização",
  });
};

module.exports = verifyOrganization;
