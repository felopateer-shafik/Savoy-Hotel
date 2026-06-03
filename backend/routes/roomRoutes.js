// roomRoutes.js
const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", roomController.getRooms);
router.post("/check-availability", roomController.checkRoomAvailability);
router.get("/with-availability", roomController.getRoomsWithAvailability);
router.get("/availability", roomController.getRoomAvailability);
router.get("/:id", roomController.getRoomById);

router.post("/", protect, admin, roomController.createRoom);
router.put("/:id", protect, admin, roomController.updateRoom);
router.delete("/:id", protect, admin, roomController.deleteRoom);

module.exports = router;
