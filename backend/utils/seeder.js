// backend/utils/seeder.js
const dotenv = require("dotenv");
const db = require("../models");
const bcrypt = require("bcryptjs");

// Load env vars
dotenv.config();

// Sample room data
const rooms = [
  {
    name: "Deluxe Room",
    description:
      "Our Deluxe rooms offer a perfect blend of comfort and elegance. Each room features a king-sized bed, a spacious work area, and a marble bathroom with a rain shower.",
    price: 150.0,
    mainImage: "/assets/images/deluxe-room-main.jpg",
    images: JSON.stringify([
      "/assets/images/deluxe-room-1.jpg",
      "/assets/images/deluxe-room-2.jpg",
      "/assets/images/deluxe-room-3.jpg",
    ]),
    type: "deluxe",
    adultCapacity: 2,
    childrenCapacity: 1,
    features: JSON.stringify([
      "Free WiFi",
      "Air conditioning",
      "Flat-screen TV",
      "Mini-bar",
      "Coffee machine",
      "Safe",
      "Room service",
    ]),
    size: 35,
    beds: "1 King Bed",
    availability: true,
  },
  {
    name: "Family Suite",
    description:
      "Perfect for families, our spacious Family Suites offer comfortable accommodations with separate living and sleeping areas, providing privacy and convenience for the whole family.",
    price: 280.0,
    mainImage: "/assets/images/family-suite-main.jpg",
    images: JSON.stringify([
      "/assets/images/family-suite-1.jpg",
      "/assets/images/family-suite-2.jpg",
      "/assets/images/family-suite-3.jpg",
    ]),
    type: "family",
    adultCapacity: 4,
    childrenCapacity: 2,
    features: JSON.stringify([
      "Free WiFi",
      "Air conditioning",
      "Two flat-screen TVs",
      "Mini-bar",
      "Coffee machine",
      "Safe",
      "Room service",
      "Separate living area",
      "Dining table",
    ]),
    size: 65,
    beds: "1 King Bed and 2 Twin Beds",
    availability: true,
  },
  {
    name: "Presidential Suite",
    description:
      "Experience luxury at its finest in our Presidential Suite. This spacious suite offers panoramic views of the city, a private terrace, and exclusive amenities to ensure a memorable stay.",
    price: 550.0,
    mainImage: "/assets/images/presidential-suite-main.jpg",
    images: JSON.stringify([
      "/assets/images/presidential-suite-1.jpg",
      "/assets/images/presidential-suite-2.jpg",
      "/assets/images/presidential-suite-3.jpg",
    ]),
    type: "presidential",
    adultCapacity: 2,
    childrenCapacity: 2,
    features: JSON.stringify([
      "Free WiFi",
      "Air conditioning",
      "Multiple flat-screen TVs",
      "Fully stocked bar",
      "Espresso machine",
      "Safe",
      "24/7 butler service",
      "Private dining room",
      "Jacuzzi",
      "Private terrace",
      "Executive work area",
    ]),
    size: 120,
    beds: "1 Super King Bed",
    availability: true,
  },
  {
    name: "Honeymoon Suite",
    description:
      "Celebrate your love in our romantic Honeymoon Suite. Featuring a luxurious king-sized bed, a private balcony with stunning views, and a couples spa bath, this suite is designed for romance.",
    price: 320.0,
    mainImage: "/assets/images/honeymoon-suite-main.jpg",
    images: JSON.stringify([
      "/assets/images/honeymoon-suite-1.jpg",
      "/assets/images/honeymoon-suite-2.jpg",
      "/assets/images/honeymoon-suite-3.jpg",
    ]),
    type: "honeymoon",
    adultCapacity: 2,
    childrenCapacity: 0,
    features: JSON.stringify([
      "Free WiFi",
      "Air conditioning",
      "Flat-screen TV",
      "Champagne bar",
      "Coffee machine",
      "Safe",
      "Room service",
      "Couples spa bath",
      "Private balcony",
      "Romantic lighting",
    ]),
    size: 50,
    beds: "1 Luxury King Bed",
    availability: true,
  },
  {
    name: "Panoramic View Room",
    description:
      "Wake up to breathtaking views in our Panoramic View Rooms. These well-appointed rooms feature floor-to-ceiling windows showcasing the stunning city skyline.",
    price: 200.0,
    mainImage: "/assets/images/panoramic-room-main.jpg",
    images: JSON.stringify([
      "/assets/images/panoramic-room-1.jpg",
      "/assets/images/panoramic-room-2.jpg",
      "/assets/images/panoramic-room-3.jpg",
    ]),
    type: "panoramic",
    adultCapacity: 2,
    childrenCapacity: 1,
    features: JSON.stringify([
      "Free WiFi",
      "Air conditioning",
      "Flat-screen TV",
      "Mini-bar",
      "Coffee machine",
      "Safe",
      "Room service",
      "Floor-to-ceiling windows",
      "Lounge chair",
    ]),
    size: 40,
    beds: "1 Queen Bed",
    availability: true,
  },
  {
    name: "Exclusive Suite",
    description:
      "Our Exclusive Suites offer a sophisticated retreat with a separate living area, a spacious bedroom, and a luxurious bathroom featuring a freestanding tub and a walk-in shower.",
    price: 380.0,
    mainImage: "/assets/images/exclusive-suite-main.jpg",
    images: JSON.stringify([
      "/assets/images/exclusive-suite-1.jpg",
      "/assets/images/exclusive-suite-2.jpg",
      "/assets/images/exclusive-suite-3.jpg",
    ]),
    type: "exclusive",
    adultCapacity: 2,
    childrenCapacity: 2,
    features: JSON.stringify([
      "Free WiFi",
      "Air conditioning",
      "Multiple flat-screen TVs",
      "Mini-bar",
      "Coffee machine",
      "Safe",
      "Room service",
      "Separate living area",
      "Freestanding tub",
      "Walk-in shower",
      "Executive desk",
    ]),
    size: 75,
    beds: "1 King Bed",
    availability: true,
  },
];

// Room inventory data
const roomInventoryData = [
  { roomType: "deluxe", totalRooms: 10, availableRooms: 10 },
  { roomType: "family", totalRooms: 8, availableRooms: 8 },
  { roomType: "presidential", totalRooms: 2, availableRooms: 2 },
  { roomType: "honeymoon", totalRooms: 5, availableRooms: 5 },
  { roomType: "panoramic", totalRooms: 12, availableRooms: 12 },
  { roomType: "exclusive", totalRooms: 6, availableRooms: 6 },
];

// Function to reset auto-increment sequences
const resetAutoIncrement = async () => {
  try {
    const dialect = db.sequelize.getDialect();

    if (dialect === "mysql") {
      await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      await db.sequelize.query("TRUNCATE TABLE rooms");
      await db.sequelize.query("TRUNCATE TABLE users");
      await db.sequelize.query("TRUNCATE TABLE reviews");
      await db.sequelize.query("TRUNCATE TABLE bookings");
      await db.sequelize.query("TRUNCATE TABLE contacts");
      await db.sequelize.query("TRUNCATE TABLE roominventories");
      await db.sequelize.query("TRUNCATE TABLE roomavailabilities");
      await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    } else if (dialect === "postgres") {
      await db.sequelize.query("TRUNCATE TABLE rooms RESTART IDENTITY CASCADE");
      await db.sequelize.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
      await db.sequelize.query(
        "TRUNCATE TABLE reviews RESTART IDENTITY CASCADE"
      );
      await db.sequelize.query(
        "TRUNCATE TABLE bookings RESTART IDENTITY CASCADE"
      );
      await db.sequelize.query(
        "TRUNCATE TABLE contacts RESTART IDENTITY CASCADE"
      );
      await db.sequelize.query(
        "TRUNCATE TABLE roominventories RESTART IDENTITY CASCADE"
      );
      await db.sequelize.query(
        "TRUNCATE TABLE roomavailabilities RESTART IDENTITY CASCADE"
      );
    } else if (dialect === "sqlite") {
      await db.sequelize.query("DELETE FROM rooms");
      await db.sequelize.query("DELETE FROM users");
      await db.sequelize.query("DELETE FROM reviews");
      await db.sequelize.query("DELETE FROM bookings");
      await db.sequelize.query("DELETE FROM contacts");
      await db.sequelize.query("DELETE FROM roominventories");
      await db.sequelize.query("DELETE FROM roomavailabilities");
      await db.sequelize.query(
        'DELETE FROM sqlite_sequence WHERE name IN ("rooms", "users", "reviews", "bookings", "contacts", "roominventories", "roomavailabilities")'
      );
    }

    console.log("✔️ Auto-increment sequences reset");
  } catch (error) {
    console.log("⚠️ Could not reset auto-increment sequences:", error.message);
  }
};

// Function to generate room availability for the next 365 days
const generateRoomAvailability = async () => {
  try {
    const today = new Date();
    const roomAvailabilityData = [];

    // Generate availability for next 365 days
    for (let i = 0; i < 365; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format

      // Create availability record for each room type
      roomInventoryData.forEach((inventory) => {
        roomAvailabilityData.push({
          roomType: inventory.roomType,
          date: dateString,
          bookedRooms: 0,
          availableRooms: inventory.totalRooms,
        });
      });
    }

    // Bulk insert room availability data
    await db.roomavailability.bulkCreate(roomAvailabilityData);
    console.log("✔️ Room availability data generated for 365 days");
  } catch (error) {
    console.error("❌ Error generating room availability:", error.message);
  }
};

// Import data into DB
const importData = async () => {
  try {
    console.log("🔄 Starting data import...");

    // 1) Reset auto-increment and clear data properly
    await resetAutoIncrement();
    console.log("✔️ Data cleaned and sequences reset");

    // 2) Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    await db.user.create({
      name: "Admin User",
      email: "admin@savoyhotel.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("✔️ Admin user created");

    // 3) Bulk insert rooms
    await db.room.bulkCreate(rooms);
    console.log("✔️ Rooms imported successfully");

    // 4) Bulk insert room inventory
    await db.roominventory.bulkCreate(roomInventoryData);
    console.log("✔️ Room inventory imported successfully");

    // 5) Generate room availability data
    await generateRoomAvailability();

    console.log("🎉 All data imported successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    console.log("🔄 Starting data deletion...");

    // Use the reset function which properly handles truncation
    await resetAutoIncrement();

    console.log("✔️ Data destroyed successfully");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run import or delete
if (require.main === module) {
  if (process.argv[2] === "-i") {
    importData();
  } else if (process.argv[2] === "-d") {
    deleteData();
  } else {
    console.log(
      "ℹ️ Use `node utils/seeder.js -i` to import data or `-d` to delete data"
    );
    process.exit(0);
  }
}

module.exports = { rooms, roomInventoryData, importData, deleteData };
