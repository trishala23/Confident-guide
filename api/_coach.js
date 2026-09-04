const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';

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

// USD per 1M tokens. Update if pricing changes or CLAUDE_MODEL is switched
// to a model not listed here.
const PRICING = {
  'claude-sonnet-5': { input: 2.0, output: 10.0 },
  'claude-opus-5': { input: 5.0, output: 25.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 }
};

function estimateCostUsd(usage, model) {
  const rates = PRICING[model] || PRICING['claude-sonnet-5'];
  const inputTokens = (usage.input_tokens || 0)
    + (usage.cache_creation_input_tokens || 0)
    + (usage.cache_read_input_tokens || 0);
  const outputTokens = usage.output_tokens || 0;
  return (inputTokens / 1e6) * rates.input + (outputTokens / 1e6) * rates.output;
}

module.exports = { anthropic, MODEL, FEEDBACK_TOOL, SYSTEM_PROMPT, estimateCostUsd };
