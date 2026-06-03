"use strict";

const bcrypt = require("bcryptjs");

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
  },
];

const roomInventoryData = [
  { roomType: "deluxe", totalRooms: 10, availableRooms: 10 },
  { roomType: "family", totalRooms: 8, availableRooms: 8 },
  { roomType: "presidential", totalRooms: 2, availableRooms: 2 },
  { roomType: "honeymoon", totalRooms: 5, availableRooms: 5 },
  { roomType: "panoramic", totalRooms: 12, availableRooms: 12 },
  { roomType: "exclusive", totalRooms: 6, availableRooms: 6 },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const adminPassword = await bcrypt.hash("admin123", 10);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Admin User",
          email: "admin@savoyhotel.com",
          password: adminPassword,
          role: "admin",
          phone: null,
          address: null,
          city: null,
          country: null,
          zipCode: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      { ignoreDuplicates: true }
    );

    await queryInterface.bulkInsert(
      "rooms",
      rooms.map((room) => ({
        ...room,
        rating: 0,
        numReviews: 0,
        availability: true,
        createdAt: now,
        updatedAt: now,
      })),
      { ignoreDuplicates: true }
    );

    await queryInterface.bulkInsert(
      "roominventories",
      roomInventoryData.map((inventory) => ({
        ...inventory,
        createdAt: now,
        updatedAt: now,
      })),
      { ignoreDuplicates: true }
    );

    const roomAvailabilityRows = [];
    const today = new Date();

    for (let i = 0; i < 365; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      roomInventoryData.forEach((inventory) => {
        roomAvailabilityRows.push({
          roomType: inventory.roomType,
          date: dateString,
          bookedRooms: 0,
          availableRooms: inventory.totalRooms,
          createdAt: now,
          updatedAt: now,
        });
      });
    }

    if (roomAvailabilityRows.length > 0) {
      await queryInterface.bulkInsert(
        "roomavailabilities",
        roomAvailabilityRows,
        { ignoreDuplicates: true }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roomavailabilities", null, {});
    await queryInterface.bulkDelete("roominventories", null, {});
    await queryInterface.bulkDelete("rooms", null, {});
    await queryInterface.bulkDelete(
      "users",
      { email: "admin@savoyhotel.com" },
      {}
    );
  },
};
