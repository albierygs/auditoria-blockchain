const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const { errorHandler, unknownEndpoint } = require("./src/middlewares");
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
      // Em produção, se a variável não estiver setada, pode dar problema, então deixamos mais flexível ou logamos
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
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

if (process.env.NODE_ENV !== "production") {
  const { createProxyMiddleware } = require("http-proxy-middleware");
  app.use(
    "/",
    createProxyMiddleware({
      target: "http://localhost:5173",
      changeOrigin: true,
    })
  );
} else {
  // Retorna uma mensagem de saúde básica para a raiz em produção
  app.get("/", (req, res) => {
    res.status(200).json({ status: "API is running on Serverless Vercel" });
  });
}

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
