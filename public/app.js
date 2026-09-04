(() => {
  const langButtons = document.querySelectorAll('.lang-btn');
  const micBtn = document.getElementById('micBtn');
  const micStatus = document.getElementById('micStatus');
  const textInput = document.getElementById('textInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resultsPanel = document.getElementById('resultsPanel');
  const loadingState = document.getElementById('loadingState');
  const resultsContent = document.getElementById('resultsContent');
  const errorState = document.getElementById('errorState');
  const translationBlock = document.getElementById('translationBlock');
  const translationText = document.getElementById('translationText');
  const correctedText = document.getElementById('correctedText');
  const speakCorrectedBtn = document.getElementById('speakCorrectedBtn');
  const errorsBlock = document.getElementById('errorsBlock');
  const errorsList = document.getElementById('errorsList');
  const toneText = document.getElementById('toneText');
  const alternativesBlock = document.getElementById('alternativesBlock');
  const alternativesList = document.getElementById('alternativesList');
  const encouragementText = document.getElementById('encouragementText');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const browserSupportNote = document.getElementById('browserSupportNote');

  const HISTORY_KEY = 'confident-guide-history';
  let currentLang = 'en';
  let recognition = null;
  let isRecording = false;

  // ---------- Language toggle ----------
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      langButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentLang = btn.dataset.lang;
      if (recognition) {
        recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
      }
      textInput.placeholder = currentLang === 'hi'
        ? 'अपना वाक्य यहाँ बोलें या टाइप करें…'
        : 'Your sentence will appear here — or just type it yourself…';
    });
  });

  // ---------- Speech recognition (Web Speech API) ----------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.addEventListener('start', () => {
      isRecording = true;
      micBtn.classList.add('recording');
      micBtn.setAttribute('aria-label', 'Stop recording');
      micStatus.textContent = 'Listening… speak now';
    });

    recognition.addEventListener('result', (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        textInput.value = (textInput.value ? textInput.value + ' ' : '') + finalTranscript.trim();
      } else if (interimTranscript) {
        micStatus.textContent = interimTranscript;
      }
    });

    recognition.addEventListener('end', () => {
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.setAttribute('aria-label', 'Start speaking');
      micStatus.textContent = 'Tap the mic and speak, or type below';
    });

    recognition.addEventListener('error', (event) => {
      isRecording = false;
      micBtn.classList.remove('recording');
      const messages = {
        'not-allowed': 'Microphone access was blocked. Please allow it in your browser settings.',
        'no-speech': "Didn't catch that — try speaking again.",
        'network': 'Network issue with speech recognition — try again.'
      };
      micStatus.textContent = messages[event.error] || 'Speech recognition error — please try again.';
    });

    micBtn.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          // recognition may already be starting; ignore
        }
      }
    });
  } else {
    micBtn.disabled = true;
    micStatus.textContent = 'Voice input is not supported in this browser — please type instead.';
    browserSupportNote.textContent = 'Tip: use Chrome or Edge for microphone-based speech recognition.';
  }

  // ---------- Text-to-speech ----------
  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  speakCorrectedBtn.addEventListener('click', () => speak(correctedText.textContent));

  // ---------- Clear ----------
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    resultsPanel.hidden = true;
    textInput.focus();
  });

  // ---------- Analyze ----------
  analyzeBtn.addEventListener('click', analyze);
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze();
  });

  async function analyze() {
    const text = textInput.value.trim();
    if (!text) {
      textInput.focus();
      return;
    }

    resultsPanel.hidden = false;
    resultsContent.hidden = true;
    errorState.hidden = true;
    loadingState.hidden = false;
    analyzeBtn.disabled = true;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, inputLanguage: currentLang })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      renderResults(text, data);
      saveToHistory(text, data);
    } catch (err) {
      loadingState.hidden = true;
      resultsContent.hidden = true;
      errorState.hidden = false;
      errorState.textContent = err.message || 'Something went wrong. Please try again.';
    } finally {
      analyzeBtn.disabled = false;
    }
  }

  function renderResults(originalText, data) {
    loadingState.hidden = true;
    errorState.hidden = true;
    resultsContent.hidden = false;

    if (data.translation) {
      translationBlock.hidden = false;
      translationText.textContent = data.translation;
    } else {
      translationBlock.hidden = true;
    }

    correctedText.textContent = data.corrected || originalText;

    if (Array.isArray(data.errors) && data.errors.length) {
      errorsBlock.hidden = false;
      errorsList.innerHTML = '';
      data.errors.forEach((e) => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = `${e.issue}: `;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(e.explanation));
        errorsList.appendChild(li);
      });
    } else {
      errorsBlock.hidden = true;
    }

    toneText.textContent = data.tone_feedback || '';

    if (Array.isArray(data.alternatives) && data.alternatives.length) {
      alternativesBlock.hidden = false;
      alternativesList.innerHTML = '';
      data.alternatives.forEach((alt) => {
        const item = document.createElement('div');
        item.className = 'alternative-item';
        const span = document.createElement('span');
        span.textContent = alt;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-btn';
        btn.textContent = '🔊';
        btn.setAttribute('aria-label', 'Listen to this alternative');
        btn.addEventListener('click', () => speak(alt));
        item.appendChild(span);
        item.appendChild(btn);
        alternativesList.appendChild(item);
      });
    } else {
      alternativesBlock.hidden = true;
    }

    encouragementText.textContent = data.encouragement || '';
  }

  // ---------- History (localStorage) ----------
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(originalText, data) {
    const history = loadHistory();
    history.unshift({
      original: originalText,
      corrected: data.corrected,
      timestamp: Date.now()
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    renderHistory();
  }

  function renderHistory() {
    const history = loadHistory();
    historyList.innerHTML = '';
    history.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      const orig = document.createElement('div');
      orig.className = 'h-original';
      orig.textContent = `You: ${item.original}`;
      const corrected = document.createElement('div');
      corrected.className = 'h-corrected';
      corrected.textContent = `Better: ${item.corrected}`;
      li.appendChild(orig);
      li.appendChild(corrected);
      li.addEventListener('click', () => {
        textInput.value = item.original;
        textInput.focus();
      });
      historyList.appendChild(li);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  });

  renderHistory();

  if (!('speechSynthesis' in window)) {
    browserSupportNote.textContent = (browserSupportNote.textContent ? browserSupportNote.textContent + ' ' : '') +
      'Note: this browser does not support reading feedback aloud.';
  }
})();
