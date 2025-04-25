const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
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
    reservation: {
      type: mongoose.Schema.ObjectId,
      ref: "Reservation",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
RatingSchema.index({ reservation: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Rating", RatingSchema);
