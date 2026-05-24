const { db } = require("../../utils/db");
const ApiException = require("../../exceptions/apiException");

const createDonation = async (req, res) => {
  const { organization_id, value } = req.body;
  const donor_id = req.user.publicId;

  // Verificar se o doador existe
  const donor = await db.donor.findUnique({
    where: {
      public_id: donor_id,
    },
  });

  if (!donor) {
    throw new ApiException("Doador não encontrado", 404);
  }

  // Verificar se a organização existe e tem Stripe
  const organization = await db.organization.findUnique({
    where: {
      public_id: organization_id,
    },
    include: {
      stripe_account: true,
    },
  });

  if (!organization) {
    throw new ApiException("Organização não encontrada", 404);
  }

  if (
    !organization.stripe_account ||
    !organization.stripe_account.charges_enabled
  ) {
    throw new ApiException(
      "Esta organização ainda não está habilitada para receber pagamentos",
      400
    );
  }

  // Criar a nova doação com status PENDING
  // O pagamento será processado na etapa de checkout
  const newDonation = await db.donation.create({
    data: {
      donor_id,
      organization_id,
      value: parseFloat(value),
      payment_method: "PIX", // Padrão, será atualizado no checkout
      status: "PENDING",
    },
    include: {
      donor: {
        select: {
          person: {
            select: {
              name: true,
              public_id: true,
            },
          },
        },
      },
      organization: {
        select: {
          name: true,
          public_id: true,
        },
      },
    },
  });

  res.status(201).json(newDonation);
};

module.exports = createDonation;
