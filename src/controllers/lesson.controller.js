const Lesson = require('../models/lesson.model');
const Session = require('../models/session.model');
const Booking = require('../models/booking.model');

/**
 * POST /lessons — Mentor only
 */
const createLesson = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const lesson = await Lesson.create({ title, description, mentorId: req.user._id });
    await lesson.populate('mentorId', 'name email');
    res.status(201).json({ lesson });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /lessons — Any authenticated user
 */
const getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find()
      .populate('mentorId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Attach counts
    const lessonIds = lessons.map((l) => l._id);
    const [bookingCounts, sessionCounts] = await Promise.all([
      Booking.aggregate([
        { $match: { lessonId: { $in: lessonIds } } },
        { $group: { _id: '$lessonId', count: { $sum: 1 } } },
      ]),
      Session.aggregate([
        { $match: { lessonId: { $in: lessonIds } } },
        { $group: { _id: '$lessonId', count: { $sum: 1 } } },
      ]),
    ]);

    const bMap = Object.fromEntries(bookingCounts.map((x) => [x._id.toString(), x.count]));
    const sMap = Object.fromEntries(sessionCounts.map((x) => [x._id.toString(), x.count]));

    const result = lessons.map((l) => ({
      ...l,
      bookingsCount: bMap[l._id.toString()] || 0,
      sessionsCount: sMap[l._id.toString()] || 0,
    }));

    res.json({ lessons: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /lessons/:id
 */
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('mentorId', 'name email')
      .lean();
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const sessions = await Session.find({ lessonId: lesson._id }).sort({ date: 1 }).lean();
    const bookingsCount = await Booking.countDocuments({ lessonId: lesson._id });

    res.json({ lesson: { ...lesson, sessions, bookingsCount } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLesson, getLessons, getLessonById };
