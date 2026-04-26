const { PrismaClient } = require("../../generated/prisma");
const { DATABASE_URL } = require("./constants");

const db = new PrismaClient({ datasourceUrl: DATABASE_URL });

module.exports = {
  db,
};
