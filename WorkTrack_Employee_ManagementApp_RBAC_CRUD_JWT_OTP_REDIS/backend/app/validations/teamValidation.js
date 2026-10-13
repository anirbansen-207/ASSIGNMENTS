
import Joi from "joi";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createTeamValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  description: Joi.string().max(200).allow("").optional(),

  managerId: Joi.string().hex().length(24).optional(),

  checkInTime: Joi.string()
    .pattern(timePattern)
    .required()
    .messages({
      "string.pattern.base":
        "Shift start time must use HH:mm format",
    }),

  checkOutTime: Joi.string()
    .pattern(timePattern)
    .required()
    .messages({
      "string.pattern.base":
        "Shift end time must use HH:mm format",
    }),
});

export const updateTeamValidation = Joi.object({
  name: Joi.string().min(2).max(50).optional(),

  description: Joi.string().max(200).allow("").optional(),

  checkInTime: Joi.string()
    .pattern(timePattern)
    .optional()
    .messages({
      "string.pattern.base":
        "Shift start time must use HH:mm format",
    }),

  checkOutTime: Joi.string()
    .pattern(timePattern)
    .optional()
    .messages({
      "string.pattern.base":
        "Shift end time must use HH:mm format",
    }),
}).min(1);
