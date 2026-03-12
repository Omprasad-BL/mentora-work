const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookings
bookingSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
