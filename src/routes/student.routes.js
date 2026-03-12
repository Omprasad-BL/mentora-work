const router = require('express').Router();
const { createStudent, getStudents } = require('../controllers/student.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { validate, createStudentSchema } = require('../middleware/validate.middleware');

router.use(authenticate, requireRole('PARENT'));

router.post('/', validate(createStudentSchema), createStudent);
router.get('/', getStudents);

module.exports = router;
