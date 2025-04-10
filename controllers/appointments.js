const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");

//@desc Get all appointments
//@route GET /api/v1/appointments
//@access Public
exports.getAppointments = async (req, res, next) => {
  let query;

  if (req.query.user !== "admin") {
    query = Appointment.find({ user: req.query.user }).populate({
      path: "hospital",
      select: "name province tel",
    });
  } else {
    if (req.params.hospitalId) {
      query = Appointment.find({ hospital: req.params.hospitalId }).populate({
        path: "hospital",
        select: "name province tel",
      });
    }
    query = Appointment.find().populate({
      path: "hospital",
      select: "name province tel",
    });
  }

  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot find Appointments" });
  }
};

//@desc Get single appointment
//@route GET /api/v1/appointments/:id
//@access Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "hospital",
      select: "name province tel",
    });

    if (!appointment) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc Add appointment
// @route POST /api/v1/hospitals/:hospitalId/appointments
// @access Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId;

    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital) {
      return res.status(404).json({ success: false });
    }

    req.body.user = req.user.id;
    const existingAppointment = await Appointment.find({
      user: req.user.id,
    });

    if (existingAppointment.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You can only book 3 appointments",
      });
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc Update appointment
// @route PUT /api/v1/appointments/:id
// @access Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to update this appointment",
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc Delete appointment
// @route DELETE /api/v1/appointments/:id
// @access Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this appointment",
      });
    }

    await appointment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
