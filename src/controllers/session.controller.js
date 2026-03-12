const Session = require('../models/session.model');
const SessionAttendance = require('../models/sessionAttendance.model');
const Lesson = require('../models/lesson.model');
const Student = require('../models/student.model');
const Booking = require('../models/booking.model');

/**
 * POST /sessions — Mentor only
 */
const createSession = async (req, res, next) => {
  try {
    const { lessonId, date, topic, summary } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    if (lesson.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only create sessions for your own lessons' });
    }

    const session = await Session.create({ lessonId, date: new Date(date), topic, summary });
    await session.populate('lessonId', 'title');

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /lessons/:id/sessions — Any authenticated user
 */
const getSessionsByLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const sessions = await Session.find({ lessonId: req.params.id })
      .sort({ date: 1 })
      .lean();

    // Attach attendance count per session
    const sessionIds = sessions.map((s) => s._id);
    const counts = await SessionAttendance.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      { $group: { _id: '$sessionId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

    const result = sessions.map((s) => ({
      ...s,
      attendanceCount: countMap[s._id.toString()] || 0,
    }));

    res.json({ sessions: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /sessions/:id/join — Parent only (Bonus)
 */
const joinSession = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Verify student belongs to parent
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only manage your own students' });
    }

    // Verify student is booked for the lesson
    const booking = await Booking.findOne({ studentId, lessonId: session.lessonId });
    if (!booking) {
      return res.status(403).json({ error: 'Student is not booked for this lesson' });
    }

    const attendance = await SessionAttendance.create({
      sessionId: req.params.id,
      studentId,
    });
    await attendance.populate([
      { path: 'sessionId', select: 'topic date' },
      { path: 'studentId', select: 'name' },
    ]);

    res.status(201).json({ attendance });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Student has already joined this session' });
    }
    next(err);
  }
};

module.exports = { createSession, getSessionsByLesson, joinSession };
