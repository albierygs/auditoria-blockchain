const { z } = require("zod");
const { baseProjectSchema } = require("./createProjectSchema");

const updateProjectSchema = baseProjectSchema
  .extend({
    // Adiciona o campo de status
    status: z
      .enum(["DRAFT", "ACTIVE", "PAUSED", "FINISHED", "CANCELLED"], {
        error: "invalid status",
      })
      .optional(),
  })
  .partial()
  .refine(
    (data) => {
      if (!data.end_date || !data.start_date) return true;
      return new Date(data.end_date) > new Date(data.start_date);
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

module.exports = updateProjectSchema;
