// SignIn.js - User login page
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get the redirect path from location state, default to home
  const from = location.state?.from?.pathname || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors on mount only
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.email || !formData.password) {
      setFormError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(result.message);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue to Savoy Hotel</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {formError && (
              <div className="auth-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope"></i>
                Email Address
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
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
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
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account?</p>
            <Link to="/signup" className="auth-link">
              Create Account <i className="fas fa-arrow-right"></i>
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
            <h2>Luxury Awaits</h2>
            <p>Experience world-class hospitality at Savoy Hotel</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
