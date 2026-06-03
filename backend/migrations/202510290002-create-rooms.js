"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rooms", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      mainImage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      images: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM(
          "exclusive",
          "family",
          "deluxe",
          "panoramic",
          "presidential",
          "honeymoon"
        ),
        allowNull: false,
      },
      adultCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      childrenCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      features: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      numReviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      availability: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      beds: {
        type: Sequelize.STRING,
        allowNull: false,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("rooms");
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_rooms_type";'
      );
    }
  },
};
