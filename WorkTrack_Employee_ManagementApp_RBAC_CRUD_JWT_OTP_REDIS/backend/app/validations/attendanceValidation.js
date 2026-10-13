import Joi from "joi";

export const correctAttendanceValidation = Joi.object({
  status: Joi.string()
    .valid(
      "PRESENT",
      "LATE",
      "HALF_DAY",
      "ABSENT",
      "ON_LEAVE",
    )
    .required(),

  correctionReason: Joi.string()
    .min(3)
    .max(500)
    .required(),
});