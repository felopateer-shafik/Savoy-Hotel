"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface
      .describeTable("roomavailabilities")
      .then(() => true)
      .catch(() => false);

    if (!tableExists) {
      await queryInterface.createTable("roomavailabilities", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        roomType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        bookedRooms: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        availableRooms: {
          type: Sequelize.INTEGER,
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
    }

    try {
      await queryInterface.addConstraint("roomavailabilities", {
        fields: ["roomType", "date"],
        type: "unique",
        name: "unique_room_date",
      });
    } catch (error) {
      if (error.original?.code !== "ER_DUP_KEYNAME") {
        throw error;
      }
    }
  },

  async down(queryInterface) {
    await queryInterface
      .removeConstraint("roomavailabilities", "unique_room_date")
      .catch(() => {});
    await queryInterface.dropTable("roomavailabilities").catch(() => {});
  },
};
