// bookingModel.js

module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "booking",
    {
      checkInDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      checkOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      numberOfAdults: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      numberOfChildren: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      numberOfRooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      specialRequests: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
        defaultValue: "pending",
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "refunded"),
        defaultValue: "pending",
      },
      paymentMethod: {
        type: DataTypes.ENUM("credit", "payAtHotel"),
        defaultValue: "credit",
      },
      guestName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guestEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guestPhone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guestAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guestCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guestCountry: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guestZipCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pricePerNight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      numberOfNights: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    { freezeTableName: true, tableName: "bookings", timestamps: true }
  );

  Booking.associate = (models) => {
    Booking.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
    });
    Booking.belongsTo(models.room, {
      foreignKey: "roomId",
      as: "room",
    });
  };

  return Booking;
};
