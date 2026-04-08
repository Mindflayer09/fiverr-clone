import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      const { token, user } = res.data;

      if (!token || !user) {
        console.error("❌ Invalid login response format:", res.data);
        throw new Error("Invalid response from server.");
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      login({ user, token, remember: rememberMe });
      toast.success(`Welcome back, ${user.username}!`);

      if (user.role === "freelancer") {
        navigate("/my-gigs");
      } else {
        navigate("/gigs");
      }
    } catch (err) {
      console.error("❌ Login failed error:", err);
      toast.error(err.response?.data?.msg || err.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-8 space-y-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-green-600">Login</h2>

        <div>
          <label>Email</label>
          <input {...register("email", { required: true })} type="email" placeholder="you@example.com" className="w-full border p-2 rounded" />
        </div>

        <div className="relative">
          <label>Password</label>
          <input
            {...register("password", { required: true })}
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            className="w-full border p-2 rounded pr-10"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-8 text-gray-500">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div>
          <label>Login As</label>
          <select {...register("role", { required: true })} className="w-full border p-2 rounded">
            <option value="">Select Role</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="mr-2" />
          <label htmlFor="remember">Remember Me</label>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}

export default Login;