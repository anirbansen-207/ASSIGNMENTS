import Cart from "../models/cart.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

export const createOrder = async (userId, deliveryAddress) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  const restaurant = await Restaurant.findOne({
    _id: cart.restaurant,
    isActive: true
  });

  if (!restaurant) {
    throw new Error("Restaurant is unavailable");
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cart.items) {
    const food = await Food.findOne({
      _id: cartItem.food,
      restaurant: cart.restaurant,
      isAvailable: true
    });

    if (!food) {
      throw new Error("A food item in your cart is unavailable");
    }

    const itemTotal = food.price * cartItem.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      food: food._id,
      name: food.name,
      price: food.price,
      quantity: cartItem.quantity
    });
  }

  const order = await Order.create({
    user: userId,
    restaurant: cart.restaurant,
    items: orderItems,
    totalAmount,
    deliveryAddress
  });

  cart.items = [];
  cart.restaurant = null;
  await cart.save();

  return order;
};

export const getMyOrders = async (userId) => {
  return Order.find({ user: userId })
    .populate("restaurant", "name address")
    .sort({ createdAt: -1 });
};

export const getRestaurantOrders = async (ownerId) => {
  const restaurants = await Restaurant.find({
    owner: ownerId
  }).select("_id");

  const restaurantIds = restaurants.map((item) => item._id);

  return Order.find({
    restaurant: { $in: restaurantIds }
  })
    .populate("user", "name email")
    .populate("restaurant", "name")
    .sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
  return Order.find()
    .populate("user", "name email")
    .populate("restaurant", "name")
    .sort({ createdAt: -1 });
};

export const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (!["pending", "accepted"].includes(order.status)) {
    throw new Error("This order can no longer be cancelled");
  }

  order.status = "cancelled";
  await order.save();

  return order;
};

export const updateOrderStatus = async (orderId, ownerId, status) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: order.restaurant,
    owner: ownerId
  });

  if (!restaurant) {
    throw new Error("Access denied");
  }

  const allowedTransitions = {
    pending: ["accepted", "rejected"],
    accepted: ["preparing"],
    preparing: ["out_for_delivery"],
    out_for_delivery: ["delivered"]
  };

  if (!(allowedTransitions[order.status] || []).includes(status)) {
    throw new Error(
      `Cannot change order status from ${order.status} to ${status}`
    );
  }

  order.status = status;
  await order.save();

  return order;
};