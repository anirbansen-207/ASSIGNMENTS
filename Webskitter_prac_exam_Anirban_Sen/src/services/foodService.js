import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import Category from "../models/Category.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const createFood = async (data, ownerId) => {
  const restaurant = await Restaurant.findOne({
    _id: data.restaurant,
    owner: ownerId,
    isActive: true
  });

  if (!restaurant) {
    throw new Error("Restaurant not found or access denied");
  }

  const category = await Category.findById(data.category);

  if (!category) {
    throw new Error("Category not found");
  }

  return Food.create(data);
};

export const getFoods = async (query) => {
  const filter = {
    isAvailable: true
  };

  // Only show food from active restaurants to public users.
  const activeRestaurants = await Restaurant.find({
    isActive: true
  }).select("_id");

  filter.restaurant = {
    $in: activeRestaurants.map((restaurant) => restaurant._id)
  };

 if (query.restaurant) {
  filter.restaurant = {
    $in: activeRestaurants
      .filter((restaurant) => String(restaurant._id) === query.restaurant)
      .map((restaurant) => restaurant._id)
  };
}

  if (query.category) {
    filter.category = query.category;
  }

  if (query.isVeg !== undefined) {
    if (!["true", "false"].includes(query.isVeg)) {
      throw new Error("isVeg must be true or false");
    }

    filter.isVeg = query.isVeg === "true";
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const minPrice = Number(query.minPrice ?? 0);
    const maxPrice = Number(query.maxPrice ?? Infinity);

    if (
      !Number.isFinite(minPrice) ||
      minPrice < 0 ||
      (query.maxPrice !== undefined &&
        (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
      minPrice > maxPrice
    ) {
      throw new Error("Invalid price range");
    }

    filter.price = { $gte: minPrice };

    if (query.maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  if (query.search) {
    filter.name = {
      $regex: escapeRegex(query.search),
      $options: "i"
    };
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  const [foods, total] = await Promise.all([
    Food.find(filter)
      .populate("restaurant", "name")
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(limit),
    Food.countDocuments(filter)
  ]);

  return { foods, total, page, limit };
};

export const updateFood = async (foodId, ownerId, data) => {
  const food = await Food.findById(foodId);

  if (!food) {
    throw new Error("Food not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: food.restaurant,
    owner: ownerId
  });

  if (!restaurant) {
    throw new Error("Access denied");
  }

  if (data.category) {
    const category = await Category.findById(data.category);

    if (!category) {
      throw new Error("Category not found");
    }
  }

  // Only update fields explicitly allowed by the update schema.
  const allowedUpdates = [
    "name",
    "description",
    "price",
    "isVeg",
    "isAvailable",
    "category"
  ];

  const updates = {};

  for (const key of allowedUpdates) {
    if (data[key] !== undefined) {
      updates[key] = data[key];
    }
  }

  return Food.findByIdAndUpdate(
    foodId,
    updates,
    { new: true, runValidators: true }
  );
};

export const deleteFood = async (foodId, ownerId) => {
  const food = await Food.findById(foodId);

  if (!food) {
    throw new Error("Food not found");
  }

  const restaurant = await Restaurant.findOne({
    _id: food.restaurant,
    owner: ownerId
  });

  if (!restaurant) {
    throw new Error("Access denied");
  }

  await food.deleteOne();

  return { message: "Food deleted successfully" };
};

export const getOwnerFoods = async (ownerId) => {
  const restaurants = await Restaurant.find({
    owner: ownerId
  }).select("_id");

  const restaurantIds = restaurants.map((item) => item._id);

  return Food.find({
    restaurant: { $in: restaurantIds }
  })
    .populate("restaurant", "name")
    .populate("category", "name");
};