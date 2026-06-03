const express = require("express");
const router = express.Router();
const inventoryService = require("../utils/inventoryService");
const dbInit = require("../utils/databaseInit");
const { protect, admin } = require("../middleware/authMiddleware");

// Middleware to check if database is ready
const checkDatabaseReady = (req, res, next) => {
  if (!dbInit.isDatabaseReady()) {
    return res.status(503).json({
      message: "Database is still initializing. Please try again in a moment.",
      status: dbInit.getInitStatus(),
    });
  }
  next();
};

/**
 * @route   GET /api/inventory
 * @desc    Get current inventory status for all room types
 * @access  Private/Admin
 */
router.get("/", protect, admin, checkDatabaseReady, async (req, res) => {
  try {
    const inventory = await inventoryService.getInventoryStatus();
    res.json(inventory);
  } catch (error) {
    console.error("Error getting inventory status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/inventory/status
 * @desc    Get current inventory status with today's availability for all room types
 * @access  Private/Admin
 */
router.get("/status", protect, admin, checkDatabaseReady, async (req, res) => {
  try {
    // First try to get basic inventory status which is more reliable
    let results = [];

    try {
      // Get inventory status from the roominventory table directly
      const inventory = await inventoryService.getInventoryStatus();

      if (inventory && Array.isArray(inventory)) {
        // Map to the format the frontend expects
        results = inventory.map((item) => ({
          roomType: item.roomType,
          availableRooms: item.availableRooms || 0,
          isAvailable: item.availableRooms > 0,
        }));
      }
    } catch (invError) {
      console.warn(
        "Could not get basic inventory, falling back to availability check:",
        invError
      );

      // Fallback: Use the availability service
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Use the existing inventory service to get availability data
        const roomAvailability = await inventoryService.getAvailabilityForDate(
          today
        );

        // Transform the data into the format our frontend expects
        for (const [roomType, data] of Object.entries(roomAvailability)) {
          results.push({
            roomType,
            availableRooms: data.availableRooms || 0,
            isAvailable: data.available === true,
          });
        }
      } catch (availError) {
        console.error("Availability fallback also failed:", availError);
        // If this fails too, we'll return an empty array rather than crashing
      }
    }

    // Even if all methods fail, at least return an empty array instead of a 500 error
    res.json(results);
  } catch (error) {
    console.error("Error getting current inventory status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/inventory/availability
 * @desc    Check availability for all room types in a date range
 * @access  Public
 */
router.get("/availability", checkDatabaseReady, async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({ message: "Please provide check-in and check-out dates" });
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    const availability = await inventoryService.getAvailabilityForDateRange(
      checkInDate,
      checkOutDate
    );

    res.json(availability);
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/inventory/:roomType/availability
 * @desc    Check availability for a specific room type and date range
 * @access  Public
 */
router.get("/:roomType/availability", checkDatabaseReady, async (req, res) => {
  try {
    const { roomType } = req.params;
    const { checkInDate, checkOutDate, rooms = 1 } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({ message: "Please provide check-in and check-out dates" });
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    const availability = await inventoryService.checkAvailability(
      roomType,
      checkInDate,
      checkOutDate,
      parseInt(rooms, 10)
    );

    res.json(availability);
  } catch (error) {
    console.error("Error checking room type availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
