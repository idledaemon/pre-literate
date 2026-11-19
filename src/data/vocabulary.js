// Aggregates all vocabulary themes.
// Themes come from themes-enriched.json (with CEFR + difficulty labels).
// Illustrations + audio resolved from word-atlas at render time.
import themesEnriched from './themes-enriched.json';

export const vocabularyThemes = themesEnriched.themes;

export const allWords = vocabularyThemes.flatMap((theme) =>
  theme.words.map((w) => ({ ...w, themeId: theme.id, themeName: theme.name, themeEmoji: theme.emoji }))
);

export const totalWordCount = themesEnriched.totalWords;
export const difficultyBreakdown = {
  easy: themesEnriched.totalEasy,
  medium: themesEnriched.totalMedium,
  hard: themesEnriched.totalHard,
};

export function getTheme(themeId) {
  return vocabularyThemes.find((t) => t.id === themeId);
}

export function getWord(word) {
  return allWords.find((w) => w.word === word);
}

export function getGameWords(count = 20, difficulty = null) {
  let pool = allWords;
  if (difficulty) pool = pool.filter((w) => w.difficulty === difficulty);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
