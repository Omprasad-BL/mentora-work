const Student = require('../models/student.model');
const Booking = require('../models/booking.model');

/**
 * POST /students — Parent only
 */
const createStudent = async (req, res, next) => {
  try {
    const { name, age } = req.body;
    const student = await Student.create({ name, age, parentId: req.user._id });
    res.status(201).json({ student });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /students — Parent only, returns their own students with bookings
 */
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ parentId: req.user._id }).lean();

    // Attach bookings per student
    const studentIds = students.map((s) => s._id);
    const bookings = await Booking.find({ studentId: { $in: studentIds } })
      .populate('lessonId', 'title _id')
      .lean();

    const bookingMap = {};
    bookings.forEach((b) => {
      const sid = b.studentId.toString();
      if (!bookingMap[sid]) bookingMap[sid] = [];
      bookingMap[sid].push({ lessonId: b.lessonId._id, lessonTitle: b.lessonId.title, bookingId: b._id });
    });

    const result = students.map((s) => ({
      ...s,
      bookings: bookingMap[s._id.toString()] || [],
    }));

    res.json({ students: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { createStudent, getStudents };
