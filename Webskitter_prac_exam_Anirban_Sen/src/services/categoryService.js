import Category from "../models/Category.js";
import Food from "../models/Food.js";

export const createCategory = async (data) => {
  return Category.create(data);
};

export const getCategories = async () => {
  return Category.find().sort({ name: 1 });
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );

  if (!category) throw new Error("Category not found");

  return category;
};

export const deleteCategory = async (id) => {
  const foodExists = await Food.exists({ category: id });

  if (foodExists) {
    throw new Error("Cannot delete a category that has food items");
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) throw new Error("Category not found");

  return { message: "Category deleted successfully" };
};