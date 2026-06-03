// src/App.js
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Rooms from "./pages/Rooms";
import Gallery from "./pages/Gallery";
import Reviews from "./pages/Reviews";
import Faq from "./pages/Faq";
import Reservation from "./pages/Reservation";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// Context
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

// Protected route component - requires authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign in, saving the attempted URL
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="faq" element={<Faq />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />

            {/* Protected routes - require authentication */}
            <Route
              path="reservation"
              element={
                <ProtectedRoute>
                  <Reservation />
                </ProtectedRoute>
              }
            />
            <Route path="cart" element={<Cart />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* CATCH-ALL: any unmatched path */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
