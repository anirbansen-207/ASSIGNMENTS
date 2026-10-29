import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(72).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

// Used when creating a restaurant.
export const restaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().allow("").max(1000),
  address: Joi.string().trim().min(3).required()
});

// Used when updating only selected restaurant fields.
export const updateRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  description: Joi.string().allow("").max(1000),
  address: Joi.string().trim().min(3)
}).min(1);

export const foodSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().allow("").max(1000),
  price: Joi.number().min(0).required(),
  isVeg: Joi.boolean().required(),
  isAvailable: Joi.boolean(),
  restaurant: Joi.string().hex().length(24).required(),
  category: Joi.string().hex().length(24).required()
});

// Owners can update selected food fields without resending every field.
export const updateFoodSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  description: Joi.string().allow("").max(1000),
  price: Joi.number().min(0),
  isVeg: Joi.boolean(),
  isAvailable: Joi.boolean(),
  category: Joi.string().hex().length(24)
}).min(1);

export const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().allow("").max(500)
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().allow("").max(500)
}).min(1);

export const cartItemSchema = Joi.object({
  foodId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).max(99).required()
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(99).required()
});

export const orderCreateSchema = Joi.object({
  deliveryAddress: Joi.string().trim().min(5).max(500).required()
});

export const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "accepted",
      "rejected",
      "preparing",
      "out_for_delivery",
      "delivered"
    )
    .required()
});

export const roleSchema = Joi.object({
  role: Joi.string()
    .valid("user", "restaurantOwner", "admin")
    .required()
});

export const blockUserSchema = Joi.object({
  isBlocked: Joi.boolean().required()
});