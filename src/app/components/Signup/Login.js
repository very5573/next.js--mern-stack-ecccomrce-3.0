"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import AppButton from "../../components/UI/Button";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { fetchUser } from "@/redux/slices/authSlice";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await API.post("/login", formData);
      dispatch(fetchUser());
      toast.success("Logged in successfully");
      router.push("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Welcome Back
      </h2>

      <form onSubmit={loginHandler} className="space-y-5">
        {/* EMAIL */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-white/70">
            Email
          </label>
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
              placeholder:text-white/30
            "
            placeholder="you@example.com"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-white/70">
            Password
          </label>
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
                placeholder:text-white/30
              "
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </div>
        </div>

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
              "Sign In"
            )}
          </AppButton>
        </div>

        {/* FORGOT PASSWORD */}
        <p
          onClick={() => router.push("/password/forgot")}
          className="
            text-center text-sm text-indigo-400
            hover:text-indigo-300 cursor-pointer
          "
        >
          Forgot Password?
        </p>
      </form>
    </div>
  );
}
