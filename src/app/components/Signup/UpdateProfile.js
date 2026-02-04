"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";

// ✅ MUI icon only
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function UpdateProfile() {
  const dispatch = useDispatch();
  const { user: loggedInUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 Sync redux user → form
  useEffect(() => {
    if (loggedInUser) {
      setFormData({
        name: loggedInUser.name || "",
        email: loggedInUser.email || "",
        avatar: null,
      });
      setPreview(loggedInUser.avatar || "");
    }
  }, [loggedInUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.warn("Only JPG / PNG images allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warn("Image must be less than 10MB");
      return;
    }

    setFormData((prev) => ({ ...prev, avatar: file }));
    setPreview(URL.createObjectURL(file));
  };

  // ☁️ Cloudinary upload
  const uploadToCloudinary = useCallback(async (file) => {
    const { signature, timestamp, folder, cloudName, apiKey } =
      await API.get("/get-signature").then((res) => res.data);

    const data = new FormData();
    data.append("file", file);
    data.append("api_key", apiKey);
    data.append("folder", folder);
    data.append("timestamp", timestamp);
    data.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: data }
    );

    const result = await res.json();
    if (!result.secure_url) {
      throw new Error(result.error?.message || "Upload failed");
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }, []);

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarData = null;
      if (formData.avatar) {
        avatarData = await uploadToCloudinary(formData.avatar);
      }

      await API.put("/me/update", {
        name: formData.name,
        email: formData.email,
        avatar: avatarData,
      });

      dispatch(fetchUser());
      toast.success("✅ Profile updated successfully!");
      setFormData((prev) => ({ ...prev, avatar: null }));
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Update Profile
        </h2>

        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-2.5
              border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition
            "
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-2.5
              border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition
            "
          />
        </div>

        {/* Avatar upload */}
        <div className="flex items-center justify-between gap-4">
          <label
            className="
              inline-flex items-center gap-2
              cursor-pointer
              bg-blue-50 text-blue-700
              px-4 py-2 rounded-lg
              hover:bg-blue-100 transition
            "
          >
            <CloudUploadIcon />
            <span>Upload Image</span>
            <input
              type="file"
              hidden
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />
          </label>

          {preview && (
            <div className="w-16 h-16 rounded-full overflow-hidden border">
              <img
                src={preview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex items-center justify-center
              px-6 py-2.5 rounded-lg
              bg-blue-600 text-white font-semibold
              hover:bg-blue-700
              transition disabled:opacity-60
            "
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
