const { anthropic } = require('./_coach');

module.exports = (_req, res) => {
  res.status(200).json({ ok: true, hasApiKey: Boolean(anthropic) });
};
