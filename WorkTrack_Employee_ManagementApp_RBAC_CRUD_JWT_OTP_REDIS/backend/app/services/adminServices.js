import User from "../models/User.js";
import hashedPassword from "../utils/hashedPassword.js";
import sendEmail from "../utils/sendMail.js";
import generateOTP from "../utils/generateOTP.js";
import Department from "../models/Department.js";

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

const sanitizeManagerData = async (data) => {
  const allowedData = {};

  if (data.name !== undefined) {
    allowedData.name = data.name;
  }

  if (data.email !== undefined) {
    allowedData.email = data.email;
  }

  if (data.designation !== undefined) {
    allowedData.designation =
      data.designation;
  }

  if (data.department !== undefined) {
    allowedData.department =
      data.department;
  }

  if (data.departmentId !== undefined) {
    const department =
      await Department.findOne({
        _id: data.departmentId,
        isActive: true,
      });

    if (!department) {
      throw new Error(
        "Department not found",
      );
    }

    allowedData.departmentId =
      department._id;

    allowedData.department =
      department.name;
  }

  return allowedData;
};

const sanitizeEmployeeData = async (
  data,
) => {
  const allowedData = {};

  if (data.name !== undefined) {
    allowedData.name = data.name;
  }

  if (data.email !== undefined) {
    allowedData.email = data.email;
  }

  if (data.designation !== undefined) {
    allowedData.designation =
      data.designation;
  }

  if (data.department !== undefined) {
    allowedData.department =
      data.department;
  }

  if (data.departmentId !== undefined) {
    const department =
      await Department.findOne({
        _id: data.departmentId,
        isActive: true,
      });

    if (!department) {
      throw new Error(
        "Department not found",
      );
    }

    allowedData.departmentId =
      department._id;

    allowedData.department =
      department.name;
  }

  return allowedData;
};

export const createManagerService =
  async (data, adminId) => {
    try {
      const existingManager =
        await User.findOne({
          email: data.email,
        });

      if (existingManager) {
        throw new Error(
          "User with this email already exists",
        );
      }

      const department =
        await Department.findOne({
          _id: data.departmentId,
          isActive: true,
        });

      if (!department) {
        throw new Error(
          "Department not found",
        );
      }

      const hashedPwd =
        await hashedPassword(
          data.password,
        );

      const otp =
        generateOTP();

      const manager =
        await User.create({
          name: data.name,
          email: data.email,
          password: hashedPwd,
          role: "manager",
          department:
            department.name,
          departmentId:
            department._id,
          designation:
            data.designation || "",
          isVerified: false,
          otp,
          otpExpiry:
            new Date(
              Date.now() +
                30 *
                  60 *
                  1000,
            ),
          createdBy: adminId,
        });

      await sendEmail(
        manager.email,
        "OTP for Verification",
        `Your OTP is ${otp}`,
      );

      return getSafeUser(
        manager,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const updateManagerService =
  async (
    managerId,
    data,
  ) => {
    try {
      const manager =
        await User.findById(
          managerId,
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (manager.role !== "manager") {
        throw new Error(
          "User is not a Manager",
        );
      }

      if (data.email !== undefined) {
        const existingUser =
          await User.findOne({
            email: data.email,
            _id: {
              $ne: managerId,
            },
          });

        if (existingUser) {
          throw new Error(
            "Email is already in use",
          );
        }
      }

      const allowedData =
        await sanitizeManagerData(
          data,
        );

      return await User.findByIdAndUpdate(
        managerId,
        allowedData,
        {
          new: true,
          runValidators: true,
        },
      ).select(
        "-password -otp -otpExpiry",
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const deleteManagerService =
  async (
    managerId,
    currentUser,
  ) => {
    try {
      const manager =
        await User.findById(
          managerId,
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (currentUser.role !== "admin") {
        throw new Error(
          "You are not authorized to delete this manager",
        );
      }

      if (manager.role !== "manager") {
        throw new Error(
          "User is not a Manager",
        );
      }

      const deletedManager =
        await User.findByIdAndDelete(
          managerId,
        );

      return getSafeUser(
        deletedManager,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const viewAllUsersService =
  async () => {
    try {
      return await User.find().select(
        "-password -otp -otpExpiry",
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const viewSingleManagerService =
  async (managerId) => {
    try {
      const manager =
        await User.findById(
          managerId,
        ).select(
          "-password -otp -otpExpiry",
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (manager.role !== "manager") {
        throw new Error(
          "User is not a Manager",
        );
      }

      return manager;
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const viewSingleEmployeeService =
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
          "User is not an Employee",
        );
      }

      return employee;
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const updateEmployeeService =
  async (
    employeeId,
    data,
    currentUser,
  ) => {
    try {
      if (
        currentUser.role !== "admin"
      ) {
        throw new Error(
          "You are not authorized to update this employee",
        );
      }

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
          "User is not an Employee",
        );
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
      }

      const allowedData =
        await sanitizeEmployeeData(
          data,
        );

      return await User.findByIdAndUpdate(
        employeeId,
        allowedData,
        {
          new: true,
          runValidators: true,
        },
      ).select(
        "-password -otp -otpExpiry",
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const deleteEmployeeService =
  async (
    employeeId,
    currentUser,
  ) => {
    try {
      if (
        currentUser.role !== "admin"
      ) {
        throw new Error(
          "You are not authorized to delete this employee",
        );
      }

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
          "User is not an Employee",
        );
      }

      const deletedEmployee =
        await User.findByIdAndDelete(
          employeeId,
        );

      return getSafeUser(
        deletedEmployee,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };