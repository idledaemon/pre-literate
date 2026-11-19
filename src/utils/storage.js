// ---------- User management ----------
const USERS_KEY = 'happy-kids-users';
const CURRENT_USER_KEY = 'happy-kids-current-user';
const PROGRESS_PREFIX = 'happy-kids-progress-';

const defaultProgress = {
  learnedWords: {},
  learnedDialogues: {},
  wordRevisions: {}, // spaced-repetition data per word
  dailyStats: {},    // { '2026-11-19': { words: 5, minutes: 10 } }
};

// ---- helpers ----
const safe = (fn, fallback) => {
  try { return fn(); } catch { return fallback; }
};

const uid = () => Math.random().toString(36).slice(2, 10);

const getDefaultAvatars = () => ['🦊', '🐰', '🐻', '🐼', '🐵', '🦁', '🐯', '🐨', '🐸', '🐙'];

// ---- users ----
export function getUsers() {
  return safe(() => {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  }, []);
}

export function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { console.warn(e); }
}

export function getCurrentUser() {
  const id = safe(() => localStorage.getItem(CURRENT_USER_KEY), null);
  if (!id) return null;
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function setCurrentUser(userId) {
  try { localStorage.setItem(CURRENT_USER_KEY, userId); } catch (e) { console.warn(e); }
}

export function createUser(name, avatar) {
  const users = getUsers();
  const newUser = {
    id: uid(),
    name: (name || '').trim().slice(0, 20) || 'Friend',
    avatar: avatar || getDefaultAvatars()[users.length % getDefaultAvatars().length],
    createdAt: Date.now(),
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser.id);
  // migrate legacy progress if this is the first user
  migrateLegacyIfNeeded(newUser.id);
  return newUser;
}

export function deleteUser(userId) {
  const users = getUsers().filter((u) => u.id !== userId);
  saveUsers(users);
  try { localStorage.removeItem(PROGRESS_PREFIX + userId); } catch {}
  const cur = getCurrentUser();
  if (cur && cur.id === userId) {
    const first = users[0] || null;
    if (first) setCurrentUser(first.id);
    else localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// ---- progress (per current user) ----
function currentProgressKey() {
  const u = getCurrentUser();
  if (!u) throw new Error('No current user');
  return PROGRESS_PREFIX + u.id;
}

export function getProgress() {
  return safe(() => {
    const key = currentProgressKey();
    const raw = localStorage.getItem(key);
    if (!raw) return JSON.parse(JSON.stringify(defaultProgress));
    return { ...JSON.parse(JSON.stringify(defaultProgress)), ...JSON.parse(raw) };
  }, JSON.parse(JSON.stringify(defaultProgress)));
}

export function saveProgress(progress) {
  try { localStorage.setItem(currentProgressKey(), JSON.stringify(progress)); } catch (e) { console.warn(e); }
}

export function markWordLearned(themeId, word) {
  const p = getProgress();
  if (!p.learnedWords[themeId]) p.learnedWords[themeId] = [];
  if (!p.learnedWords[themeId].includes(word)) {
    p.learnedWords[themeId].push(word);
    bumpDailyStat(p, 'words');
    saveProgress(p);
  }
}

export function markDialogueLearned(sceneId, index) {
  const p = getProgress();
  if (!p.learnedDialogues[sceneId]) p.learnedDialogues[sceneId] = [];
  if (!p.learnedDialogues[sceneId].includes(index)) {
    p.learnedDialogues[sceneId].push(index);
    bumpDailyStat(p, 'dialogues');
    saveProgress(p);
  }
}

export function getAllLearnedWords() {
  const p = getProgress();
  const all = [];
  Object.entries(p.learnedWords).forEach(([themeId, words]) => {
    words.forEach((w) => all.push({ themeId, word: w }));
  });
  return all;
}

export function getTotalLearned() {
  const p = getProgress();
  let words = 0;
  let dialogues = 0;
  Object.values(p.learnedWords).forEach((arr) => (words += arr.length));
  Object.values(p.learnedDialogues).forEach((arr) => (dialogues += arr.length));
  return { words, dialogues };
}

export function clearProgress() {
  try { localStorage.removeItem(currentProgressKey()); } catch {}
}

// ---- daily / stats helpers ----
function bumpDailyStat(progress, field) {
  const d = new Date().toISOString().slice(0, 10);
  if (!progress.dailyStats[d]) progress.dailyStats[d] = { words: 0, dialogues: 0 };
  progress.dailyStats[d][field] = (progress.dailyStats[d][field] || 0) + 1;
}

export function getDailyStats(days = 7) {
  const p = getProgress();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, ...(p.dailyStats[key] || { words: 0, dialogues: 0 }) });
  }
  return result;
}

// ---- one-shot migration from old single-key storage ----
function migrateLegacyIfNeeded(userId) {
  try {
    const oldKey = 'happy-kids-progress';
    const newKey = PROGRESS_PREFIX + userId;
    if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
      const raw = localStorage.getItem(oldKey);
      localStorage.setItem(newKey, raw);
      // don't delete old yet, in case something else still references it
    }
  } catch {}
}

// ---- avatar palette (emoji choices) ----
export function getAvatarChoices() {
  return getDefaultAvatars();
}
