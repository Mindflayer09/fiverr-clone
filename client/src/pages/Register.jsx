import { React , useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", data);
      alert(res.data.msg);
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">Join as Freelancer or Client</h2>

        <input
          {...register("username")}
          type="text"
          placeholder="Username"
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* ✅ Password Field with Eye Toggle */}
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <select
          {...register("role")}
          className="w-full border border-gray-300 rounded-md p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Role</option>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
