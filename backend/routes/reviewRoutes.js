// reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/rooms", reviewController.getRooms); // Must come before /:id
router.get("/myreviews", reviewController.getMyReviews); // Must come before /:id
router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);

// Routes for creating, updating, and deleting reviews
router.post("/", reviewController.createReview);
router.put("/:id", protect, admin, reviewController.updateReview);
router.delete("/:id", protect, admin, reviewController.deleteReview);

module.exports = router;
