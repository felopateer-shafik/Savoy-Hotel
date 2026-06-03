// BookingForm.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css";

const BookingForm = ({
  selectedRoom = null,
  onRoomAvailable = () => {},
  checkInDate: initialCheckInDate,
  checkOutDate: initialCheckOutDate,
}) => {
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState(
    initialCheckInDate ? new Date(initialCheckInDate) : new Date()
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialCheckOutDate
      ? new Date(initialCheckOutDate)
      : new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [roomType, setRoomType] = useState(
    selectedRoom ? selectedRoom.type : ""
  );
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [roomsData, setRoomsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Modal state for cart confirmation
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);

  const { addToCart } = useCart();

  // Keep local dates in sync when parent-provided dates change
  useEffect(() => {
    if (initialCheckInDate) {
      const d = new Date(initialCheckInDate);
      if (!isNaN(d)) setCheckInDate(d);
    }
    if (initialCheckOutDate) {
      const d = new Date(initialCheckOutDate);
      if (!isNaN(d)) setCheckOutDate(d);
    }
  }, [initialCheckInDate, initialCheckOutDate]);

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
        console.log("Rooms data loaded:", roomsMap);
      } catch (error) {
        console.error("Error fetching rooms data:", error);
        setError("Failed to load room information. Please refresh the page.");
      }
    };

    fetchRoomsData();
  }, []);

  // Load available room types on component mount
  useEffect(() => {
    // Wait for roomsData to be loaded from the database first
    if (Object.keys(roomsData).length > 0) {
      if (selectedRoom) {
        // If a room is pre-selected, use that
        setRoomType(selectedRoom.type);
        // Do NOT automatically check availability - wait for user to press the button
      } else {
        // Don't check availability on load - wait for user to press the Check Availability button
        // Just set up form with available room types from roomsData
        setAvailableRoomTypes(Object.keys(roomsData));
        console.log(
          "Setting available room types from roomsData:",
          Object.keys(roomsData)
        );
      }
    }
  }, [selectedRoom, roomsData]);

  // Helper function to get room name from database
  const getRoomName = (type) => {
    return roomsData[type]?.name || type;
  };

  // Helper function to get room price from database
  const getRoomPrice = (type) => {
    return roomsData[type]?.price || 0;
  };

  // Helper function to get room ID from database
  const getRoomId = (type) => {
    return roomsData[type]?.id || null;
  };

  const handleDateChange = (date, type) => {
    if (type === "checkIn") {
      setCheckInDate(date);
      // Ensure checkout is after checkin
      if (date >= checkOutDate) {
        const newCheckOut = new Date(date);
        newCheckOut.setDate(date.getDate() + 1);
        setCheckOutDate(newCheckOut);
      }
    } else {
      setCheckOutDate(date);
    }
  };

  const handleCheckAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage("");

      // Only check the exact date range needed
      const formattedCheckIn = checkInDate.toISOString().split("T")[0];
      const formattedCheckOut = checkOutDate.toISOString().split("T")[0];

      console.log(
        `Checking availability for dates: ${formattedCheckIn} to ${formattedCheckOut}`
      );

      // Call the optimized endpoint to check availability for the specific date range
      const response = await axios.get("/api/rooms/availability", {
        params: {
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
        },
      });

      console.log("Room availability response:", response.data);

      // Cache the availability data for later use
      setAvailabilityData(response.data);

      if (selectedRoom) {
        // Check if the selected room's type is available
        const roomTypeAvailability = response.data[selectedRoom.type];

        if (
          !roomTypeAvailability ||
          !roomTypeAvailability.available ||
          roomTypeAvailability.availableRooms < numberOfRooms
        ) {
          throw new Error(
            `This room is not available for the selected dates. Only ${
              roomTypeAvailability?.availableRooms || 0
            } rooms available.`
          );
        }

        // If we have a selected room, update the roomType state
        setRoomType(selectedRoom.type);

        // Update available room types array to include this type
        setAvailableRoomTypes([selectedRoom.type]);

        setSuccessMessage(
          `Room is available! ${roomTypeAvailability.availableRooms} rooms available for your dates.`
        );
      } else {
        // If no specific room selected, process the availability data directly
        processAvailabilityData(response.data);
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Process availability data without making an extra API call
  const processAvailabilityData = (availabilityData) => {
    // Only process if we have valid availability data
    if (!availabilityData) return;

    // Filter room types that are available for the requested number of rooms
    const availableTypes = Object.keys(availabilityData).filter(
      (type) =>
        availabilityData[type]?.available &&
        availabilityData[type]?.availableRooms >= numberOfRooms
    );

    console.log("Available room types:", availableTypes);
    setAvailableRoomTypes(availableTypes);

    // If the selected room is not available, reset the selection
    if (
      roomType &&
      (!availabilityData[roomType] ||
        !availabilityData[roomType]?.available ||
        availabilityData[roomType]?.availableRooms < numberOfRooms)
    ) {
      setRoomType(availableTypes.length > 0 ? availableTypes[0] : "");
    } else if (!roomType && availableTypes.length > 0) {
      // If no room is selected yet, select the first available one
      setRoomType(availableTypes[0]);
    }
  };

  // Legacy function maintained for compatibility
  const checkAvailability = async () => {
    try {
      const formattedCheckIn = checkInDate.toISOString().split("T")[0];
      const formattedCheckOut = checkOutDate.toISOString().split("T")[0];

      // Call the API to get availability data using the proper endpoint
      const response = await axios.get(`/api/rooms/availability`, {
        params: {
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
        },
      });

      console.log("Availability data from API:", response.data);

      // Store the data
      setAvailabilityData(response.data);

      // Process the data without making another API call
      processAvailabilityData(response.data);

      return response.data;
    } catch (error) {
      console.error("Error in checkAvailability:", error);
      setError("Failed to check room availability. Please try again.");
      throw error;
    }
  };

  // Handle the form submission to add to cart
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Validation
      if (!checkInDate || !checkOutDate) {
        throw new Error("Please select both check-in and check-out dates");
      }

      if (!roomType) {
        throw new Error("Please select a room type");
      }

      // Make sure availability was checked first
      if (!availabilityData) {
        throw new Error("Please check availability before booking");
      }

      // Format dates for availability check
      const formattedCheckIn = checkInDate.toISOString().split("T")[0];
      const formattedCheckOut = checkOutDate.toISOString().split("T")[0];

      // Use the availability data we've already fetched
      let roomAvailability = availabilityData[roomType];

      // If we don't have availability data for this room, throw an error
      if (!roomAvailability) {
        throw new Error("Please check availability for this room type first");
      }

      // Verify this room type is available for the dates and number of rooms
      if (
        !roomAvailability ||
        !roomAvailability.available ||
        roomAvailability.availableRooms < numberOfRooms
      ) {
        throw new Error(
          `Sorry, ${getRoomName(
            roomType
          )} is not available for the selected dates. Please choose different dates or a different room type.`
        );
      }

      // Calculate the number of nights - use a more efficient calculation
      const nights = Math.round(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get price and room info from database
      const price = getRoomPrice(roomType);
      const roomName = getRoomName(roomType);
      const roomId = getRoomId(roomType);

      // Find the room ID for this room type from availability data if not found in rooms data
      let finalRoomId = roomId;
      if (
        !finalRoomId &&
        roomAvailability.rooms &&
        roomAvailability.rooms.length > 0
      ) {
        finalRoomId = roomAvailability.rooms[0].id;
      }

      // Make sure we have the room data from the database
      if (!roomsData[roomType]) {
        throw new Error(
          `Room data not available for ${roomType}. Please try again.`
        );
      }

      // Create the cart item object first, before adding to cart
      const cartItem = {
        id: finalRoomId || roomsData[roomType].id || Date.now(),
        name: roomsData[roomType].name,
        type: roomType,
        price: roomsData[roomType].price,
        image: `${roomType}.jpg`,
        quantity: numberOfRooms,
        checkInDate: formattedCheckIn,
        checkOutDate: formattedCheckOut,
        numberOfRooms: numberOfRooms,
        numberOfGuests: numberOfGuests,
        nights: nights,
      };

      // Add to cart
      addToCart(cartItem);

      // Show modal instead of text success message
      setCartModalData({
        roomName: roomsData[roomType].name,
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        price: roomsData[roomType].price,
        nights: nights,
        numberOfRooms: numberOfRooms,
      });
      setShowCartModal(true);

      // Reset form
      if (!selectedRoom) {
        setRoomType("");
      }
      setNumberOfRooms(1);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-wrapper">
      <div className="container">
        <div className="booking-form-container">
          <h2 className="booking-title">
            {selectedRoom
              ? `Book ${getRoomName(selectedRoom.type)}`
              : "Book Your Stay"}
          </h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {loading && <div className="loading-message">Processing...</div>}

          {availabilityData && <div className="availability-checked"></div>}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Check-in Date</label>
                <DatePicker
                  selected={checkInDate}
                  onChange={(date) => handleDateChange(date, "checkIn")}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="date-input"
                />
              </div>

              <div className="form-group">
                <label>Check-out Date</label>
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date) => handleDateChange(date, "checkOut")}
                  minDate={new Date(checkInDate.getTime() + 86400000)} // 1 day after check-in
                  dateFormat="yyyy-MM-dd"
                  className="date-input"
                />
              </div>

              <div className="form-group">
                <label>Number of Rooms</label>
                <select
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(parseInt(e.target.value))}
                  className="select-input"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Number of Guests</label>
                <select
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                  className="select-input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Check Availability Button - Only enable this functionality when the button is clicked */}
            <div className="form-group check-availability">
              <button
                type="button"
                onClick={handleCheckAvailability}
                className="check-btn"
                disabled={loading}
              >
                {loading ? "Checking..." : "Check Availability"}
              </button>
            </div>

            {/* Only show room selection when availability has been checked */}
            {availabilityData && (
              <div className="room-selection">
                {/* Room type selection dropdown - only show if multiple types are available and no room is selected */}
                {!selectedRoom && availableRoomTypes.length > 0 && (
                  <div className="form-group">
                    <label>Select Room Type</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="select-input"
                    >
                      {availableRoomTypes.map((type) => {
                        // Make sure we have room data from the database
                        if (!roomsData[type]) {
                          console.warn(
                            `No database data for room type: ${type}`
                          );
                          return null;
                        }

                        return (
                          <option key={type} value={type}>
                            {roomsData[type].name} - ${roomsData[type].price}
                            /night (
                            {availabilityData[type]?.availableRooms || 0}{" "}
                            available)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Room details section */}
                {roomType &&
                  availabilityData[roomType] &&
                  roomsData[roomType] && (
                    <div className="room-details">
                      <h3>{roomsData[roomType].name}</h3>
                      <p className="price">
                        ${roomsData[roomType].price} per night
                      </p>
                      <p className="availability">
                        {availabilityData[roomType]?.availableRooms || 0} rooms
                        available for your dates
                      </p>
                    </div>
                  )}

                {/* Only show Add to Cart button if rooms are available */}
                {roomType &&
                  availabilityData[roomType] &&
                  availabilityData[roomType].available &&
                  availabilityData[roomType].availableRooms >=
                    numberOfRooms && (
                    <button
                      type="submit"
                      className="book-btn"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Add to Cart"}
                    </button>
                  )}
              </div>
            )}

            {/* Show message when no rooms are available */}
            {availabilityData &&
              (availableRoomTypes.length === 0 ||
                (roomType &&
                  (!availabilityData[roomType] ||
                    !availabilityData[roomType].available ||
                    availabilityData[roomType].availableRooms <
                      numberOfRooms))) && (
                <div className="no-availability">
                  <p>
                    {numberOfRooms > 1 &&
                    availabilityData[roomType]?.availableRooms > 0
                      ? `Only ${availabilityData[roomType]?.availableRooms} rooms available. Please reduce the number of rooms or select different dates.`
                      : `No rooms are available for the selected dates. Please try different dates.`}
                  </p>
                </div>
              )}
          </form>
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
                Continue Booking
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
    </div>
  );
};

export default BookingForm;
