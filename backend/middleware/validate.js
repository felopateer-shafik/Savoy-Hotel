// middleware/validate.js
const { body, param, query, validationResult } = require("express-validator");

/**
 * Middleware to check validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Booking validation rules
 */
const bookingValidation = [
  body("roomId").isInt({ min: 1 }).withMessage("Valid room ID is required"),
  body("roomType").notEmpty().trim().withMessage("Room type is required"),
  body("checkInDate")
    .isISO8601()
    .withMessage("Valid check-in date is required")
    .custom((value) => {
      if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
        throw new Error("Check-in date cannot be in the past");
      }
      return true;
    }),
  body("checkOutDate")
    .isISO8601()
    .withMessage("Valid check-out date is required")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error("Check-out must be after check-in");
      }
      return true;
    }),
  body("numberOfRooms")
    .isInt({ min: 1, max: 10 })
    .withMessage("Number of rooms must be 1-10"),
  body("guestName")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Guest name is required"),
  body("guestEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("guestPhone").optional().trim().escape(),
  handleValidationErrors,
];

/**
 * Review validation rules
 */
const reviewValidation = [
  body("name").notEmpty().trim().escape().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
  body("comment")
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be 10-1000 characters"),
  body("roomId").isInt({ min: 1 }).withMessage("Valid room ID is required"),
  handleValidationErrors,
];

/**
 * Contact validation rules
 */
const contactValidation = [
  body("name").notEmpty().trim().escape().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("subject").notEmpty().trim().escape().withMessage("Subject is required"),
  body("message")
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be 10-2000 characters"),
  handleValidationErrors,
];

/**
 * User registration validation rules
 */
const registerValidation = [
  body("name")
    .notEmpty()
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
  body("phone").optional().trim().escape(),
  handleValidationErrors,
];

/**
 * User login validation rules
 */
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

/**
 * Room validation rules
 */
const roomValidation = [
  body("name").notEmpty().trim().escape().withMessage("Room name is required"),
  body("type").notEmpty().trim().withMessage("Room type is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("description").optional().trim(),
  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),
  handleValidationErrors,
];

/**
 * ID parameter validation
 */
const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid ID is required"),
  handleValidationErrors,
];

/**
 * Date range query validation
 */
const dateRangeValidation = [
  query("checkIn").isISO8601().withMessage("Valid check-in date is required"),
  query("checkOut").isISO8601().withMessage("Valid check-out date is required"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  bookingValidation,
  reviewValidation,
  contactValidation,
  registerValidation,
  loginValidation,
  roomValidation,
  idParamValidation,
  dateRangeValidation,
};
