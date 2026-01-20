import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ---------- TYPES ---------- */
interface SignupForm {
  name: string;
  email: string;
  regNumber: string;
  password: string;
  agree: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  regNumber?: string;
  password?: string;
  agree?: string;
}

const Signup: React.FC = () => {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    regNumber: "",
    password: "",
    agree: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /* ---------- HANDLERS ---------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.regNumber.trim())
      newErrors.regNumber = "Register Number is required";
    if (!form.password)
      newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Minimum 8 characters required";
    if (!form.agree) newErrors.agree = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (validate()) {
      alert("Signup Successful ✔");
    }
  };

  const showError = (field: keyof FormErrors) =>
    submitted && Boolean(errors[field]);

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
      showError(field)
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-indigo-500"
    }`;

  const handleGoogleSignup = () => {
    window.location.href = "https://accounts.google.com/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-800 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
        {/* LEFT */}
        <div className="hidden md:flex w-1/2 bg-indigo-700 text-white items-center justify-center">
          <h2 className="text-3xl font-bold">Create Account</h2>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 p-8">
          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-gray-100 hover:bg-blue-500 hover:text-white transition-all py-2 rounded-lg font-medium mb-4"
          >
            Sign up with Google
          </button>

          <p className="text-center text-gray-500 mb-4">
            or sign up using your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={showError("name") ? errors.name : "Name"}
              className={inputClass("name")}
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={showError("email") ? errors.email : "Email"}
              className={inputClass("email")}
            />

            <input
              name="regNumber"
              value={form.regNumber}
              onChange={handleChange}
              placeholder={
                showError("regNumber")
                  ? errors.regNumber
                  : "Register Number"
              }
              className={inputClass("regNumber")}
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={
                showError("password") ? errors.password : "Password"
              }
              className={inputClass("password")}
            />

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
              />
              <span
                onClick={() => setShowPopup(true)}
                className="cursor-pointer text-indigo-600 hover:underline"
              >
                I agree to Terms & Privacy Policy
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-700 hover:bg-indigo-600 transition-all text-white py-2 rounded-lg font-semibold"
            >
              Sign up
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-700 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-lg font-bold mb-2">
              Terms & Privacy Policy
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              By creating an account, you agree to our Terms & Privacy
              Policy. Your data is secure and never shared.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
