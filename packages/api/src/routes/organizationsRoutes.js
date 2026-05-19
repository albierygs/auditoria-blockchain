const { Router } = require("express");
const {
  listAllOrganizations,
  createOrganization,
  deleteOrganization,
  getOrganization,
  updateOrganization,
  listVerifiedOrganizations,
  verifyOrganization,
  listOrganizationMembers,
  listOrganizationVolunteerLogs,
  rejectOrganization,
} = require("../controllers/organizations");
const {
  validateToken,
  authorizeRoles,
  validateParamId,
  validateReqBody,
} = require("../middlewares");
const {
  createOrganizationSchema,
  updateOrganizationSchema,
} = require("../schemas/organizations");

const organizationRoutes = Router({ mergeParams: true });

organizationRoutes.get(
  "/",
  validateToken,
  authorizeRoles(["ADMIN"]),
  listAllOrganizations
);

organizationRoutes.get(
  "/verified",
  validateToken,
  authorizeRoles(["DONOR", "ADMIN"]),
  listVerifiedOrganizations
);

organizationRoutes.put(
  "/:id/verify",
  validateToken,
  authorizeRoles(["ADMIN"]),
  validateParamId("MEMBER_TO_ORGANIZATION"),
  verifyOrganization
);

organizationRoutes.put(
  "/:id/reject",
  validateToken,
  authorizeRoles(["ADMIN"]),
  validateParamId("MEMBER_TO_ORGANIZATION"),
  rejectOrganization
);

organizationRoutes.get(
  "/:id",
  validateToken,
  authorizeRoles(
    ["ADMIN", "ORG_MEMBER"],
    ["ORG_ADMIN", "AUDITOR", "VOLUNTEER"]
  ),
  validateParamId("MEMBER_TO_ORGANIZATION"),
  getOrganization
);

organizationRoutes.post(
  "/create",
  validateReqBody(createOrganizationSchema),
  createOrganization
);

organizationRoutes.put(
  "/:id",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN"]),
  validateParamId("MEMBER_TO_ORGANIZATION"),
  validateReqBody(updateOrganizationSchema),
  updateOrganization
);

organizationRoutes.delete(
  "/:id",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN"]),
  validateParamId("MEMBER_TO_ORGANIZATION"),
  deleteOrganization
);

// Rota para listar membros de uma organização específica
organizationRoutes.get(
  "/:organizationId/members",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN", "AUDITOR"]),
  listOrganizationMembers
);

// Rota para listar volunteer logs de uma organização específica
organizationRoutes.get(
  "/:organizationId/volunteer-logs",
  validateToken,
  authorizeRoles(["ADMIN", "ORG_MEMBER"], ["ORG_ADMIN", "AUDITOR"]),
  listOrganizationVolunteerLogs
);

module.exports = organizationRoutes;
