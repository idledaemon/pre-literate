// Speech: prefer word-atlas pre-recorded US MP3,
// fall back to Web Speech API (en-US) for words without audio.
import { getWaAudioUS } from './word-atlas';

let cachedVoice = null;
let voicesReady = false;
let activeAudio = null;
let userHasInteracted = false;

// Track first user interaction (touchend/click) — required for iOS autoplay.
if (typeof window !== 'undefined') {
  const mark = () => { userHasInteracted = true; };
  window.addEventListener('click', mark, { once: true });
  window.addEventListener('touchend', mark, { once: true });
}

function initVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (voicesReady) return;
  voicesReady = true;
  const tryFind = () => {
    if (cachedVoice) return;
    const voices = window.speechSynthesis.getVoices();
    cachedVoice =
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices.find((v) => v.default) ||
      voices[0] ||
      null;
  };
  window.speechSynthesis.onvoiceschanged = tryFind;
  tryFind();
  setTimeout(tryFind, 150);
  setTimeout(tryFind, 600);
}
initVoices();

/**
 * Speak text aloud.
 * Priority:
 *   1) Pre-recorded US MP3 from word-atlas
 *   2) Web Speech API TTS (en-US)
 *
 * @param {string} text
 * @param {{word?: string, rate?: number, skipAutoplayGate?: boolean}} opts
 */
export function speak(text, opts = {}) {
  if (typeof window === 'undefined') return;

  const wordKey = (opts.word || text || '').trim().toLowerCase();
  const audioUrl = getWaAudioUS(wordKey);

  // --- PATH A: pre-recorded MP3 ---
  if (audioUrl) {
    try {
      // Stop TTS, stop any previous audio
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopSpeaking();

      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.volume = 1;
      activeAudio = audio;

      const result = audio.play();
      if (result && typeof result.then === 'function') {
        result.catch((err) => {
          console.warn('[speech] MP3 play() blocked:', err.message, '— falling back to TTS');
          speakViaTTS(text, opts);
        });
      }
      return;
    } catch (e) {
      console.warn('[speech] MP3 init failed:', e);
    }
  }

  // --- PATH B: Web Speech API ---
  speakViaTTS(text, opts);
}

function speakViaTTS(text, opts) {
  if (!window.speechSynthesis) {
    console.warn('[speech] Web Speech API not supported');
    return;
  }
  if (!text || !text.trim()) return;

  // iOS Safari: TTS utterances created before first user interaction
  // are silently dropped. Respect the autoplay gate UNLESS caller says skip.
  if (!userHasInteracted && !opts.skipAutoplayGate) {
    console.log('[speech] waiting for first user interaction before TTS');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'en-US';
  utterance.rate = opts.rate ?? 0.85;
  utterance.pitch = opts.pitch ?? 1.15;
  utterance.volume = 1;

  if (!cachedVoice) initVoices();
  if (cachedVoice) utterance.voice = cachedVoice;

  utterance.onerror = (e) => console.warn('[speech] TTS error:', e.error);
  utterance.onstart = () => console.log('[speech] TTS speaking:', text);
  utterance.onend = () => console.log('[speech] TTS done');

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (activeAudio) {
    try { activeAudio.pause(); activeAudio.currentTime = 0; } catch {}
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
