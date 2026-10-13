import {
  viewOwnProfileService,
  updateOwnProfileService,
  
} from "../services/employeeServices.js";

// view own profile controller
export const viewOwnProfileController = async (req, res) => {
  try {
    // Fetching employee profile
    const employeeProfile = await viewOwnProfileService(req.user._id); //req.user._id comes from authMiddleware

    // returning employee profile
    return res.status(200).json({
      success: true,
      message: "Employee profile fetched successfully",
      employeeProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update own profile controller
export const updateOwnProfileController = async (req, res) => {
  try {
    // Body data
    const data = req.body;

    // call updateEmployeeService
    const updatedEmployee = await updateOwnProfileService(req.user._id, data);

    // return employee
    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      updatedEmployee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
