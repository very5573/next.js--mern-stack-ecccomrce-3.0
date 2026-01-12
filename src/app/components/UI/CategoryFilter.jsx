"use client";

import React, { useEffect } from "react";
import API from "../../../utils/axiosInstance";

const CategoryFilter = ({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
}) => {
  // ✅ FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Category load failed");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      {/* Heading */}
      <h3 className="font-bold text-gray-800 mb-2 text-lg">Category</h3>

      <div className="flex flex-col gap-2 mb-4">
        {/* ✅ ALL OPTION */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="category"
            value=""
            checked={selectedCategory === ""}
            onChange={() => setSelectedCategory("")}
            className="w-4 h-4 text-blue-500 accent-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
          />
          <span className="text-gray-700 font-medium">All</span>
        </label>

        {/* ✅ DYNAMIC CATEGORIES */}
        {categories.map((cat) => (
          <label
            key={cat._id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="category"
              value={cat._id}
              checked={selectedCategory === cat._id}
              onChange={() => setSelectedCategory(cat._id)}
              className="w-4 h-4 text-blue-500 accent-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-gray-700 font-medium">{cat.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;