const Reservation = require("../models/Reservation");
const Room = require("../models/Room");

//@desc Get all reservations
//@route GET /api/v1/reservations
//@access Public
exports.getReservations = async (req, res, next) => {
  let query;

  if (req.query.user !== "admin") {
    query = Reservation.find({ user: req.query.user }).populate({
      path: "room",
      select: "name province tel",
    });
  } else {
    if (req.params.roomId) {
      query = Reservation.find({ room: req.params.roomId }).populate({
        path: "room",
        select: "name province tel",
      });
    }
    query = Reservation.find().populate({
      path: "room",
      select: "name province tel",
    });
  }

  try {
    const reservations = await query;

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot find Reservations" });
  }
};

//@desc Get single reservation
//@route GET /api/v1/reservations/:id
//@access Public
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "room",
      select: "name province tel",
    });

    if (!reservation) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc Add reservation
// @route POST /api/v1/rooms/:roomId/reservations
// @access Private
exports.addReservation = async (req, res, next) => {
  try {
    req.body.room = req.params.roomId;

    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false });
    }

    req.body.user = req.user.id;
    const existingReservation = await Reservation.find({
      user: req.user.id,
    });

    if (existingReservation.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You can only book 3 reservations",
      });
    }

    const reservation = await Reservation.create(req.body);

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc Update reservation
// @route PUT /api/v1/reservations/:id
// @access Private
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false });
    }

    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to update this reservation",
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc Delete reservation
// @route DELETE /api/v1/reservations/:id
// @access Private
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false });
    }

    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this reservation",
      });
    }

    await reservation.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
