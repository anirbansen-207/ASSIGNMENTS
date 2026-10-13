import Joi from "joi";

export const createTaskCommentValidation = Joi.object({
  comment: Joi.string()
    .min(1)
    .max(1000)
    .required(),
});