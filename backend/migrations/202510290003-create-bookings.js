"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      checkInDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      checkOutDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      numberOfAdults: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      numberOfChildren: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      numberOfRooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      specialRequests: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "confirmed", "cancelled", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      paymentStatus: {
        type: Sequelize.ENUM("pending", "paid", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      paymentMethod: {
        type: Sequelize.ENUM("credit", "payAtHotel"),
        allowNull: false,
        defaultValue: "credit",
      },
      guestName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guestEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guestPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guestAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guestCity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guestCountry: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guestZipCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pricePerNight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      numberOfNights: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "rooms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("bookings", ["checkInDate"]);
    await queryInterface.addIndex("bookings", ["checkOutDate"]);
    await queryInterface.addIndex("bookings", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("bookings", ["status"]).catch(() => {});
    await queryInterface
      .removeIndex("bookings", ["checkOutDate"])
      .catch(() => {});
    await queryInterface
      .removeIndex("bookings", ["checkInDate"])
      .catch(() => {});
    await queryInterface.dropTable("bookings");
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_bookings_status";'
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_bookings_paymentStatus";'
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_bookings_paymentMethod";'
      );
    }
  },
};
