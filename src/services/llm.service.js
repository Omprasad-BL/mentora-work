const Anthropic = require('@anthropic-ai/sdk');

let client;
const getClient = () => {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
};

const SYSTEM_PROMPT = `You are a concise summarization assistant.
When given a text, return a clear summary in exactly 3–6 bullet points.
Each bullet point should be one sentence.
Focus on the key ideas, findings, or actions.
Respond ONLY with the bullet points — no preamble, no extra explanation.
Format each point starting with "• ".`;

/**
 * Summarize text using Claude claude-sonnet-4-20250514.
 * @param {string} text
 * @returns {{ summary: string, model: string }}
 */
const summarizeText = async (text) => {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Please summarize the following text:\n\n${text}` }],
  });

  const summary = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return { summary, model: message.model };
};

module.exports = { summarizeText };
