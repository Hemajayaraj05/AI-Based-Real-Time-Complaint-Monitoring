import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../../context/AuthContext";


const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "student" as UserRole,
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.department ||
      !formData.password
    ) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.department,
        formData.role
      );
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  from-purple-200  px-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT IMAGE PANEL */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-10">
           {/* <img src="/logo.png" className="w-16 mx-auto mb-3" /> */}
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="p-10 flex flex-col justify-center">
          <div className="text-center mb-6">
            <img src="/logo.png" className="w-14 mx-auto mb-2" />
            <h1 className="text-xl font-bold">
              SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
            </h1>
            <p className="text-gray-500 text-sm">Create Account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="EEE">Electrical</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
