const mongoose = require("mongoose");

const validateReservationDate = (value) => {
  return value >= Date.now();
};

const ReservationSchema = new mongoose.Schema(
  {
    reservationDate: {
      type: Date,
      required: true,
      validate: [
        validateReservationDate,
        "Reservation date must be in the future",
      ],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

module.exports = mongoose.model("Reservation", ReservationSchema);
