// Rooms.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import RoomAvailability from "../components/RoomAvailability";
import BookingForm from "../components/BookingForm";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Rooms.css";

const Rooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [generalRooms, setGeneralRooms] = useState([]); // Rooms with current day availability
  const [loading, setLoading] = useState(false); // No loading state initially for swiper section
  const [loadingGeneral, setLoadingGeneral] = useState(true); // Separate loading state for general section
  const [availabilityChecked, setAvailabilityChecked] = useState(false); // Track if availability has been checked
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [dates, setDates] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });
  const { addToCart } = useCart();

  // Modal state for cart confirmation
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);

  // Common utility functions
  const roomImageMap = {
    Honeymoon: "honeymoon.jpg",
    Deluxe: "deluxe.jpg",
    Luxury: "exclusive.jpg",
    Exclusive: "exclusive.jpg",
    Family: "family.jpg",
    Ocean: "panoramic.jpg",
    Panoramic: "panoramic.jpg",
    Presidential: "presidential.jpg",
  };

  const getImageName = (roomName) => {
    const name = roomName.toLowerCase();
    for (const [key, imageName] of Object.entries(roomImageMap)) {
      if (name.includes(key.toLowerCase())) {
        return imageName;
      }
    }
    return "default-room.jpg";
  };

  // Process features to ensure they're always arrays
  const processFeatures = (room) => {
    let features = [];
    if (room.features) {
      if (Array.isArray(room.features)) {
        features = room.features;
      } else if (typeof room.features === "string") {
        try {
          const parsedFeatures = JSON.parse(room.features);
          features = Array.isArray(parsedFeatures) ? parsedFeatures : [];
        } catch (e) {
          features = [room.features];
        }
      }
    }
    return features;
  };

  const fetchBasicRoomData = async () => {
    try {
      // Get all rooms without checking availability
      const roomsResponse = await axios.get("/api/rooms");

      if (!roomsResponse.data || roomsResponse.data.length === 0) {
        console.warn("No rooms data received from API");
        return [];
      }

      // Create a basic version of rooms with default availability (assume available)
      return roomsResponse.data.map((room) => {
        const rawPrice = parseFloat(room.price) || 0;
        const imageName = getImageName(room.name);

        return {
          id: room.id,
          name: room.name,
          type: room.type,
          description: room.description || "No description",
          price: `$${rawPrice.toFixed(2)}`,
          image: imageName,
          features: processFeatures(room),
          rating: parseFloat(room.rating) || 4.5,
          // Default to showing as available initially
          availableRooms: 1,
          availability: true,
        };
      });
    } catch (err) {
      console.error("Error fetching basic room data:", err);
      return [];
    }
  };

  // Fetch rooms without checking availability (for initial load of swiper section)
  const fetchBasicRoomsForSwiper = async () => {
    try {
      setError(null);

      // Just get all rooms without checking availability
      const roomsResponse = await axios.get("/api/rooms");

      if (!roomsResponse.data || roomsResponse.data.length === 0) {
        console.warn("No rooms data received from API");
        setRooms([]);
        return;
      }

      // Create a basic version of rooms without checking availability
      const basicRooms = roomsResponse.data.map((room) => {
        const rawPrice = parseFloat(room.price) || 0;
        const imageName = getImageName(room.name);

        return {
          id: room.id,
          name: room.name,
          type: room.type,
          description: room.description || "No description",
          price: `$${rawPrice.toFixed(2)}`,
          image: imageName,
          features: processFeatures(room),
          rating: parseFloat(room.rating) || 4.5,
          // Don't set availability info yet - availability is unknown until checked
          availableRooms: 0,
          availability: false,
          checkInDate: dates.checkIn,
          checkOutDate: dates.checkOut,
        };
      });

      setRooms(basicRooms);
    } catch (err) {
      console.error("Error fetching basic rooms:", err);
      setError("Failed to load rooms");
    }
  };

  // Fetch rooms WITH availability check (called when Check Availability button is pressed)
  const fetchRoomsWithAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Checking availability with dates:", dates);

      // First get room availability data for the search dates
      const availabilityResponse = await axios.get("/api/rooms/availability", {
        params: { checkIn: dates.checkIn, checkOut: dates.checkOut },
      });

      setAvailabilityChecked(true); // Mark that availability has been checked
      console.log(
        "Room availability data for search dates:",
        availabilityResponse.data
      );

      // We already have the rooms data from the availabilityResponse, no need to fetch again
      if (!availabilityResponse.data || !availabilityResponse.data.roomsData) {
        console.warn("No rooms data received from API");
        setRooms([]);
        setLoading(false);
        return;
      }

      const roomsData = availabilityResponse.data.roomsData;

      // Get availability data for today only for the general section
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];
      const currentAvailabilityResponse = await axios.get(
        "/api/rooms/availability",
        {
          params: { checkIn: today, checkOut: tomorrow },
        }
      );

      console.log(
        "Current day availability data:",
        currentAvailabilityResponse.data
      );

      // Then get all rooms
      const roomsResponse = await axios.get("/api/rooms");

      // Also get room inventory data with better error handling
      let inventoryData = [];
      try {
        const inventoryResponse = await axios.get("/api/inventory/status");
        console.log("Room inventory data:", inventoryResponse.data);
        inventoryData = inventoryResponse.data;
      } catch (invError) {
        console.error("Error fetching inventory data:", invError);
        // Continue with empty inventory data rather than failing completely
      }

      // Simply use the rooms data we already have
      const formattedRooms = roomsResponse.data.map((room) => {
        return {
          ...room,
          image: getImageName(room.name),
          features: processFeatures(room),
        };
      });

      // Map room availabilities
      const roomAvailabilityMap = {};
      if (
        availabilityResponse.data &&
        availabilityResponse.data.roomAvailabilities
      ) {
        availabilityResponse.data.roomAvailabilities.forEach((roomAvail) => {
          roomAvailabilityMap[roomAvail.roomId] = roomAvail.availability;
        });
      }

      // Create rooms for the date search (swiper cards)
      const validatedRooms = formattedRooms.map((room) => {
        const rawPrice = parseFloat(room.price) || 0;
        const imageName = getImageName(room.name);

        // Get availability information from the availability response for search dates
        const availabilityInfo = availabilityResponse.data.roomAvailabilities
          ? availabilityResponse.data.roomAvailabilities.find(
              (r) => r.roomId === room.id
            )
          : { available: false, availableRooms: 0 };

        const isAvailable = availabilityInfo
          ? availabilityInfo.availability
          : false;
        const availableRooms = availabilityInfo
          ? availabilityInfo.availableCount || 0
          : 0;

        console.log(
          `Room for search dates: ${room.name}, Type: ${room.type}, Available: ${isAvailable}, Count: ${availableRooms}`
        );

        return {
          id: room.id,
          name: room.name,
          type: room.type,
          description: room.description || "No description",
          price: `$${rawPrice.toFixed(2)}`,
          image: imageName,
          features: processFeatures(room),
          rating: parseFloat(room.rating) || 4.5,
          availableRooms: availableRooms,
          availability: isAvailable,
          checkInDate: dates.checkIn,
          checkOutDate: dates.checkOut,
        };
      });

      // Create rooms for the general section (based on current day availability and inventory)
      const generalRoomsData = roomsResponse.data.map((room) => {
        const rawPrice = parseFloat(room.price) || 0;
        const imageName = getImageName(room.name);

        // Get inventory information from inventory response
        let inventoryInfo = { availableRooms: 0, isAvailable: false };

        if (inventoryData && Array.isArray(inventoryData)) {
          // Try multiple matching strategies to find the inventory
          const foundInventory = inventoryData.find((inv) => {
            const invType = inv.roomType.toLowerCase().trim();
            const roomType = room.type.toLowerCase().trim();
            const roomName = room.name.toLowerCase().trim();

            // Try exact match first
            if (invType === roomType) return true;

            // Try matching with room name
            if (roomName.includes(invType) || invType.includes(roomType))
              return true;

            // Try specific mappings for common mismatches
            const typeMapping = {
              presidential: ["presidential suite", "presidential"],
              deluxe: ["deluxe room", "deluxe"],
              luxury: ["luxury suite", "exclusive suite", "luxury"],
              family: ["family suite", "family"],
              honeymoon: ["honeymoon suite", "honeymoon"],
              ocean: ["ocean view", "panoramic", "ocean"],
              panoramic: ["panoramic view", "ocean view", "panoramic"],
            };

            for (const [key, variants] of Object.entries(typeMapping)) {
              if (
                variants.some(
                  (variant) =>
                    invType.includes(variant) ||
                    roomType.includes(variant) ||
                    roomName.includes(variant)
                )
              ) {
                return (
                  invType.includes(key) ||
                  roomType.includes(key) ||
                  roomName.includes(key)
                );
              }
            }

            return false;
          });

          if (foundInventory) {
            inventoryInfo = foundInventory;
            console.log(
              `Found inventory for ${room.name}: ${foundInventory.availableRooms} available`
            );
          } else {
            console.log(
              `No inventory found for room: ${room.name} (type: ${room.type})`
            );
            console.log(
              "Available inventory types:",
              inventoryData.map((inv) => inv.roomType)
            );
          }
        }

        // Get today's availability from the current day response
        const todayAvailability = currentAvailabilityResponse.data
          .roomAvailabilities
          ? currentAvailabilityResponse.data.roomAvailabilities.find(
              (r) => r.roomId === room.id
            )
          : { available: false, availableRooms: 0 };

        // First try to use the inventory data for availability info
        let availableCount = 0;

        // If inventory data exists and has availableRooms, use that
        if (inventoryInfo && inventoryInfo.availableRooms !== undefined) {
          availableCount = parseInt(inventoryInfo.availableRooms, 10) || 0;
          console.log(`Room ${room.name} inventory count: ${availableCount}`);
        }
        // Otherwise fall back to today's availability data
        else if (
          todayAvailability &&
          todayAvailability.availableCount !== undefined
        ) {
          availableCount = parseInt(todayAvailability.availableCount, 10) || 0;
        }
        // If no data is available, set to 0
        else {
          availableCount = 0;
        }

        // Make sure we have a valid number
        if (isNaN(availableCount) || availableCount < 0) {
          availableCount = 0;
        }

        // Room is available if it has available rooms
        const isAvailable = availableCount > 0;

        console.log(
          `Room for general section: ${room.name}, Type: ${room.type}, Available: ${isAvailable}, Count: ${availableCount}`
        );

        return {
          id: room.id,
          name: room.name,
          type: room.type,
          description: room.description || "No description",
          price: `$${rawPrice.toFixed(2)}`,
          image: imageName,
          features: processFeatures(room),
          rating: parseFloat(room.rating) || 4.5,
          availableRooms: availableCount,
          availability: isAvailable,
          todayAvailability: todayAvailability
            ? todayAvailability.availability
            : true,
        };
      });

      setRooms(validatedRooms);
      setGeneralRooms(generalRoomsData);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
      setLoadingGeneral(false);
    }
  };

  // Function to refresh the general rooms data
  const refreshGeneralRooms = async () => {
    try {
      setLoadingGeneral(true);

      // Get current room data
      const roomsResponse = await axios.get("/api/rooms");

      // Get current inventory data
      const inventoryResponse = await axios.get("/api/inventory/status");
      const inventoryData = inventoryResponse.data;

      // Get today's availability
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];
      const currentAvailabilityResponse = await axios.get(
        "/api/rooms/availability",
        {
          params: { checkIn: today, checkOut: tomorrow },
        }
      );

      // Update general rooms with fresh inventory data
      const updatedGeneralRooms = roomsResponse.data.map((room) => {
        const rawPrice = parseFloat(room.price) || 0;
        const imageName = getImageName(room.name);

        // Get inventory information
        const inventoryInfo = inventoryData.find((inv) => {
          const invType = inv.roomType.toLowerCase().trim();
          const roomType = room.type.toLowerCase().trim();
          const roomName = room.name.toLowerCase().trim();

          // Try exact match first
          if (invType === roomType) return true;

          // Try matching with room name
          if (roomName.includes(invType) || invType.includes(roomType))
            return true;

          // Try specific mappings
          const typeMapping = {
            presidential: ["presidential suite", "presidential"],
            deluxe: ["deluxe room", "deluxe"],
            luxury: ["luxury suite", "exclusive suite", "luxury"],
            family: ["family suite", "family"],
            honeymoon: ["honeymoon suite", "honeymoon"],
            ocean: ["ocean view", "panoramic", "ocean"],
            panoramic: ["panoramic view", "ocean view", "panoramic"],
          };

          for (const [key, variants] of Object.entries(typeMapping)) {
            if (
              variants.some(
                (variant) =>
                  invType.includes(variant) ||
                  roomType.includes(variant) ||
                  roomName.includes(variant)
              )
            ) {
              return (
                invType.includes(key) ||
                roomType.includes(key) ||
                roomName.includes(key)
              );
            }
          }

          return false;
        });

        // Use inventory data for availability
        const availableCount = inventoryInfo
          ? parseInt(inventoryInfo.availableRooms, 10) || 0
          : 0;
        console.log(
          `Refresh - Room ${room.name} inventory count: ${availableCount}`
        );
        const isAvailable = availableCount > 0;

        return {
          id: room.id,
          name: room.name,
          type: room.type,
          description: room.description || "No description",
          price: `$${rawPrice.toFixed(2)}`,
          image: imageName,
          features: processFeatures(room),
          rating: parseFloat(room.rating) || 4.5,
          availableRooms: availableCount,
          availability: isAvailable,
        };
      });

      setGeneralRooms(updatedGeneralRooms);
    } catch (error) {
      console.error("Error refreshing general rooms:", error);
    } finally {
      setLoadingGeneral(false);
    }
  };

  useEffect(() => {
    // Load initial data for both sections without checking availability
    const loadInitialData = async () => {
      // Load basic data for the general section
      const basicRooms = await fetchBasicRoomData();
      setGeneralRooms(basicRooms);
      setLoadingGeneral(false);

      // Load basic data for the swiper section without checking availability
      fetchBasicRoomsForSwiper();
    };

    loadInitialData();
    // Don't add dates as a dependency - we don't want to refetch when dates change
    // Only fetch availability when the Check Availability button is clicked
  }, []);

  const handleDatesChange = (newDates) => {
    setDates({
      checkIn: newDates.checkIn,
      checkOut: newDates.checkOut,
    });
  };

  const handleAddToCart = async (room) => {
    try {
      // Check if availability has been checked first
      if (!availabilityChecked) {
        alert("Please check room availability before adding to cart.");
        return;
      }

      // Check if room is available before attempting to add to cart
      if (!room.availability || room.availableRooms <= 0) {
        alert(
          "Sorry, this room is currently unavailable for the selected dates."
        );
        return;
      }

      // Add to cart directly (no need for booking API call here)
      addToCart({
        id: room.id,
        name: room.name,
        type: getRoomType(room.name),
        price: parseFloat(room.price.replace("$", "")),
        image: room.image,
        nights:
          (new Date(dates.checkOut) - new Date(dates.checkIn)) /
          (1000 * 60 * 60 * 24),
        quantity: 1,
        checkInDate: dates.checkIn,
        checkOutDate: dates.checkOut,
      });

      // Refresh rooms data to update availability
      const newResponse = await axios.get("/api/rooms/with-availability", {
        params: { checkIn: dates.checkIn, checkOut: dates.checkOut },
      });
      setRooms(newResponse.data);

      // Show modal instead of alert
      setCartModalData({
        roomName: room.name,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        price: room.price,
        nights:
          (new Date(dates.checkOut) - new Date(dates.checkIn)) /
          (1000 * 60 * 60 * 24),
      });
      setShowCartModal(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(
        "Failed to add room to cart: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleBookRoom = (room) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to sign in with return path
      navigate("/signin", { state: { from: location } });
      return;
    }

    // Set the selected room for the booking form
    setSelectedRoom({
      id: room.id,
      name: room.name,
      type: getRoomType(room.name),
      price: room.price,
      image: room.image,
    });

    // Show the booking form
    setShowBookingForm(true);

    // Scroll to the booking form section
    const bookingSection = document.getElementById("booking-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback to window.scrollTo if element not found
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const getRoomType = (roomName) => {
    const typeMap = {
      "Luxury Suite": "exclusive",
      "Ocean View Room": "panoramic",
      "Family Suite": "family",
      "Honeymoon Suite": "honeymoon",
      "Deluxe Room": "deluxe",
      "Panoramic View Room": "panoramic",
      "Exclusive Suite": "exclusive",
      "Presidential Suite": "presidential",
    };
    return typeMap[roomName] || "unknown";
  };

  // handleBookRoom is already defined above

  const handleBookingComplete = (bookingDetails) => {
    setShowBookingForm(false);
    alert(`Your booking for ${bookingDetails.name} has been confirmed!`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <section className="room" id="room">
      <h1 className="heading">Our Rooms</h1>
      <RoomAvailability onDatesChange={handleDatesChange} />

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading available rooms...</p>
        </div>
      ) : (
        <>
          {rooms.length === 0 ? (
            <div className="no-rooms-found">
              <h3>No rooms available for selected dates</h3>
              <p>Please try different dates or contact our reservations team</p>
            </div>
          ) : (
            <Swiper
              spaceBetween={20}
              grabCursor={false}
              loop={true}
              centeredSlides={false}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ el: ".swiper-pagination", clickable: true }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                991: { slidesPerView: 3 },
              }}
              modules={[Pagination, Navigation, Autoplay]}
              className="room-slider"
            >
              {rooms.map((room) => {
                // Make sure room has all required properties
                if (!room || !room.id || !room.name) {
                  console.error("Invalid room data:", room);
                  return null; // Skip rendering this room
                }

                // Only show availability status if availability has been checked
                // Before availability is checked, all rooms should appear available
                const isAvailable = availabilityChecked
                  ? room.availability && room.availableRooms > 0
                  : true;
                const availabilityText =
                  availabilityChecked && !isAvailable ? "Not Available" : "";

                return (
                  <SwiperSlide
                    key={room.id}
                    className={`slide equal-height ${
                      availabilityChecked && !isAvailable
                        ? "unavailable-room"
                        : ""
                    }`}
                  >
                    <div className="image">
                      <span className="price">{room.price}/night</span>
                      {availabilityChecked && !isAvailable && (
                        <span className="no-availability-badge">
                          Not Available
                        </span>
                      )}
                      <img
                        src={`${process.env.PUBLIC_URL}/assets/images/${room.image}`}
                        alt={room.name}
                        onError={(e) => {
                          e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-room.jpg`;
                          e.target.onerror = null; // Prevent infinite loop
                        }}
                        className={
                          availabilityChecked && !isAvailable
                            ? "unavailable-img"
                            : ""
                        }
                      />
                    </div>
                    <div className="content">
                      <h3>{room.name}</h3>
                      <p>{room.description}</p>
                      <div className="features">
                        <h4>Features:</h4>
                        <ul>
                          {room.features.map((f, i) => (
                            <li key={i}>
                              <i className="fas fa-check"></i> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="stars">{renderStars(room.rating)}</div>
                      <button
                        onClick={() => handleBookRoom(room)}
                        className="btn"
                        disabled={availabilityChecked && !isAvailable}
                      >
                        {availabilityChecked && !isAvailable
                          ? "Not Available"
                          : "Book Now"}
                      </button>
                    </div>
                  </SwiperSlide>
                );
              })}
              <div className="swiper-pagination"></div>
              <div className="swiper-button-next"></div>
              <div className="swiper-button-prev"></div>
            </Swiper>
          )}
        </>
      )}

      <div id="booking-section" className="booking-section">
        {showBookingForm && (
          <>
            <BookingForm
              selectedRoom={selectedRoom}
              checkInDate={dates.checkIn}
              checkOutDate={dates.checkOut}
              // New callback prop:
              onRoomAvailable={(roomInfo) => {
                // 1) Add to cart
                addToCart({
                  id: roomInfo.id,
                  name: roomInfo.name,
                  price: roomInfo.price,
                  image: roomInfo.image || "/assets/images/default-room.jpg",
                  nights:
                    (new Date(dates.checkOut) - new Date(dates.checkIn)) /
                    (1000 * 60 * 60 * 24),
                  quantity: 1,
                  checkInDate: dates.checkIn,
                  checkOutDate: dates.checkOut,
                });

                // 2) Give user feedback
                alert(`${roomInfo.name} has been added to your cart!`);

                // 3) Close booking form
                setShowBookingForm(false);

                // 4) Re-fetch availability/list
                //    (trigger useEffect by bumping dates or forceReload state)
                setDates({ ...dates });
              }}
            />
          </>
        )}
      </div>

      <div className="room-grid">
        <h2 className="subheading">All Available Rooms</h2>
        {loadingGeneral ? (
          <div className="loading-container">
            <p>Loading rooms...</p>
          </div>
        ) : generalRooms.length === 0 ? (
          <div className="no-rooms-container">
            <p>No rooms available at this time.</p>
          </div>
        ) : (
          <div className="rooms-container">
            {generalRooms.map((room) => {
              // Make sure room has all required properties
              if (!room || !room.id || !room.name) {
                console.error("Invalid room data:", room);
                return null; // Skip rendering this room
              }

              // Check actual availability based on availableRooms from inventory
              const isAvailable = room.availableRooms > 0;
              const availabilityText = !isAvailable ? "Not Available" : "";

              return (
                <div
                  key={room.id}
                  className={`room-card ${
                    !isAvailable ? "unavailable-room" : ""
                  }`}
                >
                  <div className="image">
                    <span className="price">{room.price}/night</span>
                    {!isAvailable && (
                      <span className="no-availability-badge">
                        Not Available
                      </span>
                    )}
                    <img
                      src={`${process.env.PUBLIC_URL}/assets/images/${room.image}`}
                      alt={room.name}
                      onError={(e) => {
                        e.target.src = `${process.env.PUBLIC_URL}/assets/images/default-room.jpg`;
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                      className={!isAvailable ? "unavailable-img" : ""}
                    />
                  </div>
                  <div className="content">
                    <h3>{room.name}</h3>
                    <p>{room.description}</p>
                    <div className="features">
                      <h4>Features:</h4>
                      <ul>
                        {Array.isArray(room.features) &&
                        room.features.length > 0 ? (
                          room.features.map((f, i) => (
                            <li key={i}>
                              <i className="fas fa-check"></i> {f}
                            </li>
                          ))
                        ) : (
                          <li>
                            <i className="fas fa-info-circle"></i> No features
                            listed
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="stars">{renderStars(room.rating)}</div>
                    <button
                      onClick={() => handleBookRoom(room)}
                      className="btn"
                      disabled={!isAvailable}
                    >
                      {!isAvailable ? "Not Available" : "Book Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                  <i className="fas fa-tag"></i> {cartModalData.price}/night
                </span>
              </div>
            </div>
            <div className="cart-modal-actions">
              <button
                className="btn-continue"
                onClick={() => setShowCartModal(false)}
              >
                Continue Shopping
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

export default Rooms;
