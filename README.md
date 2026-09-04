# Confident Guide — English Speaking Practice

Speak (or type) a sentence in English or Hindi, and get instant feedback from an AI
speaking coach: grammar corrections, tone/naturalness notes, a few more polished
ways to say the same thing, and — for Hindi input — an English translation. You
can also listen to the corrected sentence read aloud.

## How it works

- **Speech-to-text** and **text-to-speech** happen entirely in your browser using the
  built-in [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  (works best in Chrome or Edge). No audio is uploaded anywhere.
- The transcribed (or typed) text is sent to a small backend (plain Node handlers in
  `api/`, runnable either as Vercel serverless functions or via a local Express
  wrapper), which asks **Claude** (Anthropic's API) to translate (if needed), correct,
  and suggest better phrasing — returned as structured feedback.

## Deploy your own live link (free, via Vercel)

1. Push this repo to your own GitHub account (already done if you're reading this
   from your repo).
2. Go to [vercel.com](https://vercel.com/new) → **Add New Project** → import this
   GitHub repo (`trishala23/Confident-guide`). Vercel auto-detects the `api/` folder
   as serverless functions and `public/` as the static site — no build command needed.
3. Before deploying, add one environment variable in the Vercel project settings:
   - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com/
   - (optional) `CLAUDE_MODEL` if you want to override the default model.
4. Click **Deploy**. You'll get a free live URL like `confident-guide.vercel.app`
   (or pick a custom subdomain in project settings) — share that link with anyone,
   no server to babysit, and it scales to zero when idle at no cost.
5. Every future `git push` to this branch auto-redeploys.

Note: Vercel hosting itself is free, but calling the Claude API is a separate,
metered cost billed by Anthropic on your API key (new accounts get a small free
credit). GitHub Pages was **not** used here because it only serves static files —
it can't run the backend or keep your API key secret.

## Setup (running locally)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example env file and add your Anthropic API key (from
   https://console.anthropic.com/):
   ```bash
   cp .env.example .env
   # then edit .env and set ANTHROPIC_API_KEY
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in Chrome or Edge, allow microphone access, and start
   practicing.

## Using it

1. Choose **English** or **Hindi (हिंदी)** as your input language.
2. Tap the mic and speak (or just type into the box).
3. Press **Check my sentence** to get:
   - An English translation (if you spoke Hindi/Hinglish)
   - A corrected, natural-sounding sentence
   - A list of specific grammar issues and why they matter
   - Tone/naturalness feedback
   - 2–3 alternative ways to phrase it (casual / neutral / formal)
   - A short encouraging note
4. Tap 🔊 next to any sentence to hear it spoken aloud.
5. Your recent practice sentences are saved locally in your browser under
   **Practice history** so you can revisit them.

## Notes

- Voice input requires browser permission for the microphone and a browser that
  supports the Web Speech API (Chrome/Edge recommended; Safari and Firefox support
  is limited or absent). Typing always works as a fallback.
- Your `.env` file (with your API key) is git-ignored and never committed.
