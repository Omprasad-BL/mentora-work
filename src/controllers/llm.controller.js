const { summarizeText } = require('../services/llm.service');

const MIN_LENGTH = 50;
const MAX_LENGTH = 10000;

/**
 * POST /llm/summarize
 */
const summarize = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required and must be a non-empty string' });
    }
    if (text.trim().length < MIN_LENGTH) {
      return res.status(400).json({
        error: `Text too short. Minimum ${MIN_LENGTH} characters required.`,
        received: text.trim().length,
      });
    }
    if (text.length > MAX_LENGTH) {
      return res.status(413).json({
        error: `Text too large. Maximum ${MAX_LENGTH} characters allowed.`,
        received: text.length,
      });
    }

    const result = await summarizeText(text.trim());
    res.json(result);
  } catch (err) {
    if (err.status === 401 || err.message?.includes('API key')) {
      return res.status(502).json({ error: 'LLM service authentication failed' });
    }
    if (err.status >= 500 || err.message?.includes('overloaded')) {
      return res.status(502).json({ error: 'LLM service temporarily unavailable' });
    }
    if (err.message?.includes('ANTHROPIC_API_KEY')) {
      return res.status(500).json({ error: 'LLM service not configured' });
    }
    next(err);
  }
};

module.exports = { summarize };
