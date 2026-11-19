// word-atlas asset resolver.
// For any word, returns the best available illustration + audio.
import manifest from '../data/wa-manifest.json';

const illustratedSet = new Set(manifest.illustrated);

/**
 * Does word-atlas have a hand-drawn illustration for this word?
 * @param {string} word
 */
export function hasWaIllustration(word) {
  return illustratedSet.has(word);
}

/**
 * Get the word-atlas illustration URL (webp, 256x256 hand-drawn style).
 * Returns null if not available.
 * @param {string} word
 * @returns {string|null}
 */
export function getWaIllustration(word) {
  if (!illustratedSet.has(word)) return null;
  return `${manifest.thumb_dir}/${word}${manifest.thumb_ext}`;
}

/**
 * Get the word-atlas US (American) MP3 audio URL.
 * Returns null if not available.
 * @param {string} word
 * @returns {string|null}
 */
export function getWaAudioUS(word) {
  if (!illustratedSet.has(word)) return null;
  return `${manifest.audio_us_dir}/${word}${manifest.audio_ext}`;
}

/**
 * Get the word-atlas UK (British) MP3 audio URL.
 * @param {string} word
 * @returns {string|null}
 */
export function getWaAudioUK(word) {
  if (!illustratedSet.has(word)) return null;
  return `${manifest.audio_uk_dir}/${word}${manifest.audio_ext}`;
}
