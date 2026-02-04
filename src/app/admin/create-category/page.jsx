"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import { FolderPlus } from "lucide-react"; // optional icon (lightweight)

const CreateCategory = () => {
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newCategory.trim()) {
      toast.warn("⚠️ Please enter a category name!");
      return;
    }

    setLoading(true);
    try {
      await API.post("/admin/category/new", {
        name: newCategory,
      });

      toast.success("✅ Category created successfully!");
      setNewCategory("");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md -mt-16 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <FolderPlus className="text-blue-400" />
          <h1 className="text-xl font-semibold text-white">
            Create Category
          </h1>
        </div>

        {/* Input */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700
                         text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:opacity-60"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleAdd}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white
                       bg-blue-500 hover:bg-blue-600
                       transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
