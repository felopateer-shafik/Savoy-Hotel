// src/utils/api.js

/**
 * API configuration for the Hotel booking system
 */

// Base URL for API requests - uses environment variable with fallback
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Helper function to make API requests with consistent error handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle no content response
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "An error occurred");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw if it's our custom error
    if (error.status) {
      throw error;
    }

    // Network error
    const networkError = new Error(
      "Network error. Please check your connection."
    );
    networkError.status = 0;
    throw networkError;
  }
};

/**
 * API methods
 */
export const api = {
  // Rooms
  getRooms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/rooms${query ? `?${query}` : ""}`);
  },

  getRoomById: (id) => apiRequest(`/rooms/${id}`),

  getRoomsWithAvailability: (checkIn, checkOut) =>
    apiRequest(
      `/rooms/with-availability?checkIn=${checkIn}&checkOut=${checkOut}`
    ),

  // Bookings
  createBooking: (bookingData) =>
    apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    }),

  getMyBookings: () => apiRequest("/bookings/mybookings"),

  getBookingById: (id) => apiRequest(`/bookings/${id}`),

  cancelBooking: (id) =>
    apiRequest(`/bookings/${id}/cancel`, { method: "PUT" }),

  // Reviews
  getReviews: () => apiRequest("/reviews"),

  getReviewsForRoom: (roomId) => apiRequest(`/reviews/room/${roomId}`),

  createReview: (reviewData) =>
    apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  // Users
  login: (credentials) =>
    apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest("/users/profile"),

  // Contact
  sendContact: (contactData) =>
    apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify(contactData),
    }),

  // Inventory (for admin)
  getInventoryStatus: () => apiRequest("/inventory/status"),
};

export default api;
