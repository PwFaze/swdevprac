const express = require("express");
const Rating = require("../models/Rating");
const Room = require("../models/Room");

exports.getRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find();
    res.status(200).json(ratings);
  } catch (error) {
    next(error);
  }
};
exports.getRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res
        .status(404)
        .json({ success: false, error: "Rating not found" });
    }
    res.status(200).json(rating);
  } catch (error) {
    next(error);
  }
};

exports.createRating = async (req, res, next) => {
  try {
    const rating = await Rating.create(req.body);
    const room = await Room.findById(req.body.room);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    room.averageRating =
      (room.averageRating * room.averageRatingCount + req.body.rating) /
      (room.averageRatingCount + 1);
    room.averageRatingCount += 1;
    await room.save();
    res.status(201).json({ success: true, data: rating });
  } catch (error) {
    next(error);
  }
};

exports.updateRating = async (req, res, next) => {
  try {
    const rating = await Rating.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    await updateRoomRating(rating.room);
    if (!rating) {
      return res
        .status(404)
        .json({ success: false, error: "Rating not found" });
    }

    res.status(200).json(rating);
  } catch (error) {
    next(error);
  }
};
exports.deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);
    console.log(rating);
    await updateRoomRating(rating.room);

    if (!rating) {
      return res
        .status(404)
        .json({ success: false, error: "Rating not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

const updateRoomRating = async (roomId) => {
  const ratings = await Rating.find({ room: roomId });

  const averageRatingCount = ratings.length;
  const averageRating =
    averageRatingCount > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / averageRatingCount
      : 0;

  await Room.findByIdAndUpdate(roomId, {
    averageRating,
    averageRatingCount,
  });
};
