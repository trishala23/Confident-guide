# Confident Guide — English Speaking Practice

Speak (or type) a sentence in English or Hindi, and get instant feedback from an AI
speaking coach: grammar corrections, tone/naturalness notes, a few more polished
ways to say the same thing, and — for Hindi input — an English translation. You
can also listen to the corrected sentence read aloud.

## How it works

- **Speech-to-text** and **text-to-speech** happen entirely in your browser using the
  built-in [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  (works best in Chrome or Edge). No audio is uploaded anywhere.
- The transcribed (or typed) text is sent to a small Node/Express backend, which asks
  **Claude** (Anthropic's API) to translate (if needed), correct, and suggest better
  phrasing — returned as structured feedback.

## Setup

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
