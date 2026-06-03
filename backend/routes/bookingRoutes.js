// bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/authMiddleware");

// Protected routes (user)
router.post("/", bookingController.createBooking);
router.get("/", protect, admin, bookingController.getBookings);
router.get("/mybookings", protect, bookingController.getMyBookings);
router.get("/:id", protect, bookingController.getBookingById);
router.put("/:id/pay", protect, bookingController.updateBookingToPaid);
router.put("/:id/cancel", protect, bookingController.cancelBooking);

// Protected routes (admin only)
router.put(
  "/:id/status",
  protect,
  admin,
  bookingController.updateBookingStatus
);
router.put("/:id/complete", protect, admin, bookingController.completeBooking);

module.exports = router;
