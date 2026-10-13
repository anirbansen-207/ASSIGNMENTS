import Joi from "joi";

export const createTaskValidation = Joi.object({
  title: Joi.string()
    .min(2)
    .max(100)
    .required(),

  description: Joi.string()
    .max(1000)
    .allow("")
    .optional(),

  teamId: Joi.string()
    .hex()
    .length(24)
    .required(),

  assignedTo: Joi.string()
    .hex()
    .length(24)
    .required(),

  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "URGENT")
    .default("MEDIUM"),

  startDate: Joi.date()
    .iso()
    .required(),

  dueDate: Joi.date()
    .iso()
    .required(),

  estimatedHours: Joi.number()
    .min(0)
    .optional(),
});


export const updateTaskValidation = Joi.object({
  title: Joi.string()
    .min(2)
    .max(100)
    .optional(),

  description: Joi.string()
    .max(1000)
    .allow("")
    .optional(),

  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "URGENT")
    .optional(),

  startDate: Joi.date()
    .iso()
    .optional(),

  dueDate: Joi.date()
    .iso()
    .optional(),

  estimatedHours: Joi.number()
    .min(0)
    .optional(),

  actualHours: Joi.number()
    .min(0)
    .optional(),
}).min(1);


export const updateProgressValidation = Joi.object({
  progress: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .required(),

  actualHours: Joi.number()
    .min(0)
    .optional(),
});


export const updateStatusValidation = Joi.object({
  status: Joi.string()
    .valid(
      "ACCEPTED",
      "IN_PROGRESS",
      "BLOCKED",
      "IN_REVIEW",
      "COMPLETED",
    )
    .required(),
});