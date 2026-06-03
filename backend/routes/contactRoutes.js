const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/", contactController.createContactMessage);

// Protected routes (admin only)
router.get("/", protect, admin, contactController.getContactMessages);
router.get("/:id", protect, admin, contactController.getContactMessageById);
router.put("/:id", protect, admin, contactController.updateContactStatus);
router.delete("/:id", protect, admin, contactController.deleteContactMessage);

module.exports = router;
