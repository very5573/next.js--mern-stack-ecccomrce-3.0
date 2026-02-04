"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../../../utils/axiosInstance";
import AppButton from "@/app/components/UI/Button";

const UpdateProduct = () => {
  const router = useRouter();
  const { id } = useParams();

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [categories, setCategories] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/admin/product/${id}`);
        const p = data.product;

        setProductData({
          name: p.name || "",
          description: p.description || "",
          price: p.price || "",
          category: p.category?._id || "",
          stock: p.stock || "",
        });

        setOldImages(p.images || []);
      } catch {
        toast.error("Failed to load product");
      }
    };

    fetchProduct();
  }, [id]);

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        if (data.success) {
          setCategories(
            data.categories.map((c) => ({
              id: c._id,
              name: c.name,
            }))
          );
        }
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = [];
    const prev = [];

    files.forEach((file) => {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error(`${file.name} must be JPG or PNG`);
        return;
      }
      valid.push(file);
      prev.push(URL.createObjectURL(file));
    });

    setNewImages(valid);
    setPreviews(prev);
  };

  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  const uploadImagesToCloudinary = async () => {
    if (!newImages.length) return [];

    const { data } = await API.get("/get-signature");
    const { signature, timestamp, folder, cloudName, apiKey } = data;

    const uploaded = [];
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    for (const file of newImages) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("timestamp", timestamp);
      fd.append("signature", signature);
      fd.append("api_key", apiKey);
      fd.append("folder", folder);

      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: fd,
      });

      const img = await res.json();
      uploaded.push({ public_id: img.public_id, url: img.secure_url });
    }

    return uploaded;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productData.name.trim()) return toast.error("Product name required");
    if (!productData.category) return toast.error("Select a category");

    try {
      setLoading(true);

      const uploadedImages = newImages.length
        ? await uploadImagesToCloudinary()
        : oldImages;

      await API.put(`/admin/product/${id}`, {
        ...productData,
        images: uploadedImages,
      });

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch {
      toast.error("Error updating product");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div
        className=" -mt-10
          mx-auto max-w-2xl
          bg-white
          rounded-2xl
          shadow-sm
          ring-1 ring-slate-200/70
          p-8
        "
      >
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Update Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product Name">
            <input
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder="Product name"
            />
          </Input>

          <Input label="Description">
            <textarea
              name="description"
              value={productData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Product description"
            />
          </Input>

          <Input label="Price">
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
              placeholder="Price"
            />
          </Input>

          <Input label="Stock">
            <input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleChange}
              placeholder="Stock quantity"
            />
          </Input>

          <Input label="Category">
            <select
              value={productData.category}
              onChange={(e) =>
                setProductData({ ...productData, category: e.target.value })
              }
              className="bg-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Input>

          {/* Images */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Product Images
            </label>
            <button
              type="button"
              onClick={() => document.getElementById("fileInput").click()}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Upload Images
            </button>
            <input
              id="fileInput"
              type="file"
              hidden
              multiple
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />
          </div>

          {/* Preview */}
          <div className="grid grid-cols-3 gap-4">
            {(previews.length
              ? previews
              : oldImages.map((img) => img.url)
            ).map((src, i) => (
              <img
                key={i}
                src={src}
                className="h-32 w-full object-cover rounded-lg ring-1 ring-slate-200"
              />
            ))}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <AppButton
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl
                flex items-center justify-center
                bg-indigo-600 hover:bg-indigo-700
                text-white font-semibold
                transition disabled:opacity-60
              "
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Update Product"
              )}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- INPUT WRAPPER ---------------- */
const Input = ({ label, children }) => (
  <div>
    <label className="block mb-1 text-sm font-medium text-slate-700">
      {label}
    </label>
    {React.cloneElement(children, {
      className:
        "w-full px-4 py-2 rounded-lg ring-1 ring-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none",
    })}
  </div>
);

export default UpdateProduct;
