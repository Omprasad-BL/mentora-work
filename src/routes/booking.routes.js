const router = require('express').Router();
const { createBooking, getBookings } = require('../controllers/booking.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { validate, createBookingSchema } = require('../middleware/validate.middleware');

router.use(authenticate, requireRole('PARENT'));

router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getBookings);

module.exports = router;
