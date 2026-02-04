"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import AppButton from "../../components/UI/Button";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  avatar: null,
};

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.warn("Only JPG/PNG allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warn("File size must be under 10MB");
      return;
    }

    setFormData((prev) => ({ ...prev, avatar: file }));
    setPreview(URL.createObjectURL(file));
  };

  const isPasswordStrong = (pwd) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, avatar } = formData;

    if (!name || !email || !password) {
      toast.warn("All fields are required");
      return;
    }

    if (!isPasswordStrong(password)) {
      toast.warn(
        "Password must include uppercase, lowercase, number & special character"
      );
      return;
    }

    setLoading(true);

    try {
      let avatarData = null;

      if (avatar) {
        const { signature, timestamp, folder, cloudName, apiKey } =
          await API.get("/get-signature").then((res) => res.data);

        const fd = new FormData();
        fd.append("file", avatar);
        fd.append("api_key", apiKey);
        fd.append("folder", folder);
        fd.append("timestamp", timestamp);
        fd.append("signature", signature);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fd }
        );
        const data = await uploadRes.json();

        avatarData = {
          url: data.secure_url,
          public_id: data.public_id,
        };
      }

      const { data } = await API.post("/register", {
        name,
        email,
        password,
        avatar: avatarData,
      });

      toast.success(data.message || "Account created successfully");
      setFormData(initialFormData);
      setPreview(null);
      router.push("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Create Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NAME */}
        <div>
          <label className="block mb-1.5 text-sm text-white/70">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="
              w-full px-4 py-3 rounded-xl
              bg-white/5 text-white
              border border-white/10
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block mb-1.5 text-sm text-white/70">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="
              w-full px-4 py-3 rounded-xl
              bg-white/5 text-white
              border border-white/10
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block mb-1.5 text-sm text-white/70">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="
                w-full px-4 py-3 rounded-xl
                bg-white/5 text-white
                border border-white/10
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
          </div>
        </div>

        {/* AVATAR */}
        <div>
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <CloudUploadIcon fontSize="small" />
            Upload Avatar (optional)
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="mt-3">
            {preview ? (
              <img
                src={preview}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs">
                Preview
              </div>
            )}
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <AppButton
            type="submit"
            disabled={loading}
            className="
      w-full py-3 rounded-xl
      flex items-center justify-center gap-2
      bg-indigo-600 hover:bg-indigo-700
      text-white font-semibold
      transition disabled:opacity-60
    "
          >
            {loading ? (
              <span
                className="
          w-5 h-5
          border-2 border-white/30
          border-t-white
          rounded-full
          animate-spin
        "
              />
            ) : (
              "Register"
            )}
          </AppButton>
        </div>
      </form>
    </div>
  );
}
