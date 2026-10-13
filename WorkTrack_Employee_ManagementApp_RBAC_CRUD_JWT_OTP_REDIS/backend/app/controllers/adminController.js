import {
  createManagerService,
  updateManagerService,
  deleteManagerService,
  viewAllUsersService,
  deleteEmployeeService,
  updateEmployeeService,
  viewSingleManagerService,
  viewSingleEmployeeService
} from "../services/adminServices.js";

// create manager controller
export const createManagerController = async (req, res) => {
  try {
    // Body data
    const data = req.body;

    // call createManagerService
    const manager = await createManagerService(data, req.user._id);

    // return manager
    return res.status(201).send({
      success: true,
      message: "Manager created successfully",
      manager,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

// view single manager controller
export const viewSingleManagerController = async (req, res) => {
  try {
    // destructuring id from params
    const { id } = req.params;

    // call viewSingleManagerService
    const manager = await viewSingleManagerService(id);

    // return manager
    return res.status(200).send({
      success: true,
      message: "Manager fetched successfully",
      manager,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

// update manager controller
export const updateManagerController = async (req, res) => {
  try {
    // Body data
    const data = req.body;

    // destructuring id from params
    const { id } = req.params;

    // call updateManagerService
    const updatedManager = await updateManagerService(id, data);

    // return manager
    return res.status(200).send({
      success: true,
      message: "Manager updated successfully",
      updatedManager,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

// delete manager controller
export const deleteManagerController = async (req, res) => {
  try {
    // destructuring id from params
    const { id } = req.params;

    // call deleteManagerService
    const deletedManager = await deleteManagerService(id, req.user);

    // return manager
    return res.status(200).send({
      success: true,
      message: "Manager deleted successfully",
      deletedManager,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

// view all users controller
export const viewAllUsersController = async (req, res) => {
  try {
    // call viewAllUsersService
    const users = await viewAllUsersService();

    // return users
    return res.status(200).send({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

// View single employee controller
export const viewSingleEmployeeController = async (req, res) => {
  try {
    // destructuring id from params
    const { id } = req.params;

    // call viewSingleEmployeeService
    const employee = await viewSingleEmployeeService(id);

    // return employee
    return res.status(200).send({
      success: true,
      message: "Employee fetched successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
}
// Update employee controller
export const updateEmployeeController = async (req, res) => {
  try {
    // Body data
    const data = req.body;

    // destructuring id from params
    const { id } = req.params;

    // call updateEmployeeService
    const updatedEmployee = await updateEmployeeService(id, data, req.user);

    // return employee
    return res.status(200).send({
      success: true,
      message: "Employee updated successfully",
      updatedEmployee,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

// Delete employee controller
export const deleteEmployeeController = async (req, res) => {
  try {
    // destructuring id from params
    const { id } = req.params;

    // call deleteEmployeeService
    const deletedEmployee = await deleteEmployeeService(id, req.user);

    // return employee
    return res.status(200).send({
      success: true,
      message: "Employee deleted successfully",
      deletedEmployee,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
