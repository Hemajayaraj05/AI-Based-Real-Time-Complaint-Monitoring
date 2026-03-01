import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast.error("Please enter email and password");
      return;
    }

    try {
      // use AuthContext login so the global auth state is updated
      await login(formData.email, formData.password);
      showToast.success("Login successful!");
      navigate("/dashboard");
    } catch (err: any) {
      showToast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="p-10 flex flex-col justify-center">
      <div className="text-center mb-6">
        <img src="/logo.png" className="w-16 mx-auto mb-3" />
        <h1 className="text-xl font-bold">
          SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
        </h1>
        <p className="text-gray-500 text-sm">Login Portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="text-right text-sm text-purple-600 hover:text-purple-700 cursor-pointer">
          Forgot Password?
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg mt-6 font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? "Logging in..." : "Sign In"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{" "}
        <Link to="/signup" className="text-purple-600 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
