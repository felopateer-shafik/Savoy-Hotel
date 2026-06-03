import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RoomAvailability.css";

const RoomAvailability = ({ onDatesChange }) => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState(null);
  const [checkedDates, setCheckedDates] = useState(null);

  const handleCheckAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      setAvailabilityResults(null);

      // Basic validation
      if (!checkInDate || !checkOutDate) {
        throw new Error("Please select both check-in and check-out dates");
      }
      if (checkInDate >= checkOutDate) {
        throw new Error("Check-out date must be after check-in date");
      }

      // Format dates as YYYY-MM-DD
      const formattedCheckIn = checkInDate.toISOString().slice(0, 10);
      const formattedCheckOut = checkOutDate.toISOString().slice(0, 10);

      // Fetch availability data directly
      const response = await axios.get('/api/rooms/availability', {
        params: {
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut
        }
      });

      // Check if we got availability data
      if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error("No availability data returned from server");
      }

      console.log("Availability results:", response.data);
      
      // Set availability results
      setAvailabilityResults(response.data);
      setCheckedDates({
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut
      });

      // Tell the parent (Rooms) about the new dates so it can re-fetch rooms
      onDatesChange({
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
      });
    } catch (err) {
      console.error('Error checking availability:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date, type) => {
    const zeroTime = (d) => {
      d.setHours(0, 0, 0, 0);
      return d;
    };
    const d = zeroTime(new Date(date));

    if (type === "checkIn") {
      setCheckInDate(d);
      // auto-bump checkout if necessary
      if (d >= checkOutDate) {
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        setCheckOutDate(zeroTime(next));
      }
    } else {
      setCheckOutDate(d);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="room-availability-container">
      <h2>Check Room Availability</h2>
      <div className="availability-controls">
        <div className="date-picker-group">
          <div className="date-picker-wrapper">
            <label>Check-in Date</label>
            <DatePicker
              selected={checkInDate}
              onChange={(d) => handleDateChange(d, "checkIn")}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              className="date-input"
              popperPlacement="bottom-start"
            />
          </div>
          <div className="date-picker-wrapper">
            <label>Check-out Date</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(d) => handleDateChange(d, "checkOut")}
              minDate={new Date(checkInDate.getTime() + 86400000)}
              dateFormat="MMMM d, yyyy"
              className="date-input"
              popperPlacement="bottom-start"
            />
          </div>
        </div>
        <button
          className={`availability-btn ${loading ? "loading" : ""}`}
          onClick={handleCheckAvailability}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Checking...
            </>
          ) : (
            "Check Availability"
          )}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle" /> {error}
        </div>
      )}
      
      {availabilityResults && (
        <div className="availability-results">
          <h3>Availability for {checkedDates && (
            <span>
              {formatDate(checkedDates.checkIn)} to {formatDate(checkedDates.checkOut)}
            </span>
          )}</h3>
          
          <div className="room-type-availability">
            {Object.entries(availabilityResults).length > 0 ? (
              Object.entries(availabilityResults).map(([roomType, data]) => (
                <div key={roomType} className={`room-availability-item ${!data.available ? 'unavailable' : ''}`}>
                  <div className="room-type">{roomType.charAt(0).toUpperCase() + roomType.slice(1)}</div>
                  <div className="availability-status">
                    {data.available ? (
                      <span className="available">
                        <i className="fas fa-check-circle"></i>
                        Available ({data.availableRooms} rooms)
                      </span>
                    ) : (
                      <span className="unavailable">
                        <i className="fas fa-times-circle"></i>
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-availability-data">
                <p>No availability data found for the selected dates. Please try different dates.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAvailability;
