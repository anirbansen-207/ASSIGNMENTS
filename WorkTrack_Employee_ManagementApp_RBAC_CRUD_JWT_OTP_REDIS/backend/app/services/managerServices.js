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


export const createEmployeeService = async (
  data,
  managerId,
) => {
  try {
    const existingEmployee = await User.findOne({
      email: data.email,
    });

    if (existingEmployee) {
      throw new Error("Employee already exists");
    }

    const manager = await User.findById(managerId);

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "manager") {
      throw new Error("Only managers can create employees");
    }

    if (!manager.departmentId) {
      throw new Error(
        "Manager is not assigned to a department",
      );
    }

    // Use the department assigned to the logged-in manager.
    // Do not depend on departmentId being sent by the frontend.
    const department = await Department.findById(
      manager.departmentId,
    );

    if (!department || !department.isActive) {
      throw new Error(
        "Your assigned department was not found or is inactive",
      );
    }

    const hashedPwd = await hashedPassword(
      data.password,
    );

    const otp = generateOTP();

    const employee = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPwd,
      role: "employee",
      department: department.name || "",
      departmentId: department._id,
      designation: data.designation || "",
      isVerified: false,
      otp,
      otpExpiry: new Date(
        Date.now() + 30 * 60 * 1000,
      ),
      createdBy: manager._id,
    });

    await sendEmail(
      employee.email,
      "OTP for account verification",
      `Your OTP is ${otp}`,
    );

    return getSafeUser(employee);
  } catch (error) {
    throw new Error(error.message);
  }
};



export const viewAllEmployeeService = async (
  managerId,
) => {
  try {
    const manager = await User.findById(
      managerId,
    );

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "manager") {
      throw new Error(
        "Only managers can view their employees",
      );
    }

    if (!manager.departmentId) {
      throw new Error(
        "Manager is not assigned to a department",
      );
    }

    const employees = await User.find({
      role: "employee",
      createdBy: manager._id,
      departmentId: manager.departmentId,
    })
      .select(
        "name email role department departmentId teamId designation isVerified createdBy",
      )
      .sort({ name: 1 })
      .lean();

    return employees;
  } catch (error) {
    throw new Error(error.message);
  }
};


export const viewSingleEmployeeService =
  async (
    employeeId,
    managerId,
  ) => {
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

      if (!employee.isVerified) {
        throw new Error(
          "Employee is not verified",
        );
      }

      if (
        employee.createdBy.toString() !==
        managerId.toString()
      ) {
        throw new Error(
          "You can only manage your own employee's details",
        );
      }

      const manager =
        await User.findById(
          managerId,
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (!manager.departmentId) {
        throw new Error(
          "Manager is not assigned to a department",
        );
      }

      if (
        !employee.departmentId ||
        employee.departmentId.toString() !==
          manager.departmentId.toString()
      ) {
        throw new Error(
          "You can only manage employees of your department",
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
    managerId,
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
          "User is not an Employee",
        );
      }

      if (!employee.isVerified) {
        throw new Error(
          "Employee is not verified",
        );
      }

      if (
        employee.createdBy.toString() !==
        managerId.toString()
      ) {
        throw new Error(
          "You can only manage your own employee's details",
        );
      }

      const manager =
        await User.findById(
          managerId,
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (!manager.departmentId) {
        throw new Error(
          "Manager is not assigned to a department",
        );
      }

      if (
        !employee.departmentId ||
        employee.departmentId.toString() !==
          manager.departmentId.toString()
      ) {
        throw new Error(
          "You can only manage employees of your department",
        );
      }

      const allowedData = {};

      if (data.name !== undefined) {
        allowedData.name =
          data.name;
      }

      if (data.email !== undefined) {
        allowedData.email =
          data.email;
      }

      if (
        data.designation !==
        undefined
      ) {
        allowedData.designation =
          data.designation;
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

export const assignDepartmentService =
  async (
    employeeId,
    departmentId,
    managerId,
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
          "User is not an Employee",
        );
      }

      if (!employee.isVerified) {
        throw new Error(
          "Employee is not verified",
        );
      }

      if (
        employee.createdBy.toString() !==
        managerId.toString()
      ) {
        throw new Error(
          "You can only manage your own employee's details",
        );
      }

      const manager =
        await User.findById(
          managerId,
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (!manager.departmentId) {
        throw new Error(
          "Manager is not assigned to a department",
        );
      }

      const department =
        await Department.findById(
          departmentId,
        );

      if (!department) {
        throw new Error(
          "Department not found",
        );
      }

      if (
        manager.departmentId.toString() !==
        department._id.toString()
      ) {
        throw new Error(
          "You can only assign employees to your own department",
        );
      }

      employee.departmentId =
        department._id;

      employee.department =
        department.name;

      const updatedEmployee =
        await employee.save();

      return getSafeUser(
        updatedEmployee,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const assignDesignationService =
  async (
    employeeId,
    designation,
    managerId,
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
          "User is not an Employee",
        );
      }

      if (!employee.isVerified) {
        throw new Error(
          "Employee is not verified",
        );
      }

      if (
        employee.createdBy.toString() !==
        managerId.toString()
      ) {
        throw new Error(
          "You can only manage your own employee's details",
        );
      }

      const manager =
        await User.findById(
          managerId,
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (!manager.departmentId) {
        throw new Error(
          "Manager is not assigned to a department",
        );
      }

      if (
        !employee.departmentId ||
        employee.departmentId.toString() !==
          manager.departmentId.toString()
      ) {
        throw new Error(
          "You can only manage employees of your department",
        );
      }

      employee.designation =
        designation;

      const updatedEmployee =
        await employee.save();

      return getSafeUser(
        updatedEmployee,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const deleteEmployeeService =
  async (
    employeeId,
    managerId,
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
          "User is not an Employee",
        );
      }

      if (
        employee.createdBy.toString() !==
        managerId.toString()
      ) {
        throw new Error(
          "You can only manage your own employee's details",
        );
      }

      const manager =
        await User.findById(
          managerId,
        );

      if (!manager) {
        throw new Error(
          "Manager not found",
        );
      }

      if (!manager.departmentId) {
        throw new Error(
          "Manager is not assigned to a department",
        );
      }

      if (
        !employee.departmentId ||
        employee.departmentId.toString() !==
          manager.departmentId.toString()
      ) {
        throw new Error(
          "You can only manage employees of your department",
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