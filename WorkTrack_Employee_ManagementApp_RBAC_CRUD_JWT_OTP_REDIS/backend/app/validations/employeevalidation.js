import Joi from "joi";

// Update employee validation schema
export const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(2),
  department: Joi.string().min(2),
  designation: Joi.string().min(2),
});