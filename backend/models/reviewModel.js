// reviewModel.js
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "review",
    {
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "rooms",
          key: "id",
        },
      },
    },
    {
      freezeTableName: true,
      tableName: "reviews",
      timestamps: true,
    }
  );

  // Define associations
  Review.associate = function (models) {
    Review.belongsTo(models.room, {
      foreignKey: "roomId",
      as: "room",
    });
    Review.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
    });
  };

  // Update room rating after review is created
  Review.afterCreate(async (review) => {
    try {
      const db = require("./index");
      const roomId = review.roomId;

      const avgRating = await db.review.findOne({
        where: { roomId: roomId },
        attributes: [
          [db.sequelize.fn("AVG", db.sequelize.col("rating")), "avgRating"],
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "numReviews"],
        ],
        raw: true,
      });

      await db.room.update(
        {
          rating: parseFloat(avgRating.avgRating).toFixed(1),
          numReviews: parseInt(avgRating.numReviews),
        },
        { where: { id: roomId } }
      );
    } catch (error) {
      console.error("Error updating room rating after create:", error);
    }
  });

  // Update room rating after review is updated
  Review.afterUpdate(async (review) => {
    try {
      const db = require("./index");
      const roomId = review.roomId;

      const avgRating = await db.review.findOne({
        where: { roomId: roomId },
        attributes: [
          [db.sequelize.fn("AVG", db.sequelize.col("rating")), "avgRating"],
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "numReviews"],
        ],
        raw: true,
      });

      await db.room.update(
        {
          rating: parseFloat(avgRating.avgRating).toFixed(1),
          numReviews: parseInt(avgRating.numReviews),
        },
        { where: { id: roomId } }
      );
    } catch (error) {
      console.error("Error updating room rating after update:", error);
    }
  });

  // Update room rating after review is deleted
  Review.afterDestroy(async (review) => {
    try {
      const db = require("./index");
      const roomId = review.roomId;

      const avgRating = await db.review.findOne({
        where: { roomId: roomId },
        attributes: [
          [db.sequelize.fn("AVG", db.sequelize.col("rating")), "avgRating"],
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "numReviews"],
        ],
        raw: true,
      });

      await db.room.update(
        {
          rating: avgRating.avgRating
            ? parseFloat(avgRating.avgRating).toFixed(1)
            : 0,
          numReviews: avgRating.numReviews ? parseInt(avgRating.numReviews) : 0,
        },
        { where: { id: roomId } }
      );
    } catch (error) {
      console.error("Error updating room rating after destroy:", error);
    }
  });

  return Review;
};
