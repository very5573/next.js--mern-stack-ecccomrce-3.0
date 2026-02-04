"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import API from "../../../utils/axiosInstance";
import { AppButton } from "../../components/UI/Button";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";

// MUI Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteCatId, setDeleteCatId] = useState(null);
  const router = useRouter();

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories");
      setCategories(res.data.categories || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Delete category
  const handleDelete = async () => {
    if (!deleteCatId) return;
    const original = [...categories];
    setCategories((prev) => prev.filter((c) => c._id !== deleteCatId));
    setDeleteCatId(null);

    try {
      await API.delete(`/admin/category/${deleteCatId}`);
    } catch (err) {
      setCategories(original);
      setError(err.response?.data?.message || err.message);
    }
  };

  // Desktop rows
  const desktopRows = useMemo(
    () =>
      categories.map((cat) => (
        <tr
          key={cat._id}
          className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition"
        >
          <td className="px-6 py-4 text-gray-200 border-r border-gray-700">
            {cat.name}
          </td>

          <td className="px-6 py-4 text-center border-r border-gray-700">
            <AppButton
              variant="outlined"
              className="rounded-full p-2 border border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white transition"
              onClick={() => router.push(`/admin/category/${cat._id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </AppButton>
          </td>

          <td className="px-6 py-4 text-center">
            <AppButton
              color="error"
              variant="outlined"
              className="rounded-full p-2 border border-red-400 text-red-400 hover:bg-red-500 hover:text-white transition"
              onClick={() => setDeleteCatId(cat._id)}
            >
              <DeleteIcon fontSize="small" />
            </AppButton>
          </td>
        </tr>
      )),
    [categories]
  );

  // Mobile cards
  const mobileCards = useMemo(
    () =>
      categories.map((cat) => (
        <div
          key={cat._id}
          className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-200">
            {cat.name}
          </h3>

          <div className="flex gap-3 mt-4">
            <AppButton
              variant="outlined"
              className="rounded-full p-2 border border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white transition"
              onClick={() => router.push(`/admin/category/${cat._id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </AppButton>

            <AppButton
              color="error"
              variant="outlined"
              className="rounded-full p-2 border border-red-400 text-red-400 hover:bg-red-500 hover:text-white transition"
              onClick={() => setDeleteCatId(cat._id)}
            >
              <DeleteIcon fontSize="small" />
            </AppButton>
          </div>
        </div>
      )),
    [categories]
  );

  return (
    <div className="p-6 w-full max-w-6xl mx-auto -mt-0.5 bg-gray-900 text-white rounded-none shadow-md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <CategoryIcon />
        <h2 className="text-2xl font-bold">Category Management</h2>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-gray-400">
          <AccessTimeIcon fontSize="small" /> Loading categories...
        </p>
      )}

      {error && <p className="text-red-400 mb-3">{error}</p>}

      {categories.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-hidden">
            <table className="w-full border border-gray-700 rounded-lg border-collapse">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left border-r border-gray-700">
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-center border-r border-gray-700">
                    Edit
                  </th>
                  <th className="px-6 py-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>{desktopRows}</tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {mobileCards}
          </div>
        </>
      ) : (
        <p className="text-gray-400">No categories found.</p>
      )}

      {/* Delete confirmation */}
      <AlertDialogModal
        open={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CategoryList;
