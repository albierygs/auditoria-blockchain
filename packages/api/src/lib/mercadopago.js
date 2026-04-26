const { MercadoPagoConfig } = require("mercadopago");
const { MERCADO_PAGO_ACCESS_TOKEN } = require("../utils/constants");

const mercadopagoClient = new MercadoPagoConfig({
  accessToken: MERCADO_PAGO_ACCESS_TOKEN,
});

module.exports = mercadopagoClient;
