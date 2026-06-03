// reviewController.js
const db = require("../models");
const Review = db.review;
const Room = db.room;
const User = db.user;

// @desc    Create new review
// @route   POST /api/reviews
// @access  Public
exports.createReview = async (req, res) => {
  try {
    const { roomId, rating, comment, name, email } = req.body;

    // Validate required fields
    if (!roomId || !rating || !comment || !name || !email) {
      return res.status(400).json({
        message: "Please provide roomId, rating, comment, name, and email",
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Create the review
    const review = await Review.create({
      rating: parseInt(rating),
      comment: comment.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      userId: null, // For guest reviews
      roomId: parseInt(roomId),
    });

    // Fetch the created review with room information
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "name"],
        },
      ],
    });

    // Re-fetch room to get updated rating & count
    await room.reload();

    // Format the response to match frontend expectations
    const formattedReview = {
      id: createdReview.id,
      name: createdReview.name,
      email: createdReview.email,
      rating: createdReview.rating,
      comment: createdReview.comment,
      date: createdReview.createdAt.toISOString().split("T")[0],
      image: "/assets/images/person-default.jpg",
      roomId: createdReview.roomId,
      roomName: createdReview.room ? createdReview.room.name : "",
    };

    res.status(201).json({
      ...formattedReview,
      roomRating: room.rating,
      numReviews: room.numReviews,
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all reviews (optionally filter by roomId)
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { roomId } = req.query;
    const where = {};
    if (roomId) where.roomId = roomId;

    const reviews = await Review.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Room,
          as: "room",
          attributes: ["id", "name"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format reviews to match frontend expectations
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      name: review.name || (review.user ? review.user.name : "Anonymous"),
      email: review.email || "",
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split("T")[0],
      image: "/assets/images/person-default.jpg",
      roomId: review.roomId,
      roomName: review.room ? review.room.name : "",
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all rooms for dropdown
// @route   GET /api/reviews/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      attributes: ["id", "name", "description"],
      order: [["name", "ASC"]],
    });

    // Format rooms to match frontend expectations
    const formattedRooms = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      type: room.name.includes("Suite")
        ? "Suite"
        : room.name.includes("Family")
        ? "Family"
        : room.name.includes("Deluxe")
        ? "Deluxe"
        : room.name.includes("Presidential")
        ? "Presidential"
        : "Standard",
    }));

    res.json(formattedRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reviews by "current user" (public—returns those with null userId)
// @route   GET /api/reviews/myreviews
// @access  Public
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: null },
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format reviews to match frontend expectations
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      name: review.name || "Anonymous",
      email: review.email || "",
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split("T")[0],
      image: "/assets/images/person-default.jpg",
      roomId: review.roomId,
      roomName: review.room ? review.room.name : "",
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: Room,
          as: "room",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Format review to match frontend expectations
    const formattedReview = {
      id: review.id,
      name: review.name || (review.user ? review.user.name : "Anonymous"),
      email: review.email || "",
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split("T")[0],
      image: "/assets/images/person-default.jpg",
      roomId: review.roomId,
      roomName: review.room ? review.room.name : "",
    };

    res.json(formattedReview);
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Public
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, name, email } = req.body;
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Update fields if provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = parseInt(rating);
    }
    if (comment !== undefined) review.comment = comment.trim();
    if (name !== undefined) review.name = name.trim();
    if (email !== undefined) review.email = email.trim().toLowerCase();

    await review.save();

    // Re-fetch room to get updated rating
    const updatedRoom = await Room.findByPk(review.roomId);

    // Format the response to match frontend expectations
    const formattedReview = {
      id: review.id,
      name: review.name,
      email: review.email,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split("T")[0],
      image: "/assets/images/person-default.jpg",
      roomId: review.roomId,
    };

    res.json({
      ...formattedReview,
      roomRating: updatedRoom.rating,
      numReviews: updatedRoom.numReviews,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Public
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const roomId = review.roomId;
    await review.destroy();

    // Re-fetch room to get updated rating
    const updatedRoom = await Room.findByPk(roomId);

    res.json({
      message: "Review removed",
      roomRating: updatedRoom ? updatedRoom.rating : 0,
      numReviews: updatedRoom ? updatedRoom.numReviews : 0,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
};
