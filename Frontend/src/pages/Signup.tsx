import React, { useState, ChangeEvent, FormEvent } from "react";
import "../assets/css/Signup.css";
import { Link } from "react-router-dom";

/* 🔹 Types */
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    if (validate()) {
      alert("Signup Successful ✔");
    }
  };

  const showError = (field: keyof FormErrors) =>
    submitted && errors[field];

  const inputStyle = (field: keyof FormErrors) =>
    showError(field) ? { border: "1px solid red" } : {};

  const placeholderText = (
    field: keyof FormErrors,
    normal: string
  ) => (showError(field) ? errors[field] : normal);

  const handleGoogleSignup = () => {
    window.location.href = "https://accounts.google.com/";
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-left">
          <h2>Create Account</h2>
        </div>

        <div className="signup-right">
          <div className="social-buttons">
            <button
              className="google"
              onClick={handleGoogleSignup}
              style={{ transition: "0.3s" }}
              onMouseOver={(e) =>
                ((e.target as HTMLButtonElement).style.background = "#4285F4")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLButtonElement).style.background = "#f1f1f1")
              }
            >
              Sign up with Google
            </button>
          </div>

          <p className="or">or sign up using your email</p>

          <form onSubmit={handleSubmit} noValidate>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={placeholderText("name", "Name")}
              style={inputStyle("name")}
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={placeholderText("email", "Email")}
              style={inputStyle("email")}
            />

            <input
              name="regNumber"
              value={form.regNumber}
              onChange={handleChange}
              placeholder={placeholderText("regNumber", "Register Number")}
              style={inputStyle("regNumber")}
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={placeholderText("password", "Password")}
              style={inputStyle("password")}
            />

            <div className="terms">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
              />
              <span onClick={() => setShowPopup(true)}>
                I agree to Terms & Privacy Policy
              </span>
            </div>

            <button
              className="signup-btn"
              type="submit"
              style={{ transition: "0.3s" }}
              onMouseOver={(e) =>
                ((e.target as HTMLButtonElement).style.background = "#5f7cff")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLButtonElement).style.background = "#2b1055")
              }
            >
              Sign up
            </button>
          </form>

          <p className="login-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Terms & Privacy Policy</h3>
            <p>
              Welcome to our platform... {/* (content unchanged) */}
            </p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;


