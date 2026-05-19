const createOrganization = require("./createOrganizationController");
const deleteOrganization = require("./deleteOrganizationController");
const getOrganization = require("./getOrganizationController");
const listAllOrganizations = require("./listAllOrganizationsController");
const listOrganizationMembers = require("./listOrganizationMembersController");
const listOrganizationVolunteerLogs = require("./listOrganizationVolunteerLogsController");
const listVerifiedOrganizations = require("./listVerifiedOrganizations");
const { rejectOrganization } = require("./rejectOrganizationController");
const updateOrganization = require("./updateOrganizationController");
const verifyOrganization = require("./verifyOrganizationController");

module.exports = {
  createOrganization,
  getOrganization,
  listAllOrganizations,
  listVerifiedOrganizations,
  updateOrganization,
  deleteOrganization,
  verifyOrganization,
  listOrganizationMembers,
  listOrganizationVolunteerLogs,
  rejectOrganization
};
