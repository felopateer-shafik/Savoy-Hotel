const db = require("../models");
const Contact = db.contact;

// @desc    Create new contact message
// @route   POST /api/contacts
// @access  Public
exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, subject and message" });
    }

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent. We will get back to you soon!",
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
exports.getContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get contact message by ID
// @route   GET /api/contacts/:id
// @access  Private/Admin
exports.getContactMessageById = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update contact message status
// @route   PUT /api/contacts/:id
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Please provide a status" });
    }

    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    contact.status = status;

    const updatedContact = await contact.save();

    res.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact message status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
exports.deleteContactMessage = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    await contact.destroy();

    res.json({ message: "Contact message removed" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ message: "Server error" });
  }
};
