const { z } = require("zod");

const createDonationSchema = z
  .object({
    organization_id: z
      .uuid("organization_id must be uuid")
      .nonoptional("organization_id required"),
    value: z
      .number("value must be a number")
      .positive("value must be positive")
      .refine(
        (val) =>
          Number(val.toFixed(2)) === val ||
          val.toString().split(".")[1]?.length <= 2,
        { message: "value can have a maximum of 2 decimal places" }
      )
      .nonoptional("value required"),
  })
  .strict();

module.exports = createDonationSchema;
