import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when navigating to a new page
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  // Get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return "User";
    return fullName.split(" ")[0];
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <Link to="/" className="logo">
        <img
          src={`${process.env.PUBLIC_URL}/assets/images/logo.jpeg`}
          alt="Savoy Hotel Logo"
        />
      </Link>

      <div className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"}`}></i>
      </div>

      <nav className={`navbar ${menuOpen ? "active" : ""}`}>
        <Link to="/">home</Link>
        <Link to="/about">about</Link>
        <Link to="/rooms">rooms</Link>
        <Link to="/gallery">gallery</Link>
        <Link to="/reviews">reviews</Link>
        <Link to="/faq">faq</Link>

        {/* Cart icon */}
        <Link to="/cart" className="cart-icon">
          <i className="fas fa-shopping-cart"></i>
          {cartItems.length > 0 && (
            <span className="cart-count">{cartItems.length}</span>
          )}
        </Link>

        {/* Auth section - Sign In or User Menu */}
        {isAuthenticated ? (
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button
              className="user-menu-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <i className="fas fa-user-circle"></i>
              <span className="user-name">{getFirstName(user?.name)}</span>
              <i
                className={`fas fa-chevron-${
                  userMenuOpen ? "up" : "down"
                } chevron-icon`}
              ></i>
            </button>

            {userMenuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <span className="user-full-name">{user?.name}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
                <div className="user-dropdown-divider"></div>
                <Link to="/reservation" className="user-dropdown-item">
                  <i className="fas fa-calendar-plus"></i>
                  Book Now
                </Link>
                <button
                  className="user-dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin" className="btn sign-in-btn">
            <i className="fas fa-sign-in-alt"></i>
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
