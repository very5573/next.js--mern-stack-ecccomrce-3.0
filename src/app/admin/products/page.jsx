"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";

import { AppButton } from "../../components/UI/Button";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";

// MUI Icons
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AdminProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [error, setError] = useState("");

  // ✅ Fetch All Products
  const fetchAdminProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/products");
      setProducts(data.products || []);
      setError("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load products";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  // ✅ Delete Product
  const confirmDelete = async () => {
    if (!deleteProductId) return;

    const original = [...products];
    setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));

    try {
      await API.delete(`/admin/product/${deleteProductId}`);
      toast.success("Product deleted successfully");
    } catch (err) {
      setProducts(original);
      toast.error("Failed to delete product");
    }

    setDeleteProductId(null);
  };

  // ✅ TABLE ROWS
const tableRows = useMemo(
  () =>
    products.map((p, index) => (
      <tr
        key={p._id}
        className={`border-b border-gray-700 ${
          index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
        } hover:bg-gray-700 transition-colors duration-200`}
      >
        <th className="px-6 py-4 border-r border-gray-600 max-w-[250px] md:max-w-[300px] break-words whitespace-normal text-gray-200">
          {p._id}
        </th>

        <td className="px-6 py-4 border-r border-gray-600 max-w-[250px] md:max-w-[300px] break-words whitespace-normal text-gray-200">
          {p.name}
        </td>
<td className="px-6 py-6 border-r border-gray-600 text-green-400 font-semibold w-20 text-center">
  ₹{p.price}
</td>


        <td className="px-6 py-3 border-r border-gray-600 text-yellow-300 font-medium text-center">
          {p.stock}
        </td>

        <td className="px-6 py-4 text-right border-r border-gray-600">
          <Link
            href={`/admin/products/${p._id}/update`}
            className="rounded-full p-2 border border-blue-400 hover:bg-blue-600 hover:text-white inline-flex transition-colors duration-200 text-center"
          >
            <EditIcon fontSize="small" />
          </Link>
        </td>

        <td className="px-6 py-4 text-right">
          <AppButton
            color="error"
            variant="outlined"
            className="rounded-full p-2 border border-red-500 text-red-500 hover:bg-red-600 hover:text-white transition-colors duration-200 text-center"
            onClick={() => setDeleteProductId(p._id)}
          >
            <DeleteIcon fontSize="small" />
          </AppButton>
        </td>
      </tr>
    )),
  [products]
);

return (
  <div className="relative overflow-x-auto bg-gray-900 shadow-lg rounded-none border border-gray-700 mt-0 text-white">

    {/* ✅ HEADER */}
    <div className="flex items-center gap-2 p-5 border-b border-gray-700 bg-gray-800 rounded-t-lg">
      <InventoryIcon className="text-yellow-400" />
      <h2 className="text-lg font-semibold text-white">Admin Products Panel</h2>
    </div>

    {loading ? (
      <p className="p-6 flex items-center gap-2 text-gray-400">
        <AccessTimeIcon fontSize="small" /> Loading products...
      </p>
    ) : error ? (
      <p className="p-6 text-red-500">{error}</p>
    ) : products.length === 0 ? (
      <p className="p-6 text-gray-400">No products found.</p>
    ) : (
      <table className="w-full text-sm text-left border-collapse table-fixed">

        {/* ✅ CAPTION */}
        <caption className="p-5 text-lg font-medium text-left text-white bg-gray-900 rounded-t-lg">
          Our Products
          <p className="mt-1.5 text-sm font-normal text-gray-300">
            Browse all admin products, manage stock, edit and delete items.
          </p>
        </caption>

        {/* ✅ THEAD */}
        <thead className="bg-gray-800 text-gray-200 border-b border-gray-600">
          <tr>
            <th className="px-6 py-3 w-70 font-medium border-r border-gray-600">Product ID</th>
            <th className="px-6 py-3 w-70 font-medium border-r border-gray-600">Name</th>
            <th className="px-6 py-3 font-medium border-r border-gray-600">Price</th>
            <th className="px-6 py-3 font-medium border-r border-gray-600">Stock</th>
            <th className="px-6 py-3 font-medium border-r border-gray-600">Edit</th>
            <th className="px-6 py-3 font-medium border-gray-600">Delete</th>
          </tr>
        </thead>

        {/* ✅ TBODY */}
        <tbody>{tableRows}</tbody>
      </table>
    )}



      {/* ✅ DELETE CONFIRMATION */}
      <AlertDialogModal
        open={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminProductsPanel;
