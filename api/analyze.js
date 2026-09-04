const { anthropic, MODEL, FEEDBACK_TOOL, SYSTEM_PROMPT } = require('./_coach');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { text, inputLanguage } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please provide some text to analyze.' });
  }
  if (text.length > 2000) {
    return res.status(400).json({ error: 'That is too long — try a shorter sentence or two.' });
  }
  if (!anthropic) {
    return res.status(500).json({
      error: 'Server is missing ANTHROPIC_API_KEY. Set it in your environment (.env locally, or Project Settings on Vercel) and restart/redeploy.'
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

    res.status(200).json(toolUse.input);
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(502).json({ error: 'Something went wrong talking to the AI coach. Please try again in a moment.' });
  }
};
