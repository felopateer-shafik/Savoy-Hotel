// controllers/bookingController.js
const db = require("../models");
const { Op } = require("sequelize");
const inventoryService = require("../utils/inventoryService");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/Admin
exports.createBooking = async (req, res) => {
  const {
    roomId,
    roomType,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    numberOfRooms,
    guestName,
    guestEmail,
    guestPhone,
    address,
    city,
    country,
    zipCode,
    specialRequests = "",
    paymentMethod = "credit",
    pricePerNight,
    numberOfNights,
    totalPrice,
    status = "pending",
  } = req.body;

  // Validation - check for required fields
  if (
    !checkInDate ||
    !checkOutDate ||
    !numberOfGuests ||
    !numberOfRooms ||
    !guestName ||
    !guestEmail ||
    !guestPhone ||
    !totalPrice
  ) {
    console.log("Missing required fields:", {
      checkInDate: !checkInDate,
      checkOutDate: !checkOutDate,
      numberOfGuests: !numberOfGuests,
      numberOfRooms: !numberOfRooms,
      guestName: !guestName,
      guestEmail: !guestEmail,
      guestPhone: !guestPhone,
      totalPrice: !totalPrice,
    });
    return res.status(400).json({
      message: "Please provide all required fields",
    });
  }

  const t = await db.sequelize.transaction();
  try {
    let room = null;

    // If roomId is provided, verify room exists
    if (roomId) {
      room = await db.room.findByPk(roomId, { transaction: t });
      if (!room) {
        await t.rollback();
        return res.status(404).json({ message: "Room not found" });
      }
    } else if (roomType) {
      // If roomType is provided, find room by type
      room = await db.room.findOne({
        where: { type: roomType },
        transaction: t,
      });
      if (!room) {
        await t.rollback();
        return res
          .status(404)
          .json({ message: `Room type '${roomType}' not found` });
      }
    } else {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Room ID or room type is required" });
    }

    if (inventoryService && inventoryService.checkAvailability) {
      const availability = await inventoryService.checkAvailability(
        room.type,
        checkInDate,
        checkOutDate,
        numberOfRooms,
        { transaction: t }
      );
      if (!availability.available) {
        await t.rollback();
        return res.status(400).json({ message: availability.message });
      }
      await inventoryService.reserveRooms(
        room.type,
        checkInDate,
        checkOutDate,
        numberOfRooms,
        { transaction: t }
      );
    }

    const authenticatedUserId = req.user ? req.user.id : null;

    // Convert numberOfGuests to numberOfAdults (assuming all guests are adults)
    const numberOfAdults = parseInt(numberOfGuests, 10) || 1;
    const numberOfChildren = 0; // Default to 0 since frontend doesn't distinguish

    // Create booking with only the fields that exist in your current model
    const bookingData = {
      checkInDate,
      checkOutDate,
      numberOfAdults,
      numberOfChildren,
      numberOfRooms: parseInt(numberOfRooms, 10) || 1,
      totalPrice: parseFloat(totalPrice),
      specialRequests: specialRequests || "",
      paymentMethod,
      status:
        req.user && req.user.role === "admin" && status ? status : "pending",
      paymentStatus: "pending",
      userId: authenticatedUserId,
      roomId: room.id,
      guestName,
      guestEmail,
      guestPhone,
      guestAddress: address,
      guestCity: city,
      guestCountry: country,
      guestZipCode: zipCode,
      pricePerNight: pricePerNight ? parseFloat(pricePerNight) : null,
      numberOfNights: numberOfNights ? parseInt(numberOfNights, 10) : null,
    };

    const booking = await db.booking.create(bookingData, { transaction: t });

    await t.commit();

    res.status(201).json({
      booking,
      message: "Booking created successfully",
      bookingId: booking.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error in createBooking:", error);
    res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const bookings = await db.booking.findAll({
      include: [
        {
          model: db.room,
        },
        {
          model: db.user,
          attributes: ["id", "name", "email", "phone"],
          required: false, // Left join to include bookings without users
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const bookings = await db.booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: db.room }],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id, {
      include: [db.room, db.user],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role !== "admin") {
      if (booking.userId === null || booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update booking payment to paid
// @route   PUT /api/bookings/:id/pay
// @access  Private
exports.updateBookingToPaid = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role !== "admin" && booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Admin
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id, {
      include: [db.room],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (req.user.role !== "admin" && booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    // Release inventory if service is available
    try {
      if (inventoryService && inventoryService.releaseRooms) {
        await inventoryService.releaseRooms(
          booking.room.type,
          booking.checkInDate,
          booking.checkOutDate,
          booking.numberOfRooms
        );
      }
    } catch (inventoryError) {
      console.log(
        "Inventory service error during cancellation:",
        inventoryError.message
      );
      // Continue with cancellation even if inventory service fails
    }

    booking.status = "cancelled";
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }
    await booking.save();
    res.json({ booking, message: "Booking cancelled" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ message: "Please provide status" });
    const booking = await db.booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Complete a booking
// @route   PUT /api/bookings/:id/complete
// @access  Public
exports.completeBooking = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id, {
      include: [db.room],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (["cancelled", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Cannot complete a ${booking.status} booking` });
    }

    // Release future inventory if service is available
    try {
      if (inventoryService && inventoryService.releaseRooms) {
        const today = new Date().toISOString().slice(0, 10);
        if (booking.checkOutDate >= today) {
          await inventoryService.releaseRooms(
            booking.room.type,
            today,
            booking.checkOutDate,
            booking.numberOfRooms
          );
        }
      }
    } catch (inventoryError) {
      console.log(
        "Inventory service error during completion:",
        inventoryError.message
      );
      // Continue with completion even if inventory service fails
    }

    booking.status = "completed";
    await booking.save();
    res.json({ booking, message: "Booking completed" });
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};
