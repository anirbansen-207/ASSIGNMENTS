import Joi from "joi";

// Create department validation
export const createDepartmentValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  description: Joi.string().max(200).allow("").optional(),
});

// Update department validation
export const updateDepartmentValidation = Joi.object({
  name: Joi.string().min(2).max(50).optional(),

  description: Joi.string().max(200).allow("").optional(),
}).min(1);