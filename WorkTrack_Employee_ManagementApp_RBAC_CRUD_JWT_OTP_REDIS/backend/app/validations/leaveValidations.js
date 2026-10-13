
import Joi from "joi";

export const createLeaveValidation = Joi.object({
  leaveType: Joi.string()
    .valid("CASUAL", "SICK", "EARNED", "UNPAID")
    .required(),

  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),

  reason: Joi.string().min(3).max(500).required(),
});

export const reviewLeaveValidation = Joi.object({
  status: Joi.string()
    .valid("APPROVED", "REJECTED")
    .required(),

  rejectionReason: Joi.when("status", {
    is: "REJECTED",
    then: Joi.string().min(3).max(500).required(),
    otherwise: Joi.string().allow("").optional(),
  }),
});

// Retained for compatibility with any existing code still importing it.
// Department policies use departmentLeavePolicyValidation below.
export const leaveBalanceValidation = Joi.object({
  employeeId: Joi.string().hex().length(24).required(),

  leaveType: Joi.string()
    .valid("CASUAL", "SICK", "EARNED", "UNPAID")
    .required(),

  totalDays: Joi.number().integer().min(0).required(),
});

// Validates the department-level policy sent by the admin UI.
export const departmentLeavePolicyValidation = Joi.object({
  departmentId: Joi.string().hex().length(24).required(),

  leaveTypes: Joi.array()
    .items(
      Joi.object({
        leaveType: Joi.string()
          .valid("CASUAL", "SICK", "EARNED", "UNPAID")
          .required(),

        totalDays: Joi.number()
          .min(0)
          .precision(2)
          .required(),
      }).unknown(false),
    )
    .min(1)
    .unique("leaveType")
    .required(),
}).unknown(false);
