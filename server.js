require('dotenv').config();

const path = require('path');
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';

app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const FEEDBACK_TOOL = {
  name: 'give_speaking_feedback',
  description: 'Return structured English speaking-practice feedback for what the learner said.',
  input_schema: {
    type: 'object',
    properties: {
      detected_language: {
        type: 'string',
        enum: ['english', 'hindi', 'hinglish'],
        description: 'The dominant language of the learner\'s original input.'
      },
      translation: {
        type: ['string', 'null'],
        description: 'If the input contained Hindi/Hinglish, a natural English translation of it. Null if the input was already fully in English.'
      },
      corrected: {
        type: 'string',
        description: 'A grammatically correct, natural-sounding English version that preserves the learner\'s original meaning and intent as closely as possible.'
      },
      errors: {
        type: 'array',
        description: 'Specific grammar, word-choice, or pronunciation-relevant issues found, in the order they occur. Empty array if none.',
        items: {
          type: 'object',
          properties: {
            issue: { type: 'string', description: 'Short label, e.g. "subject-verb agreement" or "wrong preposition".' },
            explanation: { type: 'string', description: 'One or two friendly sentences explaining the fix.' }
          },
          required: ['issue', 'explanation']
        }
      },
      tone_feedback: {
        type: 'string',
        description: 'One or two sentences on the tone/naturalness/formality of the sentence and how it would land with a native speaker.'
      },
      alternatives: {
        type: 'array',
        description: '2-3 alternative, more natural or more polished ways to express the same idea, varying in formality (casual, neutral, formal/professional).',
        items: { type: 'string' }
      },
      encouragement: {
        type: 'string',
        description: 'One short, warm, specific encouraging note from a friendly speaking coach. Mention something they did well.'
      }
    },
    required: ['detected_language', 'corrected', 'errors', 'tone_feedback', 'alternatives', 'encouragement']
  }
};

const SYSTEM_PROMPT = `You are a warm, encouraging English speaking coach for a learner whose first language is Hindi.
The learner speaks or types a sentence, possibly in English, Hindi, or a mix (Hinglish). Your job:
1. If the input is in Hindi or Hinglish, translate it naturally into English first.
2. Identify grammar, word-choice, and naturalness issues in what they said (or in the translated version).
3. Give a corrected, natural-sounding English sentence that preserves their original meaning.
4. Comment briefly on tone/formality/naturalness - how it would sound to a native speaker.
5. Offer 2-3 alternative, more polished or natural ways to say the same thing, varying formality (casual / neutral / formal).
6. End with one short, specific, encouraging remark.
Be concise, kind, and practical. Never be condescending. Always call the give_speaking_feedback tool with your response as structured data - do not respond in plain text.`;

app.post('/api/analyze', async (req, res) => {
  const { text, inputLanguage } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please provide some text to analyze.' });
  }
  if (text.length > 2000) {
    return res.status(400).json({ error: 'That is too long — try a shorter sentence or two.' });
  }
  if (!anthropic) {
    return res.status(500).json({
      error: 'Server is missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key, then restart the server.'
    });
  }

  try {
    const userNote = inputLanguage === 'hi'
      ? `The learner selected "Hindi" as their input language. Text: "${text.trim()}"`
      : `The learner said: "${text.trim()}"`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [FEEDBACK_TOOL],
      tool_choice: { type: 'tool', name: 'give_speaking_feedback' },
      messages: [{ role: 'user', content: userNote }]
    });

    const toolUse = message.content.find((block) => block.type === 'tool_use');
    if (!toolUse) {
      return res.status(502).json({ error: 'The model did not return structured feedback. Please try again.' });
    }

    res.json(toolUse.input);
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(502).json({ error: 'Something went wrong talking to the AI coach. Please try again in a moment.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(anthropic) });
});

app.listen(PORT, () => {
  console.log(`Confident Guide running at http://localhost:${PORT}`);
  if (!anthropic) {
    console.warn('Warning: ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.');
  }
});
