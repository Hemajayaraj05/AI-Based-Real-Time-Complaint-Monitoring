import React, { useState } from "react";
import "../assets/css/Signup.css";

const Login = () => {
  const [step, setStep] = useState("login"); // login | forgot | reset
  const [form, setForm] = useState({
    email: "",
    password: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setMessage("Please fill all fields");
      return;
    }
    alert("Login successful ✔");
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!form.email) {
      setMessage("Enter your email");
      return;
    }
    setMessage("Verification code sent to your email");
    setStep("reset");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (
      !form.code ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setMessage("Please fill all fields");
      return;
    }

    if (form.newPassword.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    alert("Password reset successful ✔");
    setStep("login");
    setMessage("");
  };

  return (
    <div className="signup-container">
      <div className="signup-card">

        {/* LEFT */}
        <div className="signup-left">
          <h2>Welcome Back</h2>
          <p>Login to continue</p>
        </div>

        {/* RIGHT */}
        <div className="signup-right">
          {step === "login" && (
            <>
              <h2 style={{ textAlign: "center" }}>Login</h2>

              <form onSubmit={handleLogin}>
                <input
                  name="email"
                  placeholder="Email / Register Number"
                  value={form.email}
                  onChange={handleChange}
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />

                <p
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: "#2b1055",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                  onClick={() => {
                    setStep("forgot");
                    setMessage("");
                  }}
                >
                  Forgot password?
                </p>

                <button className="signup-btn">Login</button>
              </form>
            </>
          )}

          {step === "forgot" && (
            <>
              <h2 style={{ textAlign: "center" }}>Forgot Password</h2>

              <form onSubmit={handleSendCode}>
                <input
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                />

                <button className="signup-btn">
                  Send Verification Code
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <h2 style={{ textAlign: "center" }}>Reset Password</h2>

              <form onSubmit={handleResetPassword}>
                <input
                  name="code"
                  placeholder="Verification Code"
                  value={form.code}
                  onChange={handleChange}
                />

                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={form.newPassword}
                  onChange={handleChange}
                />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />

                <button className="signup-btn">
                  Reset Password
                </button>
              </form>
            </>
          )}

          {message && (
            <p
              style={{
                marginTop: "10px",
                textAlign: "center",
                fontSize: "13px",
                color: "#2b1055",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
