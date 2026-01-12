"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import API from "../../../utils/axiosInstance";
import AppButton from "@/app/components/UI/Button";

const CreateProduct = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);


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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    setImages(valid);
    setPreviews(prev);
  };

  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  const uploadImagesToCloudinary = async () => {
    if (!images.length) return [];

    const { data } = await API.get("/get-signature");
    const { signature, timestamp, folder, cloudName, apiKey } = data;

    const uploaded = [];
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    for (const file of images) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("timestamp", timestamp);
      fd.append("signature", signature);
      fd.append("api_key", apiKey);
      fd.append("folder", folder);

      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
      const img = await res.json();

      uploaded.push({
        public_id: img.public_id,
        url: img.secure_url,
      });
    }

    return uploaded;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Product name required");
    if (!formData.category) return toast.error("Select a category");
    if (!images.length) return toast.error("Upload at least one image");

    try {
      setLoading(true);
      const cloudImages = await uploadImagesToCloudinary();

      const { data } = await API.post("/admin/product/new", {
        ...formData,
        images: cloudImages,
      });

      if (data.success) {
        toast.success("Product created successfully");
        router.push("/admin/products");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Error creating product");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen  bg-slate-50 py-12 px-4">
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
        <h2 className="text-2xl  font-semibold text-slate-800 mb-6">
          Create New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Product Name">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
          </Input>

          <Input label="Description">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter product description"
            />
          </Input>

          <Input label="Price">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
            />
          </Input>

          <Input label="Stock">
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
            />
          </Input>

          <Input label="Category">
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
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
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {previews.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-32 w-full object-cover rounded-lg ring-1 ring-slate-200"
                />
              ))}
            </div>
          )}

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
                "Create Product"
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

export default CreateProduct;
