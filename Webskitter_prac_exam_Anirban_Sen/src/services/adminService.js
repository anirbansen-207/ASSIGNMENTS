import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";

export const getAllUsers = async () => {
  return User.find().select("-password");
};

export const updateUserRole = async (userId, role, currentAdminId) => {
  if (String(userId) === String(currentAdminId)) {
    throw new Error("You cannot change your own role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      role,
      $inc: { tokenVersion: 1 }
    },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) throw new Error("User not found");

  return user;
};

export const blockUser = async (userId, isBlocked, currentAdminId) => {
  if (String(userId) === String(currentAdminId)) {
    throw new Error("You cannot block your own account");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isBlocked,
      $inc: { tokenVersion: 1 }
    },
    { new: true }
  ).select("-password");

  if (!user) throw new Error("User not found");

  return user;
};

export const getAdminRestaurants = async () => {
  return Restaurant.find().populate("owner", "name email");
};

export const getAdminOrders = async () => {
  return Order.find()
    .populate("user", "name email")
    .populate("restaurant", "name")
    .sort({ createdAt: -1 });
};

export const getStatistics = async () => {
  const [
    totalUsers,
    totalRestaurants,
    totalOrders,
    deliveredOrders
  ] = await Promise.all([
    User.countDocuments(),
    Restaurant.countDocuments(),
    Order.countDocuments(),
    Order.find({ status: "delivered" }).select("totalAmount")
  ]);

  const totalRevenue = deliveredOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  return {
    totalUsers,
    totalRestaurants,
    totalOrders,
    deliveredOrders: deliveredOrders.length,
    totalRevenue
  };
};