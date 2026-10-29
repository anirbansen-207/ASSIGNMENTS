import * as foodService from "../services/foodService.js";

export const createFood = async (req, res) => {
  try {
    const food = await foodService.createFood(req.body, req.user._id);

    return res.status(201).json({ success: true, food });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getFoods = async (req, res) => {
  try {
    const data = await foodService.getFoods(req.query);

    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateFood = async (req, res) => {
  try {
    const food = await foodService.updateFood(
      req.params.id,
      req.user._id,
      req.body
    );

    return res.status(200).json({ success: true, food });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const result = await foodService.deleteFood(
      req.params.id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getOwnerFoods = async (req, res) => {
  try {
    const foods = await foodService.getOwnerFoods(req.user._id);

    return res.status(200).json({ success: true, foods });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};