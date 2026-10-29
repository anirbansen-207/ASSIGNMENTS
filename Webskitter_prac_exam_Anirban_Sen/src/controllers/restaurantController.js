import * as restaurantService from "../services/restaurantService.js";

export const createRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.createRestaurant(
      req.body,
      req.user._id
    );

    return res.status(201).json({ success: true, restaurant });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRestaurants = async (req, res) => {
  try {
    const data = await restaurantService.getRestaurants(req.query);

    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.getRestaurantById(
      req.params.id
    );

    return res.status(200).json({ success: true, restaurant });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.updateRestaurant(
      req.params.id,
      req.user._id,
      req.body
    );

    return res.status(200).json({ success: true, restaurant });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getOwnerRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantService.getOwnerRestaurants(
      req.user._id
    );

    return res.status(200).json({ success: true, restaurants });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const changeRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await restaurantService.changeRestaurantStatus(
      req.params.id,
      req.user._id,
      req.body.isActive
    );

    return res.status(200).json({ success: true, restaurant });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};