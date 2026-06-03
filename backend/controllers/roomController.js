// controllers/roomController.js
const db = require("../models");
const { Op } = require("sequelize");
const inventoryService = require("../utils/inventoryService");

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice } = req.query;
    const filter = {};

    if (type) filter.type = type;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) filter.price[Op.lte] = parseFloat(maxPrice);
    }

    const rooms = await db.room.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });

    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await db.room.findByPk(req.params.id, {
      include: [
        {
          model: db.review,
          include: [{ model: db.user, attributes: ["id", "name"] }],
        },
      ],
    });

    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Public
exports.createRoom = async (req, res) => {
  try {
    const { features = [], ...roomData } = req.body;

    const newRoom = await db.room.create({
      ...roomData,
      features: Array.isArray(features) ? features : [features],
      availability:
        roomData.availability !== undefined ? roomData.availability : true,
    });

    res.status(201).json(newRoom);
  } catch (error) {
    handleSequelizeError(error, res);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Public
exports.updateRoom = async (req, res) => {
  try {
    const room = await db.room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const updated = await room.update(req.body);
    res.json(updated);
  } catch (error) {
    handleSequelizeError(error, res);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Public
exports.deleteRoom = async (req, res) => {
  try {
    const room = await db.room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    await room.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get room availability
// @route   GET /api/rooms/availability
// @access  Public
exports.getRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Missing date parameters" });
    }

    const [availabilityByType, rooms] = await Promise.all([
      inventoryService.getAvailabilityForDateRange(checkIn, checkOut),
      db.room.findAll(),
    ]);

    const roomsByType = rooms.reduce((acc, room) => {
      if (!acc[room.type]) {
        acc[room.type] = [];
      }
      acc[room.type].push(room);
      return acc;
    }, {});

    Object.entries(roomsByType).forEach(([roomType, roomList]) => {
      if (!availabilityByType[roomType]) {
        availabilityByType[roomType] = {
          totalRooms: 0,
          available: false,
          availableRooms: 0,
          message: "No availability data",
        };
      }
      availabilityByType[roomType].rooms = roomList;
    });

    Object.keys(availabilityByType).forEach((roomType) => {
      if (!availabilityByType[roomType].rooms) {
        availabilityByType[roomType].rooms = roomsByType[roomType] || [];
      }
    });

    res.json(availabilityByType);
  } catch (error) {
    console.error("Availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get rooms with availability data
// @route   GET /api/rooms/with-availability
// @access  Public
exports.getRoomsWithAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    console.log("Received availability request with dates:", req.query);

    if (!checkIn || !checkOut) {
      return res
        .status(400)
        .json({ message: "Please supply checkIn & checkOut" });
    }

    const [rooms, availabilityByType] = await Promise.all([
      db.room.findAll(),
      inventoryService.getAvailabilityForDateRange(checkIn, checkOut),
    ]);

    const roomsWithAvailability = rooms.map((room) => {
      const availability = availabilityByType[room.type] || {
        totalRooms: 0,
        available: false,
        availableRooms: 0,
        message: "No availability data",
      };

      const features = Array.isArray(room.features) ? room.features : [];

      const bookedRooms = Math.max(
        (availability.totalRooms || 0) - (availability.availableRooms || 0),
        0
      );

      return {
        id: room.id,
        name: room.name,
        type: room.type,
        price: room.price,
        description: room.description,
        mainImage: room.mainImage,
        features,
        rating: room.rating,
        availability: availability.available,
        totalRooms: availability.totalRooms || 0,
        bookedRooms,
        availableRooms: availability.availableRooms || 0,
        message: availability.message,
      };
    });

    res.json(roomsWithAvailability);
  } catch (error) {
    console.error("Full error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Check specific room availability
// @route   POST /api/rooms/check-availability
// @access  Public
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const room = await db.room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const availabilityByType =
      await inventoryService.getAvailabilityForDateRange(
        checkInDate,
        checkOutDate
      );

    const availability = availabilityByType[room.type] || {
      totalRooms: 0,
      availableRooms: 0,
      available: false,
      message: "No availability data",
    };

    const roomsRequested = parseInt(req.body.numberOfRooms, 10) || 1;
    const hasCapacity = availability.availableRooms >= roomsRequested;

    res.json({
      roomType: room.type,
      roomId: room.id,
      totalRooms: availability.totalRooms,
      availableRooms: availability.availableRooms,
      available: hasCapacity,
      message: hasCapacity
        ? availability.message || "Available"
        : `Only ${availability.availableRooms} rooms available for the selected dates`,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const handleSequelizeError = (error, res) => {
  console.error(error);
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: error.errors.map((err) => err.message),
    });
  }
  res.status(500).json({ message: "Server error" });
};
