const { Router } = require("express");
const {
  validateToken,
  authorizeRoles,
  validateReqBody,
} = require("../middlewares");
const {
  listDonations,
  getDonation,
  createDonation,
  updateDonation,
  createCheckout,
} = require("../controllers/donations");
const {
  createDonationSchema,
  updateDonationSchema,
  checkoutSchema,
} = require("../schemas/donations");
const statusHistoryRoutes = require("./statusHistoryRoutes");

const donationsRoutes = Router({ mergeParams: true });

// Rota para listar todas as doações
donationsRoutes.get(
  "/",
  validateToken,
  authorizeRoles(["ADMIN", "DONOR", "ORG_MEMBER"], ["ORG_ADMIN", "AUDITOR"]),
  listDonations
);

// Rota para obter uma doação específica
donationsRoutes.get(
  "/:donationId",
  validateToken,
  authorizeRoles(["ADMIN", "DONOR", "ORG_MEMBER"], ["ORG_ADMIN", "AUDITOR"]),
  getDonation
);

// Rota para criar uma nova doação
donationsRoutes.post(
  "/",
  validateToken,
  authorizeRoles(["DONOR"]),
  validateReqBody(createDonationSchema),
  createDonation
);

// Rota para processar checkout/pagamento de uma doação
donationsRoutes.post(
  "/:donationId/checkout",
  validateToken,
  authorizeRoles(["DONOR"]),
  createCheckout
);

// Rota para atualizar uma doação (confirmar, cancelar, etc.)
donationsRoutes.put(
  "/:donationId",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN"]),
  validateReqBody(updateDonationSchema),
  updateDonation
);

// Rotas de histórico de status para doações
donationsRoutes.use(
  "/:donationId/status-history",
  (req, res, next) => {
    res.locals.entityId = req.params.donationId;
    res.locals.entityType = "DONATION";
    next();
  },
  statusHistoryRoutes
);

module.exports = donationsRoutes;
