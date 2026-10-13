import User from "../models/User.js";

const getSafeUser = (user) => {
  if (!user) {
    return user;
  }

  const userObject = user.toObject
    ? user.toObject()
    : { ...user };

  delete userObject.password;
  delete userObject.otp;
  delete userObject.otpExpiry;

  return userObject;
};

export const viewOwnProfileService =
  async (employeeId) => {
    try {
      const employee =
        await User.findById(
          employeeId,
        ).select(
          "-password -otp -otpExpiry",
        );

      if (!employee) {
        throw new Error(
          "Employee not found",
        );
      }

      if (employee.role !== "employee") {
        throw new Error(
          "Only employees can access this profile",
        );
      }

      return employee;
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const updateOwnProfileService =
  async (
    employeeId,
    data,
  ) => {
    try {
      const employee =
        await User.findById(
          employeeId,
        );

      if (!employee) {
        throw new Error(
          "Employee not found",
        );
      }

      if (employee.role !== "employee") {
        throw new Error(
          "Only employees can update this profile",
        );
      }

      const allowedData = {};

      if (data.name !== undefined) {
        allowedData.name =
          data.name;
      }

      if (data.email !== undefined) {
        const existingUser =
          await User.findOne({
            email: data.email,
            _id: {
              $ne: employeeId,
            },
          });

        if (existingUser) {
          throw new Error(
            "Email is already in use",
          );
        }

        allowedData.email =
          data.email;
      }

      const updatedEmployee =
        await User.findByIdAndUpdate(
          employeeId,
          allowedData,
          {
            new: true,
            runValidators: true,
          },
        ).select(
          "-password -otp -otpExpiry",
        );

      return getSafeUser(
        updatedEmployee,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };