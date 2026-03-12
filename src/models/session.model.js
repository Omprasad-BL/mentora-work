const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ lessonId: 1 });

module.exports = mongoose.model('Session', sessionSchema);
