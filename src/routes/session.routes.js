const router = require('express').Router();
const { createSession, joinSession } = require('../controllers/session.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { validate, createSessionSchema } = require('../middleware/validate.middleware');

router.use(authenticate);

router.post('/', requireRole('MENTOR'), validate(createSessionSchema), createSession);
router.post('/:id/join', requireRole('PARENT'), joinSession);

module.exports = router;
