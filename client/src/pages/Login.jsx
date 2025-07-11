import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

function Login() {
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const password = watch("password");

  const getPasswordStrength = (pwd) => {
    if (!pwd) return "";
    if (pwd.length < 6) return "Weak";
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/) && pwd.length >= 8) return "Strong";
    return "Medium";
  };

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      storage.setItem("user", JSON.stringify(res.data.user));

      toast.success(`Welcome back, ${res.data.user.username}!`);

      if (res.data.user.role === "client") {
        navigate("/gigs");
      } else {
        navigate("/my-gigs");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white w-full max-w-md shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-200"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-600">Login</h2>
          <p className="text-sm text-gray-500 mt-1">Choose your role and start your journey</p>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {/* Password Strength */}
          {password && (
            <p
              className={`text-xs mt-1 ${
                getPasswordStrength(password) === "Weak"
                  ? "text-red-500"
                  : getPasswordStrength(password) === "Medium"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              Strength: {getPasswordStrength(password)}
            </p>
          )}
        </div>

        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Login As</label>
          <select
            {...register("role")}
            className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select Role</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">Remember Me</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Login
        </button>

        {/* Forgot Password */}
        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;
