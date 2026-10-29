import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const createRestaurant = async (data, ownerId) => {
  const existing = await Restaurant.findOne({ owner: ownerId });

  if (existing) {
    throw new Error("You already have a restaurant");
  }

  return Restaurant.create({
    ...data,
    owner: ownerId
  });
};

export const getRestaurants = async (query) => {
  const filter = { isActive: true };

  if (query.search) {
    filter.name = {
      $regex: escapeRegex(query.search),
      $options: "i"
    };
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .populate("owner", "name")
      .skip((page - 1) * limit)
      .limit(limit),
    Restaurant.countDocuments(filter)
  ]);

  return { restaurants, total, page, limit };
};

export const getRestaurantById = async (id) => {
  const restaurant = await Restaurant.findOne({
    _id: id,
    isActive: true
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return restaurant;
};

export const updateRestaurant = async (id, ownerId, data) => {
  const allowedUpdates = ["name", "description", "address"];
  const updates = {};

  for (const key of allowedUpdates) {
    if (data[key] !== undefined) {
      updates[key] = data[key];
    }
  }

  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: id, owner: ownerId },
    updates,
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    throw new Error("Restaurant not found or access denied");
  }

  return restaurant;
};

export const getOwnerRestaurants = async (ownerId) => {
  return Restaurant.find({ owner: ownerId });
};

export const changeRestaurantStatus = async (id, ownerId, isActive) => {
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: id, owner: ownerId },
    { isActive },
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    throw new Error("Restaurant not found or access denied");
  }

  // When the restaurant is disabled, prevent its food from being ordered.
  // On reactivation, food availability is not automatically restored;
  // the owner can enable each food item individually.
  if (!isActive) {
    await Food.updateMany(
      { restaurant: id },
      { isAvailable: false }
    );
  }

  return restaurant;
};