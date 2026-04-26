const { z } = require("zod");
const ApiException = require("../exceptions/apiException");

const errorHandler = (error, req, res, _next) => {
  if (error instanceof ApiException) {
    res.status(error.statusCode).json({
      name: "custom error",
      message: error.message,
      status: error.statusCode,
      dateTime: new Date().toLocaleString(),
      ip: req.ip,
    });
  } else if (error instanceof z.ZodError) {
    res.status(422).json({
      error: "invalid data",
      messages: error.issues.map((e) => `${e.code}: ${e.message}`),
      status: 422,
      dateTime: new Date().toLocaleString(),
      ip: req.ip,
    });
  } else if (error instanceof Error || error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      status: 500,
      dateTime: new Date().toLocaleString(),
      ip: req.ip,
    });
  }
  return;
};

module.exports = errorHandler;
