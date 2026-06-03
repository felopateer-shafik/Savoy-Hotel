// backend/utils/databaseInit.js
const db = require("../models");
const bcrypt = require("bcryptjs");

const roomInventoryData = [
  { roomType: "deluxe", totalRooms: 10, availableRooms: 10 },
  { roomType: "family", totalRooms: 8, availableRooms: 8 },
  { roomType: "presidential", totalRooms: 2, availableRooms: 2 },
  { roomType: "honeymoon", totalRooms: 5, availableRooms: 5 },
  { roomType: "panoramic", totalRooms: 12, availableRooms: 12 },
  { roomType: "exclusive", totalRooms: 6, availableRooms: 6 },
];

const rooms = [
  {
    name: "Deluxe Room",
    description:
      "Our Deluxe rooms offer a perfect blend of comfort and elegance. Each room features a king-sized bed, a spacious work area, and a marble bathroom with a rain shower.",
    price: 150,
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
    price: 280,
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
    price: 550,
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
    price: 320,
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
    price: 200,
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
    price: 380,
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

const initState = {
  started: false,
  ready: false,
  error: null,
  lastRunAt: null,
  promise: null,
};

const seedOnStart =
  String(
    process.env.SEED_ON_START || process.env.NODE_ENV !== "production"
  ).toLowerCase() === "true";

const syncOnStart =
  String(process.env.DB_SYNC_ON_START || "false").toLowerCase() === "true";

const buildStatus = () => ({
  started: initState.started,
  ready: initState.ready,
  error: initState.error ? initState.error.message : null,
  lastRunAt: initState.lastRunAt,
  seedOnStart,
  syncOnStart,
});

async function generateRoomAvailabilityRange(startDate, days, options = {}) {
  const entries = [];
  for (let i = 0; i < days; i += 1) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split("T")[0];

    for (const inventory of roomInventoryData) {
      const existingRecord = await db.roomavailability.findOne({
        where: { date: dateString, roomType: inventory.roomType },
        ...options,
      });

      if (!existingRecord) {
        entries.push({
          roomType: inventory.roomType,
          date: dateString,
          bookedRooms: 0,
          availableRooms: inventory.totalRooms,
        });
      }
    }
  }

  if (entries.length > 0) {
    await db.roomavailability.bulkCreate(entries, {
      ...options,
      ignoreDuplicates: true,
    });
  }
}

async function ensureAdminUser(options = {}) {
  const adminEmail = "admin@savoyhotel.com";
  const existingAdmin = await db.user.findOne({
    where: { email: adminEmail },
    ...options,
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.user.create(
      {
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
      options
    );
  }
}

async function ensureRooms(options = {}) {
  const roomCount = await db.room.count(options);
  if (roomCount === 0) {
    await db.room.bulkCreate(rooms, options);
  }
}

async function ensureInventory(options = {}) {
  const inventoryCount = await db.roominventory.count(options);
  if (inventoryCount === 0) {
    await db.roominventory.bulkCreate(roomInventoryData, options);
  }
}

async function ensureAvailability(options = {}) {
  const availabilityCount = await db.roomavailability.count(options);
  const today = new Date();

  if (availabilityCount === 0) {
    await generateRoomAvailabilityRange(today, 365, options);
    return;
  }

  const maxDate = await db.roomavailability.max("date", options);
  if (!maxDate) {
    await generateRoomAvailabilityRange(today, 365, options);
    return;
  }

  const maxDateObj = new Date(maxDate);
  const daysAhead = Math.ceil((maxDateObj - today) / (1000 * 60 * 60 * 24));
  if (daysAhead < 30) {
    await generateRoomAvailabilityRange(today, 365, options);
  }
}

async function seedEssentialData(transactionOptions = {}) {
  await ensureAdminUser(transactionOptions);
  await ensureRooms(transactionOptions);
  await ensureInventory(transactionOptions);
  await ensureAvailability(transactionOptions);
}

async function initializeDatabase() {
  if (initState.promise) {
    return initState.promise;
  }

  initState.started = true;
  initState.ready = false;
  initState.error = null;

  initState.promise = (async () => {
    try {
      await db.sequelize.authenticate();

      if (syncOnStart) {
        await db.sequelize.sync({ alter: false });
      }

      if (seedOnStart) {
        const transaction = await db.sequelize.transaction();
        try {
          await seedEssentialData({ transaction });
          await transaction.commit();
        } catch (seedError) {
          await transaction.rollback();
          throw seedError;
        }
      } else {
        console.log("Startup seeding skipped (SEED_ON_START=false)");
      }

      initState.ready = true;
      initState.lastRunAt = new Date().toISOString();
    } catch (error) {
      initState.error = error;
      throw error;
    } finally {
      initState.promise = null;
    }
  })();

  return initState.promise;
}

function isDatabaseReady() {
  return initState.ready;
}

function getInitStatus() {
  return buildStatus();
}

async function waitForReadiness() {
  if (initState.ready) {
    return;
  }
  if (initState.promise) {
    await initState.promise;
  }
}

module.exports = {
  initializeDatabase,
  isDatabaseReady,
  getInitStatus,
  waitForReadiness,
};
