import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
/**
 * Escape special regex characters in keyword
 */

/**
 * Build keyword filter for Product search
 * Matches product name, description, and category name
 */
export const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const buildKeywordFilter = async (keyword) => {
  if (!keyword?.trim()) return {};

  const search = escapeRegex(keyword.trim());

  // 1️⃣ Find matching categories
  const matchedCategories = await Category.find({
    name: { $regex: search, $options: "i" },
  }).select("_id");

  const categoryIds = matchedCategories.map((c) => c._id);

  // 2️⃣ Return $or filter
  return {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $in: categoryIds } },
    ],
  };
};

/**
 * Build dynamic filters (price, rating, etc.) from query params
 */
export const buildDynamicFilters = (query) => {
  const filters = {};
  const queryCopy = { ...query };
  ["keyword", "page", "limit", "categoryId"].forEach((key) => delete queryCopy[key]);

  for (const key in queryCopy) {
    if (key.includes("[")) {
      const [field, operator] = key.split("[");
      const mongoOperator = operator.replace("]", "");
      if (!filters[field]) filters[field] = {};
      filters[field][`$${mongoOperator}`] = Number(queryCopy[key]);
    } else {
      filters[key] = queryCopy[key];
    }
  }

  // Category filter (if valid)
  if (query.categoryId && mongoose.Types.ObjectId.isValid(query.categoryId)) {
    filters.category = new mongoose.Types.ObjectId(query.categoryId);
  }

  return filters;
};
