import Cart from "../models/cart.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate("items.food", "name price isAvailable")
    .populate("restaurant", "name");

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return {
    cart,
    totalAmount: calculateTotal(cart.items)
  };
};

export const addToCart = async (userId, foodId, quantity) => {
  const food = await Food.findOne({
    _id: foodId,
    isAvailable: true
  });

  if (!food) throw new Error("Food not found or unavailable");

  const restaurant = await Restaurant.findOne({
    _id: food.restaurant,
    isActive: true
  });

  if (!restaurant) throw new Error("Restaurant is unavailable");

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      restaurant: food.restaurant,
      items: []
    });
  }

  if (
    cart.restaurant &&
    String(cart.restaurant) !== String(food.restaurant)
  ) {
    throw new Error(
      "Your cart contains items from another restaurant. Clear it first."
    );
  }

  cart.restaurant = food.restaurant;

  const existingItem = cart.items.find(
    (item) => String(item.food) === String(foodId)
  );

  if (existingItem) {
    if (existingItem.quantity + quantity > 99) {
      throw new Error("Maximum quantity is 99");
    }

    existingItem.quantity += quantity;
    existingItem.price = food.price;
  } else {
    cart.items.push({
      food: food._id,
      quantity,
      price: food.price
    });
  }

  await cart.save();

  return {
    cart,
    totalAmount: calculateTotal(cart.items)
  };
};

export const updateCartItem = async (userId, foodId, quantity) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find(
    (entry) => String(entry.food) === String(foodId)
  );

  if (!item) throw new Error("Food is not in your cart");

  if (quantity === 0) {
    cart.items = cart.items.filter(
      (entry) => String(entry.food) !== String(foodId)
    );
  } else {
    item.quantity = quantity;
  }

  if (cart.items.length === 0) cart.restaurant = null;

  await cart.save();

  return {
    cart,
    totalAmount: calculateTotal(cart.items)
  };
};

export const removeCartItem = async (userId, foodId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (item) => String(item.food) !== String(foodId)
  );

  if (cart.items.length === 0) cart.restaurant = null;

  await cart.save();

  return {
    cart,
    totalAmount: calculateTotal(cart.items)
  };
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) throw new Error("Cart not found");

  cart.items = [];
  cart.restaurant = null;

  await cart.save();

  return cart;
};