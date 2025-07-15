import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(`Welcome ${res.data.user.username}! 🎉, Now Login to Continue`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6 border border-gray-100"
      >
        <h2 className="text-3xl font-extrabold text-center text-green-600">Create Account</h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          Register as a freelancer or client to get started
        </p>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            {...register("username", { required: true })}
            type="text"
            placeholder="Your username"
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">Username is required</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">Email is required</p>}
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            {...register("password", { required: true })}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && <p className="text-red-500 text-sm mt-1">Password is required</p>}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            {...register("role", { required: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Role</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">Role is required</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
