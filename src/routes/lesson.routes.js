const router = require('express').Router();
const { createLesson, getLessons, getLessonById } = require('../controllers/lesson.controller');
const { getSessionsByLesson } = require('../controllers/session.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { validate, createLessonSchema } = require('../middleware/validate.middleware');

router.use(authenticate);

router.post('/', requireRole('MENTOR'), validate(createLessonSchema), createLesson);
router.get('/', getLessons);
router.get('/:id', getLessonById);
router.get('/:id/sessions', getSessionsByLesson);

module.exports = router;
