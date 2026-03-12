const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  req.body = result.data;
  next();
};

// ── Schemas ───────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1),
  role: z.enum(['PARENT', 'MENTOR']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createStudentSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(1).max(100).optional(),
});

const createLessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const createBookingSchema = z.object({
  studentId: z.string().min(1),
  lessonId: z.string().min(1),
});

const createSessionSchema = z.object({
  lessonId: z.string().min(1),
  date: z.string().datetime(),
  topic: z.string().min(1),
  summary: z.string().optional(),
});

const summarizeSchema = z.object({
  text: z
    .string()
    .min(50, 'Text must be at least 50 characters')
    .max(10000, 'Text too large (max 10,000 characters)'),
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  createStudentSchema,
  createLessonSchema,
  createBookingSchema,
  createSessionSchema,
  summarizeSchema,
};
