import {
  createDepartmentService,
  viewAllDepartmentsService,
  viewSingleDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
} from "../services/departmentServices.js";

// Create department
export const createDepartmentController = async (req, res) => {
  try {
    // Body data
    const data = req.body;

    // Create department
    const department = await createDepartmentService(
      data,
      req.user._id,
    );

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// View all departments
export const viewAllDepartmentsController = async (req, res) => {
  try {
    // Get all departments
    const departments = await viewAllDepartmentsService();

    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// View single department
export const viewSingleDepartmentController = async (req, res) => {
  try {
    // Get department ID from URL
    const { id } = req.params;

    // Find department
    const department = await viewSingleDepartmentService(id);

    return res.status(200).json({
      success: true,
      message: "Department fetched successfully",
      department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update department
export const updateDepartmentController = async (req, res) => {
  try {
    // Get department ID from URL
    const { id } = req.params;

    // Body data
    const data = req.body;

    // Update department
    const updatedDepartment = await updateDepartmentService(
      id,
      data,
    );

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      updatedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete department
export const deleteDepartmentController = async (req, res) => {
  try {
    // Get department ID from URL
    const { id } = req.params;

    // Delete department
    const deletedDepartment = await deleteDepartmentService(id);

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      deletedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};