const { z } = require("zod");

const baseProjectSchema = z
  .object({
    title: z
      .string("invalid title")
      .min(5, "title min length is 5")
      .max(100, "title max length is 100")
      .transform((value) => {
        return value.trim()[0].toUpperCase() + value.slice(1);
      }),
    description: z
      .string("invalid description")
      .min(20, "description min length is 20")
      .transform((value) => {
        return value.trim()[0].toUpperCase() + value.slice(1);
      }),
    goal_amount: z
      .number({ invalid_type_error: "invalid goal amount" })
      .positive("goal amount must be positive"),
    start_date: z.coerce.date("invalid date format (ISO 8601)"),
    end_date: z.coerce
      .date("invalid date format (ISO 8601)")
      .optional()
      .nullable(),
  })
  .strict();

const createProjectSchema = baseProjectSchema.refine(
  (data) => {
    if (!data.end_date) return true;
    return new Date(data.end_date) > new Date(data.start_date);
  },
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
);

module.exports = { createProjectSchema, baseProjectSchema };
