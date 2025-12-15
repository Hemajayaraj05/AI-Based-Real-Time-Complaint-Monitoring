import React, { useState } from "react";
import "../assets/css/Signup.css";
import { Link } from "react-router-dom";

const Signup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    regNumber: "",
    password: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.regNumber.trim())
      newErrors.regNumber = "Register Number is required";
    if (!form.password)
      newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Minimum 8 characters required";
    if (!form.agree)
      newErrors.agree = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (validate()) {
      alert("Signup Successful ✔");
    }
  };

  const showError = (field) => submitted && errors[field];

  const inputStyle = (field) =>
    showError(field) ? { border: "1px solid red" } : {};

  const placeholderText = (field, normal) =>
    showError(field) ? errors[field] : normal;

  // 🔹 Google Sign-In redirect (basic web way)
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

          {/* GOOGLE SIGNUP */}
          <div className="social-buttons">
            <button
              className="google"
              onClick={handleGoogleSignup}
              style={{
                transition: "0.3s",
              }}
              onMouseOver={(e) =>
                (e.target.style.background = "#4285F4")
              }
              onMouseOut={(e) =>
                (e.target.style.background = "#f1f1f1")
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
                (e.target.style.background = "#5f7cff")
              }
              onMouseOut={(e) =>
                (e.target.style.background = "#2b1055")
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
           <p> Welcome to our platform. By creating an account or using our services, you agree to comply with and be bound by the following Terms and Privacy Policy. Please read this information carefully before proceeding. This application is designed to provide secure, reliable, and efficient access to our services. When you register, we may collect basic personal information such as your name, email address, username, and authentication details. This information is collected solely for the purpose of account creation, identity verification, and system functionality. We respect your privacy and are committed to protecting your personal data. All user information is stored securely using industry-standard security measures. We do not sell, rent, or trade your personal information to any third parties under any circumstances. Your data may be used internally to improve our services, enhance user experience, troubleshoot issues, and ensure system security. Any data used for analytics or improvement purposes is handled responsibly and, where possible, anonymized. By using this platform, you agree not to misuse the system, attempt unauthorized access, upload malicious content, or engage in activities that may harm the application or other users. Any violation of these terms may result in suspension or termination of your account. We reserve the right to update, modify, or revise these Terms and Privacy Policy at any time. Any changes will take effect immediately upon being published within the application. Continued use of the platform after such changes constitutes your acceptance of the updated terms. Passwords and authentication credentials are encrypted and should be kept confidential by the user. You are responsible for maintaining the security of your account and for all activities that occur under your credentials. Our services may occasionally experience interruptions due to maintenance, updates, or technical issues. While we strive to provide uninterrupted service, we do not guarantee that the platform will always be available. This application may integrate third-party services such as authentication providers. In such cases, those services operate under their own privacy policies, and we recommend reviewing them separately. By clicking the “Agree” button, you confirm that you have read, understood, and accepted these Terms and Privacy Policy in full. If you do not agree with any part of this policy, please discontinue use of the application. Your trust is important to us, and we are committed to maintaining transparency, security, and accountability in handling your data. </p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
