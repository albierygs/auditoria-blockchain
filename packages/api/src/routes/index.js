const { Router } = require("express");
const helloRoute = require("./helloRoute");
const donorsRoute = require("./donorsRoutes");
const authRotes = require("./authRoutes");
const membersRoutes = require("./membersRoutes");
const organizationsRoutes = require("./organizationsRoutes");
const { validateToken } = require("../middlewares");
const { projectsRoutes, singleProjectRoutes } = require("./projectsRoutes");
const {
  projectExpensesRoutes,
  singleExpenseRoutes,
} = require("./expensesRoutes");
const {
  volunteerLogsRoutes,
  globalVolunteerLogsRoutes,
} = require("./volunteerLogsRoutes");
const donationsRoutes = require("./donationsRoutes");
const blockchainRoutes = require("./blockchainRoutes");
const allocationsRoutes = require("./allocationsRoutes");
const stripeRoutes = require("./stripeRoutes");
const { listAllStatusHistory } = require("../controllers/statusHistory");

const routes = Router({ mergeParams: true });

routes.use("/", helloRoute);
routes.use("/auth", authRotes);
routes.use("/donors", donorsRoute);
routes.use("/members", membersRoutes);
routes.use("/allocations", allocationsRoutes);
routes.use("/organizations", organizationsRoutes);
routes.use("/organizations/:id/projects", projectsRoutes);
routes.use("/projects", singleProjectRoutes);
routes.use("/projects/:id/expenses", projectExpensesRoutes);
routes.use("/expenses", singleExpenseRoutes);
routes.use("/members/:memberId/volunteer-logs", volunteerLogsRoutes);
routes.use("/volunteer-logs", globalVolunteerLogsRoutes);
routes.get("/status-history", validateToken, listAllStatusHistory);
routes.use("/donations", donationsRoutes);
routes.use("/blockchain", blockchainRoutes);
routes.use("/stripe", stripeRoutes);

module.exports = routes;
