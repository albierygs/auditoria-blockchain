const axios = require("axios");
const { PAGBANK_API_URL, PAGBANK_TOKEN } = require("../utils/constants");

const pagbankClient = axios.create({
  baseURL: PAGBANK_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${PAGBANK_TOKEN}`,
  },
});

const pagbankRequest = async (method, endpoint, data = {}) => {
  pagbankClient.defaults.method = method;
  const response = await pagbankClient(endpoint, { data });
  return response.data;
};

module.exports = {
  pagbankRequest,
};
