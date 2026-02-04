"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../../../utils/axiosInstance";

const UpdateCategory = () => {
  const { id } = useParams();
  const router = useRouter();

  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch category by ID
  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        const { data } = await API.get(`/category/${id}`);
        setCategoryName(data.category.name);
      } catch (err) {
        toast.error(err.response?.data?.message || "❌ Failed to load category");
      }
    };

    fetchCategory();
  }, [id]);

  // ✅ Update category
  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      toast.warn("⚠️ Category name cannot be empty!");
      return;
    }

    setLoading(true);
    try {
      await API.put(`/admin/category/${id}`, { name: categoryName });
      toast.success("✅ Category updated successfully!");
      router.push("/admin/category");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4">
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.25)] p-8 transition-all duration-500 hover:shadow-[0_35px_120px_-20px_rgba(0,0,0,0.3)]">
        
        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 text-center mb-6">
          Update Category
        </h1>

        <div className="space-y-6">

          {/* Input */}
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            disabled={loading}
            className="
              w-full px-5 py-3 rounded-2xl
              border border-gray-300
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
              outline-none transition-all duration-300
              bg-white/90 backdrop-blur-sm
              placeholder-gray-400 text-gray-900
            "
          />

          {/* Update Button */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`
              w-full py-3 rounded-2xl
              bg-indigo-600 text-white font-semibold
              shadow-lg shadow-indigo-300/50
              hover:bg-indigo-700 hover:scale-[1.03]
              transition-all duration-300
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {loading ? "Updating..." : "Update Category"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default UpdateCategory;
