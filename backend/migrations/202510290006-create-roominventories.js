"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roominventories", {
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
      totalRooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      availableRooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint("roominventories", {
      fields: ["roomType"],
      type: "unique",
      name: "unique_roominventory_roomType",
    });
  },

  async down(queryInterface) {
    await queryInterface
      .removeConstraint("roominventories", "unique_roominventory_roomType")
      .catch(() => {});
    await queryInterface.dropTable("roominventories");
  },
};
