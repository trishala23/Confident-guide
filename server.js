// Local development server. Mounts the same handler functions used by the
// Vercel serverless deployment (api/*.js), so there is one implementation
// of the API logic shared between `npm start` and the live Vercel app.
require('dotenv').config();

const path = require('path');
const express = require('express');

const analyzeHandler = require('./api/analyze');
const healthHandler = require('./api/health');
const { anthropic } = require('./api/_coach');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/analyze', analyzeHandler);
app.get('/api/health', healthHandler);

app.listen(PORT, () => {
  console.log(`Confident Guide running at http://localhost:${PORT}`);
  if (!anthropic) {
    console.warn('Warning: ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.');
  }
});
