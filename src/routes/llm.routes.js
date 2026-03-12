const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { summarize } = require('../controllers/llm.controller');
const { authenticate } = require('../middleware/auth.middleware');

const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many summarization requests. Please wait a minute and try again.' },
});

router.post('/summarize', authenticate, llmLimiter, summarize);

module.exports = router;
