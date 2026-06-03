// Cart.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import "./Cart.css";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const navigate = useNavigate();
  const [roomsData, setRoomsData] = useState({});
  const [availabilityCache, setAvailabilityCache] = useState({}); // key: "checkIn|checkOut" -> availability map by type

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
        console.log("Rooms data loaded in Cart:", roomsMap);
      } catch (error) {
        console.error("Error fetching rooms data in Cart:", error);
      }
    };

    fetchRoomsData();
  }, []);

  // Fetch availability for each unique date range present in the cart
  useEffect(() => {
    const ranges = Array.from(
      new Set(
        cartItems
          .filter((i) => i.checkInDate && i.checkOutDate)
          .map((i) => `${i.checkInDate}|${i.checkOutDate}`)
      )
    );

    const missingRanges = ranges.filter((key) => !availabilityCache[key]);
    if (missingRanges.length === 0) return;

    const fetchRange = async (key) => {
      const [checkIn, checkOut] = key.split("|");
      try {
        const response = await axios.get("/api/rooms/availability", {
          params: { checkIn, checkOut },
        });
        return { key, data: response.data };
      } catch (e) {
        console.error("Error fetching availability for", key, e);
        return { key, data: null };
      }
    };

    (async () => {
      const results = await Promise.all(missingRanges.map(fetchRange));
      setAvailabilityCache((prev) => {
        const next = { ...prev };
        results.forEach(({ key, data }) => {
          if (data) next[key] = data;
        });
        return next;
      });
    })();
  }, [cartItems, availabilityCache]);

  const getAvailableRoomsForItem = (item) => {
    if (!item?.checkInDate || !item?.checkOutDate || !item?.type) return null;
    const key = `${item.checkInDate}|${item.checkOutDate}`;
    const range = availabilityCache[key];
    if (!range) return null;
    const info = range[item.type];
    if (!info) return null;
    // info.availableRooms expected from API
    return typeof info.availableRooms === "number" ? info.availableRooms : null;
  };

  // Check if two date ranges overlap
  const datesOverlap = (start1, end1, start2, end2) => {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();
    // Two ranges overlap if one starts before the other ends
    return s1 < e2 && s2 < e1;
  };

  // Calculate total rooms requested for a specific type that overlap with given date range
  const getTotalRequestedRoomsOverlapping = (
    type,
    checkInDate,
    checkOutDate,
    excludeCartItemId = null
  ) => {
    return cartItems
      .filter(
        (item) =>
          item.type === type &&
          item.cartItemId !== excludeCartItemId &&
          datesOverlap(
            item.checkInDate,
            item.checkOutDate,
            checkInDate,
            checkOutDate
          )
      )
      .reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate total rooms requested for exact same type and date range
  const getTotalRequestedRooms = (type, checkInDate, checkOutDate) => {
    return cartItems
      .filter(
        (item) =>
          item.type === type &&
          item.checkInDate === checkInDate &&
          item.checkOutDate === checkOutDate
      )
      .reduce((total, item) => total + item.quantity, 0);
  };

  // Check if cart has any conflicts (total requested > available) including overlapping dates
  const getCartConflicts = () => {
    const conflicts = [];
    const checkedCombos = new Set();

    // Group items by type
    const itemsByType = {};
    cartItems.forEach((item) => {
      if (!item?.checkInDate || !item?.checkOutDate || !item?.type) return;
      if (!itemsByType[item.type]) itemsByType[item.type] = [];
      itemsByType[item.type].push(item);
    });

    // For each type, check for overlapping conflicts
    Object.entries(itemsByType).forEach(([type, items]) => {
      // For each item, check if total overlapping rooms exceed availability
      items.forEach((item) => {
        const comboKey = `${item.type}|${item.checkInDate}|${item.checkOutDate}`;
        if (checkedCombos.has(comboKey)) return;
        checkedCombos.add(comboKey);

        const available = getAvailableRoomsForItem(item);
        if (typeof available !== "number") return;

        // Get all items of same type that overlap with this item's dates
        const overlappingTotal = items
          .filter((other) =>
            datesOverlap(
              item.checkInDate,
              item.checkOutDate,
              other.checkInDate,
              other.checkOutDate
            )
          )
          .reduce((sum, i) => sum + i.quantity, 0);

        if (overlappingTotal > available) {
          conflicts.push({
            type: item.type,
            checkInDate: item.checkInDate,
            checkOutDate: item.checkOutDate,
            requested: overlappingTotal,
            available: available,
            isOverlap: true,
          });
        }
      });
    });

    return conflicts;
  };

  // Helper function to get room name from database
  const getRoomName = (type) => {
    return roomsData[type]?.name || type;
  };

  // Helper function to get room price from database
  const getRoomPrice = (type) => {
    return roomsData[type]?.price || 0;
  };

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(cartItemId, { quantity: newQuantity });
    }
  };

  const handleNightsChange = (cartItemId, newNights) => {
    const item = cartItems.find((item) => item.cartItemId === cartItemId);
    if (newNights >= 1 && item) {
      // Calculate new checkout date based on check-in date and nights
      const checkInDate = new Date(item.checkInDate);
      const newCheckOutDate = new Date(checkInDate);
      newCheckOutDate.setDate(checkInDate.getDate() + newNights);

      updateQuantity(cartItemId, {
        nights: newNights,
        checkOutDate: newCheckOutDate.toISOString().split("T")[0],
      });
    }
  };

  const handleCheckout = async () => {
    // Final availability check before checkout
    const conflicts = getCartConflicts();

    if (conflicts.length > 0) {
      const conflictMessages = conflicts
        .map(
          (c) =>
            `${c.type}: You requested ${c.requested} rooms but only ${
              c.available
            } are available for ${new Date(
              c.checkInDate
            ).toLocaleDateString()} - ${new Date(
              c.checkOutDate
            ).toLocaleDateString()}`
        )
        .join("\n");

      alert(
        `Cannot proceed to checkout:\n\n${conflictMessages}\n\nPlease adjust your selections.`
      );
      return;
    }

    // Navigate to checkout page
    navigate("/checkout");
  };

  // Function to calculate item total with correct price from database
  const getItemTotal = (item) => {
    if (roomsData[item.type]) {
      // Always use the database price if available
      return (
        roomsData[item.type].price *
        item.quantity *
        (item.nights || 1)
      ).toFixed(2);
    } else {
      // Fallback to the item's price if database data isn't loaded yet
      return (item.price * item.quantity * (item.nights || 1)).toFixed(2);
    }
  };

  // Function to calculate cart total with correct prices from database
  const getCorrectCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (roomsData[item.type]) {
        // Always use the database price if available
        return (
          total +
          roomsData[item.type].price * item.quantity * (item.nights || 1)
        );
      } else {
        // Fallback to the item's price if database data isn't loaded yet
        return total + item.price * item.quantity * (item.nights || 1);
      }
    }, 0);
  };

  if (cartItems.length === 0) {
    return (
      <section className="cart-section empty-cart">
        <h1 className="heading">Your Cart</h1>
        <div className="empty-cart-container">
          <i className="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>
            You have no items in your shopping cart.
            <br />
            Let's go book some rooms!
          </p>
          <Link to="/rooms" className="btn">
            Explore Rooms
          </Link>
        </div>
      </section>
    );
  }

  const correctTotal = getCorrectCartTotal();

  // Check for conflicts where total requested rooms exceed availability
  const cartConflicts = getCartConflicts();
  const hasConflicts = cartConflicts.length > 0;

  return (
    <section className="cart-section">
      <h1 className="heading">Your Cart</h1>
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map((item) => {
            // Always use database information when available
            const displayName = roomsData[item.type]?.name || item.name;
            const displayPrice = roomsData[item.type]?.price || item.price || 0;
            // Use cartItemId as the unique key
            const itemKey = item.cartItemId || item.id;

            return (
              <div key={itemKey} className="cart-item">
                <div className="item-header">
                  <h3 className="item-name">{displayName}</h3>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.cartItemId)}
                    aria-label="Remove from cart"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="item-grid">
                  <div className="item-section">
                    <div className="item-label">Reservation Dates</div>
                    <div className="item-dates">
                      {item.checkInDate && item.checkOutDate ? (
                        <span>
                          {new Date(item.checkInDate).toLocaleDateString()} to{" "}
                          {new Date(item.checkOutDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>Dates not specified</span>
                      )}
                    </div>
                  </div>

                  <div className="item-section">
                    <div className="item-label">Stay Duration</div>
                    <div className="item-quantity">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => {
                            // Calculate new checkout date based on checkInDate and reduced nights
                            const currentNights = item.nights || 1;
                            if (currentNights > 1) {
                              // Only proceed if checkInDate exists
                              if (item.checkInDate) {
                                const checkInDate = new Date(item.checkInDate);
                                const newCheckOutDate = new Date(checkInDate);
                                newCheckOutDate.setDate(
                                  checkInDate.getDate() + (currentNights - 1)
                                );

                                updateQuantity(item.cartItemId, {
                                  nights: currentNights - 1,
                                  checkOutDate: newCheckOutDate
                                    .toISOString()
                                    .split("T")[0],
                                });
                              } else {
                                // If no check-in date, just update nights
                                updateQuantity(item.cartItemId, {
                                  nights: currentNights - 1,
                                });
                              }
                            }
                          }}
                          disabled={(item.nights || 1) <= 1}
                          aria-label="Decrease nights"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="nights-count">
                          {item.nights || 1}{" "}
                          {(item.nights || 1) === 1 ? "night" : "nights"}
                        </span>
                        <button
                          className="quantity-btn"
                          onClick={() => {
                            // Calculate new checkout date based on checkInDate and increased nights
                            const currentNights = item.nights || 1;
                            // Only proceed with date calculation if checkInDate exists
                            if (item.checkInDate) {
                              const checkInDate = new Date(item.checkInDate);
                              const newCheckOutDate = new Date(checkInDate);
                              newCheckOutDate.setDate(
                                checkInDate.getDate() + (currentNights + 1)
                              );

                              updateQuantity(item.cartItemId, {
                                nights: currentNights + 1,
                                checkOutDate: newCheckOutDate
                                  .toISOString()
                                  .split("T")[0],
                              });
                            } else {
                              // If no check-in date, just update nights
                              updateQuantity(item.cartItemId, {
                                nights: currentNights + 1,
                              });
                            }
                          }}
                          aria-label="Increase nights"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="item-section">
                    <div className="item-label">Number of Rooms</div>
                    <div className="item-rooms">
                      <div className="quantity-controls">
                        {(() => {
                          const avail = getAvailableRoomsForItem(item);
                          // Calculate total requested rooms for same type with OVERLAPPING dates (excluding current item)
                          const otherItemsTotal = cartItems
                            .filter(
                              (i) =>
                                i.cartItemId !== item.cartItemId &&
                                i.type === item.type &&
                                datesOverlap(
                                  i.checkInDate,
                                  i.checkOutDate,
                                  item.checkInDate,
                                  item.checkOutDate
                                )
                            )
                            .reduce((sum, i) => sum + i.quantity, 0);

                          // Max this item can have = available - what others have reserved
                          const maxForThisItem =
                            typeof avail === "number"
                              ? Math.max(0, avail - otherItemsTotal)
                              : Infinity;

                          const disablePlus = item.quantity >= maxForThisItem;
                          const plusTitle =
                            disablePlus && typeof avail === "number"
                              ? `Only ${avail} total rooms available for these dates (${otherItemsTotal} reserved in overlapping cart items)`
                              : undefined;
                          return (
                            <>
                              <button
                                className="quantity-btn"
                                onClick={() =>
                                  updateQuantity(item.cartItemId, {
                                    quantity: Math.max(1, item.quantity - 1),
                                  })
                                }
                                disabled={item.quantity <= 1}
                                aria-label="Decrease rooms"
                                title={
                                  item.quantity <= 1
                                    ? "Minimum 1 room"
                                    : undefined
                                }
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <span className="room-count">
                                {item.quantity}{" "}
                                {item.quantity === 1 ? "room" : "rooms"}
                              </span>
                              <button
                                className={`quantity-btn${
                                  disablePlus ? " disabled" : ""
                                }`}
                                onClick={() =>
                                  updateQuantity(item.cartItemId, {
                                    quantity: item.quantity + 1,
                                  })
                                }
                                disabled={disablePlus}
                                aria-label="Increase rooms"
                                title={plusTitle}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    {(() => {
                      const avail = getAvailableRoomsForItem(item);
                      // Check for overlapping reservations
                      const overlappingTotal = cartItems
                        .filter(
                          (i) =>
                            i.type === item.type &&
                            datesOverlap(
                              i.checkInDate,
                              i.checkOutDate,
                              item.checkInDate,
                              item.checkOutDate
                            )
                        )
                        .reduce((sum, i) => sum + i.quantity, 0);

                      const hasConflict =
                        typeof avail === "number" && overlappingTotal > avail;
                      return hasConflict ? (
                        <div className="availability-note error">
                          ⚠️ Total {overlappingTotal} rooms requested but only{" "}
                          {avail} available for overlapping dates
                        </div>
                      ) : typeof avail === "number" &&
                        item.quantity >= avail ? (
                        <div className="availability-note">
                          Only {avail} available rooms for the selected dates
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <div className="item-section">
                    <div className="item-label">Rate</div>
                    <div className="item-price">
                      ${displayPrice}
                      <span className="per-night">/night</span>
                    </div>
                  </div>
                </div>

                <div className="item-footer">
                  <div className="total-section">
                    <div className="item-label">Total Cost</div>
                    <div className="item-total">${getItemTotal(item)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h2>Reservation Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${correctTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%):</span>
            <span>${(correctTotal * 0.1).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${(correctTotal * 1.1).toFixed(2)}</span>
          </div>
          <button
            className="btn checkout-btn"
            onClick={handleCheckout}
            disabled={hasConflicts}
            aria-disabled={hasConflicts}
            title={
              hasConflicts
                ? "Total rooms requested exceed availability. Please adjust quantities before checkout."
                : undefined
            }
          >
            Proceed to Checkout
          </button>
          {hasConflicts && (
            <div className="summary-warning" role="alert">
              {cartConflicts.map((conflict, idx) => (
                <div key={idx}>
                  <strong>{conflict.type}:</strong> {conflict.requested} rooms
                  requested but only {conflict.available} available
                  {conflict.isOverlap ? " (overlapping dates)" : ""} around{" "}
                  {new Date(conflict.checkInDate).toLocaleDateString()} -{" "}
                  {new Date(conflict.checkOutDate).toLocaleDateString()}
                </div>
              ))}
            </div>
          )}
          <button className="btn clear-btn" onClick={clearCart}>
            Clear Cart
          </button>
          <Link to="/rooms" className="continue-shopping">
            <i className="fas fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cart;
