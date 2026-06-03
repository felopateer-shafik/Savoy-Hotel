// Reservation.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "react-datepicker/dist/react-datepicker.css";
import "./Reservation.css";

// Local date helpers to avoid UTC timezone shifts
const toLocalYMD = (date) => {
  if (!(date instanceof Date)) return "";
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};
const addDays = (date, days) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
};
const daysBetween = (startDate, endDate) => {
  const s = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const e = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
};

const Reservation = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkInDate: null,
    checkOutDate: null,
    roomType: "",
    adults: "1",
    children: "0",
    rooms: "1",
    specialRequests: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomsData, setRoomsData] = useState({});
  const [availabilityData, setAvailabilityData] = useState(null);
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Modal state for cart confirmation
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);

  // Load room data from database on component mount
  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        const response = await axios.get("/api/rooms");
        const rooms = response.data;

        const roomsMap = {};
        rooms.forEach((room) => {
          roomsMap[room.type] = {
            id: room.id,
            name: room.name,
            price: room.price,
            type: room.type,
          };
        });

        setRoomsData(roomsMap);
        setAvailableRoomTypes(Object.keys(roomsMap)); // Populate all room types initially
        if (!formData.roomType) {
          setFormData((prev) => ({
            ...prev,
            roomType: Object.keys(roomsMap)[0],
          })); // Set default room type
        }
      } catch (error) {
        console.error("Error fetching rooms data:", error);
        setErrors({
          form: "Failed to load room information. Please refresh the page.",
        });
      }
    };

    fetchRoomsData();
  }, []);

  // Helper function to get room name from database
  const getRoomName = (type) => {
    return roomsData[type]?.name || type;
  };

  // Helper function to get room price from database
  const getRoomPrice = (type) => {
    return roomsData[type]?.price || 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Reset availability when room count changes
    if (name === "rooms") {
      setAvailabilityData(null);
      setAvailabilityChecked(false);
      setSuccessMessage("");
    }
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Reset availability when dates change
    setAvailabilityData(null);
    setAvailabilityChecked(false);
    setSuccessMessage("");

    // Auto-adjust checkout date if needed
    if (
      name === "checkInDate" &&
      formData.checkOutDate &&
      date >= formData.checkOutDate
    ) {
      const newCheckOut = new Date(date);
      newCheckOut.setDate(date.getDate() + 1);
      setFormData((prev) => ({
        ...prev,
        checkInDate: date,
        checkOutDate: newCheckOut,
      }));
    }
  };

  const handleCheckAvailability = async () => {
    // Ensure a room type is selected before checking availability
    if (!formData.roomType) {
      setErrors({
        roomType: "Please select a room type before checking availability.",
      });
      return;
    }

    // First validate required fields for availability check
    const checkErrors = {};
    if (!formData.checkInDate) {
      checkErrors.checkInDate = "Check-in date is required";
    }
    if (!formData.checkOutDate) {
      checkErrors.checkOutDate = "Check-out date is required";
    }

    if (Object.keys(checkErrors).length > 0) {
      setErrors(checkErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setSuccessMessage("");

      const formattedCheckIn = toLocalYMD(formData.checkInDate);
      const formattedCheckOut = toLocalYMD(formData.checkOutDate);

      console.log(
        `Checking availability for ${formData.roomType} from ${formattedCheckIn} to ${formattedCheckOut}`
      );

      // Call the API to check availability for the specific date range
      const response = await axios.get("/api/rooms/availability", {
        params: {
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
        },
      });

      console.log("Room availability response:", response.data);

      // Cache the availability data for later use
      setAvailabilityData(response.data);
      setAvailabilityChecked(true);

      // Process the availability data
      processAvailabilityData(response.data);
    } catch (err) {
      console.error("Error checking availability:", err);
      setErrors({
        form:
          err.response?.data?.message ||
          "Failed to check availability. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const processAvailabilityData = (availabilityData) => {
    // Only process if we have valid availability data
    if (!availabilityData) return;

    const numberOfRooms = parseInt(formData.rooms);

    // Check if the selected room type is available
    const roomAvailability = availabilityData[formData.roomType];

    if (
      !roomAvailability ||
      !roomAvailability.available ||
      roomAvailability.availableRooms < numberOfRooms
    ) {
      setErrors({
        roomType: `${getRoomName(
          formData.roomType
        )} is not available for the selected dates and number of rooms. Available rooms for ${getRoomName(
          formData.roomType
        )} is ${roomAvailability?.availableRooms || 0}.`,
      });
      setSuccessMessage("");
      return;
    }

    setSuccessMessage(
      `${getRoomName(formData.roomType)} is available! ${
        roomAvailability.availableRooms
      } rooms available for your dates.`
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "checkInDate",
      "checkOutDate",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Check-in date validation
    if (formData.checkInDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (formData.checkInDate < today) {
        newErrors.checkInDate = "Check-in date cannot be in the past";
      }
    }

    // Check-out date validation
    if (formData.checkInDate && formData.checkOutDate) {
      if (formData.checkOutDate <= formData.checkInDate) {
        newErrors.checkOutDate = "Check-out date must be after check-in date";
      }
    }

    // Availability validation
    if (!availabilityChecked) {
      newErrors.form = "Please check availability before making a reservation";
    }

    // Room type validation
    if (availabilityChecked && !formData.roomType) {
      newErrors.roomType = "Please select a room type";
    }

    // Check if selected room type is still available
    if (availabilityChecked && formData.roomType && availabilityData) {
      const numberOfRooms = parseInt(formData.rooms);
      const roomAvailability = availabilityData[formData.roomType];

      if (
        !roomAvailability ||
        !roomAvailability.available ||
        roomAvailability.availableRooms < numberOfRooms
      ) {
        newErrors.roomType = `${getRoomName(
          formData.roomType
        )} is not available for the selected dates and number of rooms`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify availability one more time before submission
      const numberOfRooms = parseInt(formData.rooms);
      const roomAvailability = availabilityData[formData.roomType];

      if (
        !roomAvailability ||
        !roomAvailability.available ||
        roomAvailability.availableRooms < numberOfRooms
      ) {
        throw new Error(
          `Sorry, ${getRoomName(
            formData.roomType
          )} is no longer available for the selected dates. Please check availability again.`
        );
      }

      // Calculate nights
      const nights = daysBetween(formData.checkInDate, formData.checkOutDate);

      // Prepare reservation data
      const reservationData = {
        id: roomsData[formData.roomType].id,
        name: roomsData[formData.roomType].name,
        type: formData.roomType,
        price: roomsData[formData.roomType].price,
        image: `${formData.roomType}.jpg`,
        quantity: numberOfRooms,
        checkInDate: toLocalYMD(formData.checkInDate),
        checkOutDate: toLocalYMD(formData.checkOutDate),
        numberOfRooms: numberOfRooms,
        numberOfGuests: parseInt(formData.adults) + parseInt(formData.children),
        nights: nights,
      };

      // Add to cart
      addToCart(reservationData);

      // Show modal instead of navigating away
      setCartModalData({
        roomName: roomsData[formData.roomType].name,
        checkIn: toLocalYMD(formData.checkInDate),
        checkOut: toLocalYMD(formData.checkOutDate),
        price: roomsData[formData.roomType].price,
        nights: nights,
        numberOfRooms: numberOfRooms,
      });
      setShowCartModal(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        checkInDate: null,
        checkOutDate: null,
        roomType: "",
        adults: "1",
        children: "0",
        rooms: "1",
        specialRequests: "",
      });
      setAvailabilityChecked(false);
      setAvailabilityData(null);
    } catch (error) {
      console.error("Error submitting reservation:", error);
      setErrors({
        form:
          error.message ||
          "There was an error processing your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate minimum checkout date (day after checkin)
  const minCheckoutDate = formData.checkInDate
    ? addDays(formData.checkInDate, 1)
    : addDays(new Date(), 1);

  // Calculate minimum checkin date (today)
  const minCheckinDate = new Date();

  return (
    <section className="reservation" id="reservation">
      <h1 className="heading">Make a Reservation</h1>

      <form onSubmit={handleSubmit}>
        <div className="container">
          <div className="form-section">
            <h2>Guest Information</h2>

            <div className="box">
              <label htmlFor="name">
                Full Name <span>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`input ${errors.name ? "error" : ""}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>

            <div className="box">
              <label htmlFor="email">
                Email Address <span>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`input ${errors.email ? "error" : ""}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="box">
              <label htmlFor="phone">
                Phone Number <span>*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`input ${errors.phone ? "error" : ""}`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <div className="error-message">{errors.phone}</div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Reservation Details</h2>

            <div className="date-row">
              <div className="box">
                <label htmlFor="checkInDate">
                  Check-in Date <span>*</span>
                </label>
                <DatePicker
                  id="checkInDate"
                  name="checkInDate"
                  selected={formData.checkInDate}
                  onChange={(date) => handleDateChange(date, "checkInDate")}
                  minDate={minCheckinDate}
                  dateFormat="dd/MM/yyyy"
                  className={`input ${errors.checkInDate ? "error" : ""}`}
                  placeholderText="Select date"
                />
                {errors.checkInDate && (
                  <div className="error-message">{errors.checkInDate}</div>
                )}
              </div>

              <div className="box">
                <label htmlFor="checkOutDate">
                  Check-out Date <span>*</span>
                </label>
                <DatePicker
                  id="checkOutDate"
                  name="checkOutDate"
                  selected={formData.checkOutDate}
                  onChange={(date) => handleDateChange(date, "checkOutDate")}
                  minDate={minCheckoutDate}
                  dateFormat="dd/MM/yyyy"
                  className={`input ${errors.checkOutDate ? "error" : ""}`}
                  placeholderText="Select date"
                  disabled={!formData.checkInDate}
                />
                {errors.checkOutDate && (
                  <div className="error-message">{errors.checkOutDate}</div>
                )}
              </div>
            </div>

            <div className="box">
              <label htmlFor="roomType">
                Room Type <span>*</span>
              </label>
              <select
                id="roomType"
                name="roomType"
                className={`input ${errors.roomType ? "error" : ""}`}
                value={formData.roomType}
                onChange={handleChange}
              >
                {availableRoomTypes.map((type) => (
                  <option key={type} value={type}>
                    {roomsData[type]?.name} - ${roomsData[type]?.price}/night
                  </option>
                ))}
              </select>
              {errors.roomType && (
                <div className="error-message">{errors.roomType}</div>
              )}
            </div>

            <div className="options-row">
              <div className="box">
                <label htmlFor="adults">Adults</label>
                <select
                  id="adults"
                  name="adults"
                  className="input"
                  value={formData.adults}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} adult{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="box">
                <label htmlFor="children">Children</label>
                <select
                  id="children"
                  name="children"
                  className="input"
                  value={formData.children}
                  onChange={handleChange}
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} child{num > 1 ? "ren" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="box">
                <label htmlFor="rooms">Rooms</label>
                <select
                  id="rooms"
                  name="rooms"
                  className="input"
                  value={formData.rooms}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} room{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="box">
              <label htmlFor="specialRequests">Special Requests</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                className="input"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="5"
                placeholder="Any special requests or considerations..."
              ></textarea>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <button
          type="button"
          className="btn"
          onClick={handleCheckAvailability}
          disabled={loading || !formData.roomType}
        >
          {loading ? "Checking..." : "Check Availability"}
        </button>

        <button
          type="submit"
          className="btn"
          disabled={
            isSubmitting ||
            !availabilityChecked ||
            !formData.roomType ||
            errors.roomType
          }
        >
          {isSubmitting ? "Processing..." : "Add to Cart"}
        </button>
      </form>

      <div className="reservation-info">
        <h2>Reservation Information</h2>
        <div className="info-content">
          <div className="info-item">
            <h3>
              <i className="fas fa-calendar-check"></i> Check-in Time
            </h3>
            <p>3:00 PM onwards</p>
          </div>

          <div className="info-item">
            <h3>
              <i className="fas fa-calendar-times"></i> Check-out Time
            </h3>
            <p>Until 12:00 PM</p>
          </div>

          <div className="info-item">
            <h3>
              <i className="fas fa-credit-card"></i> Payment
            </h3>
            <p>
              We accept all major credit cards and cash. A valid credit card is
              required to guarantee your reservation.
            </p>
          </div>

          <div className="info-item">
            <h3>
              <i className="fas fa-ban"></i> Cancellation Policy
            </h3>
            <p>
              Free cancellation up to 48 hours before arrival. Late
              cancellations or no-shows may be charged one night's stay.
            </p>
          </div>
        </div>
      </div>

      {/* Cart Added Modal */}
      {showCartModal && cartModalData && (
        <div
          className="cart-modal-overlay"
          onClick={() => setShowCartModal(false)}
        >
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Added to Cart!</h2>
            <div className="cart-modal-details">
              <p className="room-name">{cartModalData.roomName}</p>
              <div className="booking-info">
                <span>
                  <i className="fas fa-calendar-alt"></i>{" "}
                  {new Date(cartModalData.checkIn).toLocaleDateString()} -{" "}
                  {new Date(cartModalData.checkOut).toLocaleDateString()}
                </span>
                <span>
                  <i className="fas fa-moon"></i> {cartModalData.nights}{" "}
                  {cartModalData.nights === 1 ? "night" : "nights"}
                </span>
                <span>
                  <i className="fas fa-door-open"></i>{" "}
                  {cartModalData.numberOfRooms}{" "}
                  {cartModalData.numberOfRooms === 1 ? "room" : "rooms"}
                </span>
                <span>
                  <i className="fas fa-tag"></i> ${cartModalData.price}/night
                </span>
              </div>
            </div>
            <div className="cart-modal-actions">
              <button
                className="btn-continue"
                onClick={() => setShowCartModal(false)}
              >
                Make Another Reservation
              </button>
              <button
                className="btn-view-cart"
                onClick={() => navigate("/cart")}
              >
                View Cart <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reservation;
