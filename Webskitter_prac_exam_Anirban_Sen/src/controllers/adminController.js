import * as adminService from "../services/adminService.js";

export const getUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user._id
    );

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await adminService.blockUser(
      req.params.id,
      req.body.isBlocked,
      req.user._id
    );

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await adminService.getAdminRestaurants();

    return res.status(200).json({ success: true, restaurants });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await adminService.getAdminOrders();

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const statistics = await adminService.getStatistics();

    return res.status(200).json({ success: true, statistics });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};