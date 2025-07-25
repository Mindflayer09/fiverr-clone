import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function Register() {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    mode: "onChange",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(`Welcome ${res.data.user.username}! 🎉 Please log in to continue.`);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
          Create Your Account
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Join us as a freelancer or client!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="text-gray-400" />
              </span>
              <input
                {...register("username", { required: "Username is required" })}
                type="text"
                id="username"
                placeholder="Choose a username"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaEnvelope className="text-gray-400" />
              </span>
              <input
                {...register("email", { 
                  required: "Email is required", 
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format"
                  }
                })}
                type="email"
                id="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Input with Toggle */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="text-gray-400" />
              </span>
              <input
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Register As
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="text-gray-400" />
              </span>
              <select
                {...register("role", { required: "Role is required" })}
                id="role"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 appearance-none cursor-pointer"
              >
                <option value="">Select Role</option>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              isValid
                ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            }`}
          >
            Register
          </button>
          
          <div className="text-center mt-4 text-sm text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;