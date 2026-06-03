// SignUp.js - User registration page
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const SignUp = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
    setFormError("");
  }, [clearError]);

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    if (formData.name.trim().length < 2) {
      setFormError("Name must be at least 2 characters");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      setFormError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name.trim(),
      formData.email.trim().toLowerCase(),
      formData.password,
      formData.phone.trim()
    );
    setLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setFormError(result.message);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return { text: "Weak", color: "#e74c3c" };
    if (passwordStrength <= 2) return { text: "Fair", color: "#f39c12" };
    if (passwordStrength <= 3) return { text: "Good", color: "#3498db" };
    return { text: "Strong", color: "#27ae60" };
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join Savoy Hotel for exclusive offers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {(formError || error) && (
              <div className="auth-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formError || error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <i className="fas fa-user"></i>
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope"></i>
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                <i className="fas fa-phone"></i>
                Phone Number <span className="optional">(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock"></i>
                Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Create a password (min. 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getStrengthLabel().color,
                      }}
                    ></div>
                  </div>
                  <span style={{ color: getStrengthLabel().color }}>
                    {getStrengthLabel().text}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="fas fa-lock"></i>
                Confirm Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i
                    className={`fas ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <span className="password-match-error">
                    <i className="fas fa-times-circle"></i> Passwords do not
                    match
                  </span>
                )}
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <span className="password-match-success">
                    <i className="fas fa-check-circle"></i> Passwords match
                  </span>
                )}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/signin" className="auth-link">
              Sign In <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <Link to="/" className="back-home-link">
            <i className="fas fa-home"></i>
            Back to Home
          </Link>
        </div>

        <div className="auth-image">
          <div className="auth-image-overlay">
            <h2>Join Our Family</h2>
            <p>Create an account for exclusive benefits and faster bookings</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
