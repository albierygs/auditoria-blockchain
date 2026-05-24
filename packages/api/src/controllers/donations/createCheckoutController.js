const { db } = require("../../utils/db");
const ApiException = require("../../exceptions/apiException");
const stripeService = require("../../services/stripeService");

const createCheckout = async (req, res) => {
  const { donationId } = req.params;
  const donorId = req.user.publicId;

  // Buscar a doação
  const donation = await db.donation.findUnique({
    where: { public_id: donationId },
    include: {
      organization: {
        include: {
          stripe_account: true,
        },
      },
      donor: {
        include: {
          person: true,
        },
      },
    },
  });

  if (!donation) {
    throw new ApiException("Doação não encontrada", 404);
  }

  if (donation.donor_id !== donorId) {
    throw new ApiException("Você não tem permissão para processar esta doação", 403);
  }

  if (donation.status !== "PENDING") {
    throw new ApiException(
      `Esta doação já foi processada (status: ${donation.status})`,
      400
    );
  }

  // Verificar conta Stripe da organização
  const stripeAccount = donation.organization.stripe_account;
  if (!stripeAccount || !stripeAccount.charges_enabled) {
    throw new ApiException(
      "A organização não possui conta Stripe habilitada para receber pagamentos",
      400
    );
  }

  try {
    // Criar a sessão de checkout na Stripe
    const session = await stripeService.createCheckoutSession(
      parseFloat(donation.value),
      "BRL",
      donation.public_id,
      donation.organization.name,
      stripeAccount.stripe_account_id,
      donation.donor.person.email
    );

    // Salvar a transação Stripe pendente
    await db.stripe_transaction.create({
      data: {
        donation_id: donation.public_id,
        stripe_checkout_session_id: session.id,
        amount: parseFloat(donation.value),
        currency: "BRL",
        status: session.payment_status || "unpaid",
      },
    });

    // Atualizar método de pagamento (poderia deixar genérico até confirmar, mas STRIPE é padrão)
    await db.donation.update({
      where: { public_id: donation.public_id },
      data: { payment_gateway: "STRIPE" },
    });

    // Retornar a URL da sessão de checkout hospedada pela Stripe
    res.status(200).json({ url: session.url });
  } catch (error) {
    if (error instanceof ApiException) throw error;

    console.error("Erro ao processar checkout Stripe:", error.message);
    throw new ApiException(
      "Erro ao iniciar o processo de pagamento. Tente novamente.",
      500
    );
  }
};

module.exports = createCheckout;
