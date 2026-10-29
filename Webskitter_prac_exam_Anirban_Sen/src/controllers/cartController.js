import * as cartService from "../services/cartService.js";

export const getCart = async (req, res) => {
  try {
    const data = await cartService.getCart(req.user._id);

    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const data = await cartService.addToCart(
      req.user._id,
      req.body.foodId,
      req.body.quantity
    );

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      ...data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const data = await cartService.updateCartItem(
      req.user._id,
      req.params.foodId,
      req.body.quantity
    );

    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const data = await cartService.removeCartItem(
      req.user._id,
      req.params.foodId
    );

    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};