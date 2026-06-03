// Checkout.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [roomsData, setRoomsData] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    checkInDate: "",
    checkOutDate: "",
    paymentMethod: "credit",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    noOfPeople: "1",
    specialRequests: "",
  });

  // Auto-populate dates from cart items on component mount
  useEffect(() => {
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      if (firstItem.checkInDate && firstItem.checkOutDate) {
        setFormData((prev) => ({
          ...prev,
          checkInDate: firstItem.checkInDate,
          checkOutDate: firstItem.checkOutDate,
          noOfPeople: prev.noOfPeople || "2", // Default to 2 guests if not set
        }));
      }
    }
  }, [cartItems]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const totalGuests = cartItems.reduce(
        (total, item) => total + (item.numberOfGuests || 2),
        0
      );
      setFormData((prev) => ({
        ...prev,
        noOfPeople: totalGuests.toString(),
      }));
    }
  }, [cartItems]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Formatting helpers for payment fields
  const MAX_CARD_DIGITS = 16; // default; dynamic per brand in formatter
  const getCardBrand = (digits) => {
    if (!digits) return "unknown";
    if (/^3[47]/.test(digits)) return "amex"; // American Express
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard"; // MasterCard including 2221-2720 range
    if (/^4/.test(digits)) return "visa"; // Visa
    return "unknown";
  };

  const isValidLuhn = (digits) => {
    if (!digits || /\D/.test(digits)) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i], 10);
      if (shouldDouble) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };
  const formatCardNumber = (value) => {
    const raw = (value || "").replace(/\D/g, "");
    const brand = getCardBrand(raw);
    const maxDigits = brand === "amex" ? 15 : MAX_CARD_DIGITS;
    const digits = raw.slice(0, maxDigits);
    if (!digits) return "";
    // Group into chunks of 1-4 and join with spaces
    const groups = digits.match(/.{1,4}/g) || [];
    let formatted = groups.join(" ");
    // If exactly divisible by 4 and not at max digits, add a trailing space
    if (digits.length % 4 === 0 && digits.length < maxDigits) {
      formatted += " ";
    }
    return formatted;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const formatExpiry = (value) => {
    let raw = (value || "").replace(/\D/g, "").slice(0, 4); // MMYY digits only

    // If first digit > 1, auto-prepend 0 to form a leading 0 month like 03
    if (raw.length === 1 && parseInt(raw, 10) > 1) {
      raw = "0" + raw;
    }

    if (raw.length === 0) return "";

    if (raw.length === 1) {
      return raw; // allow partial month "0" or "1"
    }

    // We have at least 2 digits -> clamp to valid month
    let mm = parseInt(raw.slice(0, 2), 10);
    if (isNaN(mm)) mm = 1;
    mm = Math.min(Math.max(mm, 1), 12);
    const month = String(mm).padStart(2, "0");
    const yy = raw.slice(2); // 0-2 digits of year

    // Immediately add slash after month, even if year isn't typed yet
    if (yy.length === 0) return month + "/";
    return month + "/" + yy;
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setFormData((prev) => ({ ...prev, expiryDate: formatted }));
    if (errors.expiryDate) setErrors((prev) => ({ ...prev, expiryDate: "" }));
  };

  const handleCVVChange = (e) => {
    const raw = (e.target.value || "").replace(/\D/g, "");
    const digitsOnlyCard = (formData.cardNumber || "").replace(/\D/g, "");
    const brand = getCardBrand(digitsOnlyCard);
    const max = brand === "amex" ? 4 : 3;
    const capped = raw.slice(0, max);
    setFormData((prev) => ({ ...prev, cvv: capped }));
    if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: "" }));
  };

  // Load room data from database on component mount
  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        const response = await axios.get("/api/rooms");
        const rooms = response.data;

        // Create a mapping of room types to their database info
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
        console.log("Rooms data loaded in Checkout:", roomsMap);
      } catch (error) {
        console.error("Error fetching rooms data in Checkout:", error);
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

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  // Redirect to rooms if cart is empty (but not if showing success modal)
  if (cartItems.length === 0 && !showSuccessModal) {
    navigate("/rooms");
    return null;
  }

  // Show only the success modal after booking is complete
  if (showSuccessModal) {
    return (
      <section className="checkout-section">
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Booking Confirmed!</h2>
            <p>Thank you for your reservation.</p>
            <p className="success-modal-subtext">
              We look forward to hosting you!
            </p>
            <button
              className="btn success-modal-btn"
              onClick={handleSuccessModalClose}
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    );
  }

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "country",
      "checkInDate",
      "checkOutDate",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.phone && !/^\+?[0-9\s\-()]{8,20}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Check-in date validation
    if (formData.checkInDate) {
      const checkIn = new Date(formData.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        newErrors.checkInDate = "Check-in date cannot be in the past";
      }
    }

    // Check-out date validation
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);

      if (checkOut <= checkIn) {
        newErrors.checkOutDate = "Check-out date must be after check-in date";
      }
    }

    // Payment validation - only if credit card is selected
    if (formData.paymentMethod === "credit") {
      const cardDigits = (formData.cardNumber || "").replace(/\s/g, "");
      const brand = getCardBrand(cardDigits);

      if (!formData.cardNumber || formData.cardNumber.trim() === "") {
        newErrors.cardNumber = "Card number is required";
      } else {
        // Length rules by brand
        const len = cardDigits.length;
        if (brand === "amex" && len !== 15) {
          newErrors.cardNumber =
            "American Express card numbers must be 15 digits";
        } else if ((brand === "visa" || brand === "mastercard") && len !== 16) {
          newErrors.cardNumber = "Visa/Mastercard numbers must be 16 digits";
        } else if (brand === "unknown" && len < 13) {
          newErrors.cardNumber = "Please enter a valid card number";
        } else if (!isValidLuhn(cardDigits)) {
          newErrors.cardNumber = "Invalid card number";
        }
      }

      if (!formData.cardName || formData.cardName.trim() === "") {
        newErrors.cardName = "Name on card is required";
      }

      if (!formData.expiryDate || formData.expiryDate.trim() === "") {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Please use format MM/YY";
      } else {
        // Expiry must be current month or later
        const [mmStr, yyStr] = formData.expiryDate.split("/");
        const mm = parseInt(mmStr, 10);
        const yy = parseInt(yyStr, 10);
        const year = 2000 + yy;
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();
        if (year < currentYear || (year === currentYear && mm < currentMonth)) {
          newErrors.expiryDate = "Card has expired";
        }
      }

      if (!formData.cvv || formData.cvv.trim() === "") {
        newErrors.cvv = "CVV is required";
      } else {
        const cvvDigits = formData.cvv.replace(/\D/g, "");
        const expected = brand === "amex" ? 4 : 3;
        if (!new RegExp(`^\\d{${expected}}$`).test(cvvDigits)) {
          newErrors.cvv =
            brand === "amex"
              ? "American Express CVV must be 4 digits"
              : "CVV must be 3 digits";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setIsLoading(true);

    try {
      // Create booking for each cart item
      const bookingPromises = cartItems.map(async (item, index) => {
        // Ensure we have valid dates, using item dates as fallback
        const checkInDate = formData.checkInDate || item.checkInDate;
        const checkOutDate = formData.checkOutDate || item.checkOutDate;

        if (!checkInDate || !checkOutDate) {
          throw new Error("Please provide valid check-in and check-out dates");
        }

        // Calculate nights properly
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.max(
          1,
          Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        );

        // Get price from rooms data or fallback to item price
        const roomPrice = roomsData[item.type]?.price || item.price || 0;
        const totalPrice = roomPrice * (item.quantity || 1) * nights;

        const bookingData = {
          // Room details
          roomType: item.type,
          roomId: roomsData[item.type]?.id || null,

          // Dates
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,

          // Quantities
          numberOfRooms: item.quantity || 1,
          numberOfGuests:
            item.numberOfGuests || parseInt(formData.noOfPeople) || 2,

          // Guest information
          guestName: formData.name.trim(),
          guestEmail: formData.email.trim(),
          guestPhone: formData.phone.trim(),

          // Address
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          zipCode: formData.zipCode?.trim() || "",

          // Additional details
          specialRequests: formData.specialRequests?.trim() || "",

          // Pricing
          pricePerNight: roomPrice,
          numberOfNights: nights,
          totalPrice: totalPrice + totalPrice * 0.1, // Include 10% tax

          // Payment
          paymentMethod: formData.paymentMethod,

          // Status
          status: "confirmed",

          // Timestamps
          createdAt: new Date().toISOString(),
        };

        console.log("Booking data being sent:", bookingData);

        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP Error: ${response.status} ${response.statusText}`,
          }));
          throw new Error(
            errorData.message || `Failed to create booking (${response.status})`
          );
        }

        return response.json();
      });

      // Wait for all bookings to be created
      const results = await Promise.all(bookingPromises);
      console.log("All bookings created successfully:", results);

      // Store booking data before clearing cart
      setCompletedBooking({
        items: [...cartItems],
        totalPrice,
        tax,
        grandTotal,
        formData: { ...formData },
      });

      // Clear cart and show success modal
      clearCart();

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error processing booking:", error);
      setErrors({
        form: `There was an error processing your booking: ${error.message}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const price = roomsData[item.type]?.price || item.price || 0;
    const nights =
      Math.round(
        (new Date(item.checkOutDate).getTime() -
          new Date(item.checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) || 1;
    const rooms = item.quantity || 1;
    return total + price * nights * rooms;
  }, 0);

  const tax = totalPrice * 0.1; // 10% tax
  const grandTotal = totalPrice + tax;

  return (
    <section className="checkout-section">
      <h1 className="heading">Checkout</h1>

      {errors.form && <div className="alert alert-danger">{errors.form}</div>}

      <div className="checkout-container">
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Personal Information</h2>

              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? "error" : ""}`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    Email <span>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? "error" : ""}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone <span>*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-control ${errors.phone ? "error" : ""}`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <div className="error-message">{errors.phone}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Address Information</h2>

              <div className="form-group">
                <label htmlFor="address">
                  Address <span>*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={`form-control ${errors.address ? "error" : ""}`}
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <div className="error-message">{errors.address}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">
                    City <span>*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`form-control ${errors.city ? "error" : ""}`}
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && (
                    <div className="error-message">{errors.city}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="country">
                    Country <span>*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className={`form-control ${errors.country ? "error" : ""}`}
                    value={formData.country}
                    onChange={handleChange}
                  />
                  {errors.country && (
                    <div className="error-message">{errors.country}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    className="form-control"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Booking Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkInDate">Check-in Date</label>
                  <input
                    type="date"
                    id="checkInDate"
                    name="checkInDate"
                    className="form-control"
                    value={formData.checkInDate}
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkOutDate">Check-out Date</label>
                  <input
                    type="date"
                    id="checkOutDate"
                    name="checkOutDate"
                    className="form-control"
                    value={formData.checkOutDate}
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="noOfPeople">Number of Guests</label>
                <input
                  type="text"
                  id="noOfPeople"
                  name="noOfPeople"
                  className="form-control"
                  value={`${formData.noOfPeople} ${
                    formData.noOfPeople === 1 ? "person" : "people"
                  }`}
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  className="form-control"
                  rows="4"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requests or considerations..."
                ></textarea>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Information</h2>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods">
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="credit"
                      name="paymentMethod"
                      value="credit"
                      checked={formData.paymentMethod === "credit"}
                      onChange={handleChange}
                    />
                    <label htmlFor="credit">Credit / Debit Card</label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      id="payAtHotel"
                      name="paymentMethod"
                      value="payAtHotel"
                      checked={formData.paymentMethod === "payAtHotel"}
                      onChange={handleChange}
                    />
                    <label htmlFor="payAtHotel">Pay at Hotel</label>
                  </div>
                </div>
              </div>

              {formData.paymentMethod === "credit" && (
                <div className="credit-card-details">
                  <div className="form-group">
                    <label htmlFor="cardNumber">
                      Card Number <span>*</span>
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      className={`form-control ${
                        errors.cardNumber ? "error" : ""
                      }`}
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19} // 16 digits + 3 spaces
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                    {errors.cardNumber && (
                      <div className="error-message">{errors.cardNumber}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardName">
                      Name on Card <span>*</span>
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      className={`form-control ${
                        errors.cardName ? "error" : ""
                      }`}
                      value={formData.cardName}
                      onChange={handleChange}
                    />
                    {errors.cardName && (
                      <div className="error-message">{errors.cardName}</div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">
                        Expiry Date <span>*</span>
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        className={`form-control ${
                          errors.expiryDate ? "error" : ""
                        }`}
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        maxLength={5} // MM/YY
                        placeholder="MM/YY"
                      />
                      {errors.expiryDate && (
                        <div className="error-message">{errors.expiryDate}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvv">
                        CVV <span>*</span>
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        className={`form-control ${errors.cvv ? "error" : ""}`}
                        value={formData.cvv}
                        onChange={handleCVVChange}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={
                          /^(34|37)/.test(
                            (formData.cardNumber || "").replace(/\D/g, "")
                          )
                            ? 4
                            : 3
                        }
                        placeholder={
                          /^(34|37)/.test(
                            (formData.cardNumber || "").replace(/\D/g, "")
                          )
                            ? "1234"
                            : "123"
                        }
                      />
                      {errors.cvv && (
                        <div className="error-message">{errors.cvv}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Processing..." : "Complete Booking"}
              </button>
            </div>
          </form>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="cart-items-summary">
            {cartItems.map((item) => {
              // Use room data from database when available
              const displayName = roomsData[item.type]?.name || item.name;
              const displayPrice =
                roomsData[item.type]?.price || item.price || 0;
              const nights =
                Math.round(
                  (new Date(item.checkOutDate).getTime() -
                    new Date(item.checkInDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) || 1;
              const subtotal = (displayPrice * nights * item.quantity).toFixed(
                2
              );

              return (
                <div key={item.id} className="summary-item">
                  <div className="item-image">
                    <img
                      src={`${process.env.PUBLIC_URL}/assets/images/${item.image}`}
                      alt={displayName}
                    />
                  </div>
                  <div className="item-details">
                    <h3>{displayName}</h3>
                    <p>
                      ${displayPrice} x {nights} night{nights > 1 ? "s" : ""}
                      {item.quantity > 1 ? ` × ${item.quantity} rooms` : ""}
                    </p>
                    <p className="item-dates">
                      {item.checkInDate} to {item.checkOutDate}
                    </p>
                    <p className="item-guests">
                      {item.numberOfGuests} guest
                      {item.numberOfGuests > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="item-subtotal">${subtotal}</div>
                </div>
              );
            })}
          </div>

          <div className="price-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="booking-details">
            <h3>Your Booking</h3>
            <p>
              <strong>Items:</strong>
              {cartItems.reduce((total, item) => {
                const nights =
                  Math.round(
                    (new Date(item.checkOutDate).getTime() -
                      new Date(item.checkInDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) || 1;
                return total + nights;
              }, 0)}
              night(s)
            </p>
            <p>
              <strong>Rooms:</strong>{" "}
              {cartItems.reduce(
                (total, item) => total + (item.quantity || 1),
                0
              )}
            </p>
            <p>
              <strong>Guests:</strong>{" "}
              {cartItems.reduce(
                (total, item) => total + (item.numberOfGuests || 2),
                0
              )}
            </p>
            <p>
              <strong>Check-in:</strong> {cartItems[0]?.checkInDate}
            </p>
            <p>
              <strong>Check-out:</strong> {cartItems[0]?.checkOutDate}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
