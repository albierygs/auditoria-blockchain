const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const { errorHandler, unknownEndpoint } = require("./src/middlewares");
const { createProxyMiddleware } = require("http-proxy-middleware");
const webhookRoutes = require("./src/routes/webhookRoutes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_DEV,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

app.use(express.json());

app.use("/api", routes);

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:5173",
    changeOrigin: true,
  })
);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
