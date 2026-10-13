import {
  viewAllEmployeeService,
  viewSingleEmployeeService,
  updateEmployeeService,
  assignDepartmentService,
  assignDesignationService,
  createEmployeeService,
  deleteEmployeeService,
} from "../services/managerServices.js";

// Create Employee Controller
export const createEmployeeController = async (req, res) => {
  try {
    const data = req.body;

    // req.user._id = logged-in manager ID
    const employee = await createEmployeeService(data, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// View All Employees Controller
export const viewAllEmployeesController = async (req, res) => {
  try {
    // Logged-in manager ID
    const managerId = req.user._id;

    const allEmployees = await viewAllEmployeeService(managerId);

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      allEmployees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// View Single Employee Controller
export const viewSingleEmployeeController = async (req, res) => {
  try {
    // Employee ID from URL
    const { id } = req.params;

    // Logged-in manager ID
    const managerId = req.user._id;

    const singleEmployee = await viewSingleEmployeeService(
      id,
      managerId
    );

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      singleEmployee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Employee Controller
export const updateEmployeeController = async (req, res) => {
  try {
    // Employee ID from URL
    const { id } = req.params;

    // Data sent from frontend
    const data = req.body;

    // Logged-in manager ID
    const managerId = req.user._id;

    const employee = await updateEmployeeService(
      id,
      data,
      managerId
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Assign Department Controller
export const assignDepartmentController = async (req, res) => {
  try {
    // Employee ID from URL
    const { id } = req.params;

    // Department ID from request body
    const { departmentId } = req.body;

    // Logged-in manager ID
    const managerId = req.user._id;

    const employee = await assignDepartmentService(
      id,
      departmentId,
      managerId
    );

    return res.status(200).json({
      success: true,
      message: "Department assigned successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Assign Designation Controller
export const assignDesignationController = async (req, res) => {
  try {
    // Employee ID from URL
    const { id } = req.params;

    // Designation from request body
    const { designation } = req.body;

    // Logged-in manager ID
    const managerId = req.user._id;

    const employee = await assignDesignationService(
      id,
      designation,
      managerId
    );

    return res.status(200).json({
      success: true,
      message: "Designation assigned successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Employee Controller
export const deleteEmployeeController = async (req, res) => {
  try {
    // Employee ID from URL
    const { id } = req.params;

    // Logged-in manager ID
    const managerId = req.user._id;

    const deletedEmployee = await deleteEmployeeService(
      id,
      managerId
    );

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      deletedEmployee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};