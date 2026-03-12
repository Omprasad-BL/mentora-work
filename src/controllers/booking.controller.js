const Booking = require('../models/booking.model');
const Student = require('../models/student.model');
const Lesson = require('../models/lesson.model');

/**
 * POST /bookings — Parent only
 */
const createBooking = async (req, res, next) => {
  try {
    const { studentId, lessonId } = req.body;

    // Verify student belongs to this parent
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only book lessons for your own students' });
    }

    // Verify lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const booking = await Booking.create({ studentId, lessonId });
    await booking.populate([
      { path: 'studentId', select: 'name' },
      { path: 'lessonId', select: 'title' },
    ]);

    res.status(201).json({ booking });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Student is already booked for this lesson' });
    }
    next(err);
  }
};

/**
 * GET /bookings — Parent only
 */
const getBookings = async (req, res, next) => {
  try {
    // Find all students belonging to the parent
    const students = await Student.find({ parentId: req.user._id }).select('_id').lean();
    const studentIds = students.map((s) => s._id);

    const bookings = await Booking.find({ studentId: { $in: studentIds } })
      .populate('studentId', 'name')
      .populate('lessonId', 'title description')
      .lean();

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookings };
