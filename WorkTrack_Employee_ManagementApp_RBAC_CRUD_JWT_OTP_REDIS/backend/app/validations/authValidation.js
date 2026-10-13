import Joi from "joi";

export const registerValidation =
  Joi.object({
    name: Joi.string()
      .min(2)
      .required(),

    email: Joi.string()
      .email()
      .required(),

    password: Joi.string()
      .min(6)
      .required(),

    department: Joi.string()
      .min(2)
      .required(),

    designation: Joi.string()
      .min(2)
      .required(),
  });

export const loginValidation =
  Joi.object({
    email: Joi.string()
      .email()
      .required(),

    password: Joi.string()
      .min(6)
      .required(),
  });

export const otpValidation =
  Joi.object({
    email: Joi.string()
      .email()
      .required(),

    otp: Joi.string()
      .required(),
  });

export const forgotPasswordValidation =
  Joi.object({
    email: Joi.string()
      .email()
      .required(),
  });

export const resetPasswordValidation =
  Joi.object({
    email: Joi.string()
      .email()
      .required(),

    otp: Joi.string()
      .required(),

    password: Joi.string()
      .min(6)
      .required(),
  });