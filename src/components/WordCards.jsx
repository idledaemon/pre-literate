import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, Check, RotateCcw, Quote, BookOpen } from 'lucide-react';
import { vocabularyThemes } from '../data/vocabulary';
import { speak } from '../utils/speech';
import { getWaIllustration } from '../utils/word-atlas';
import { markWordLearned, getProgress } from '../utils/storage';
import waEntries from '../../public/wa-entries.json';

// SFX 播放器（预加载 + 缓存）
const sfxCache = {};
function playSfx(name) {
  try {
    if (!sfxCache[name]) {
      sfxCache[name] = new Audio(`/wa-sfx/${name}.mp3`);
      sfxCache[name].volume = 0.5;
    }
    const a = sfxCache[name];
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch {}
}

export default function WordCards({ themeId, difficulty, onBack }) {
  const theme = useMemo(
    () => vocabularyThemes.find((t) => t.id === themeId),
    [themeId]
  );
  const wordList = useMemo(() => {
    if (!theme) return [];
    if (!difficulty) return theme.words;
    return theme.words.filter((w) => w.difficulty === difficulty);
  }, [theme, difficulty]);

  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learnedSet, setLearnedSet] = useState(() => {
    const p = getProgress();
    return new Set(p.learnedWords[themeId] || []);
  });
  const [imgFailed, setImgFailed] = useState({});
  const [playingEx, setPlayingEx] = useState(null);

  useEffect(() => {
    setIndex(0);
    setShowMeaning(false);
  }, [difficulty, themeId]);

  useEffect(() => {
    setShowMeaning(false);
    if (wordList[index]) {
      const timer = setTimeout(() => {
        speak(wordList[index].word, { word: wordList[index].word, skipAutoplayGate: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [index, wordList]);

  if (!theme || wordList.length === 0) return null;

  const word = wordList[index];
  const progress = ((index + 1) / wordList.length) * 100;
  const isLearned = learnedSet.has(word.word);
  const entry = waEntries[word.word.toLowerCase()] || waEntries[word.word];

  const waImg = getWaIllustration(word.word);
  const imgError = !!imgFailed[word.word];
  const showRealImg = waImg && !imgError;

  const handleNext = () => {
    playSfx('page');
    setShowMeaning(false);
    if (index < wordList.length - 1) setIndex(index + 1);
  };
  const handlePrev = () => {
    playSfx('page');
    setShowMeaning(false);
    if (index > 0) setIndex(index - 1);
  };
  const handleMarkLearned = () => {
    markWordLearned(themeId, word.word);
    setLearnedSet((prev) => new Set([...prev, word.word]));
    playSfx('complete');
    speak('Great job!');
  };
  const handleSpeak = () => speak(word.word, { word: word.word, skipAutoplayGate: true });
  const toggleMeaning = () => {
    playSfx('flip');
    setShowMeaning((v) => !v);
  };

  // 播放例句音频
  const playExample = (idx) => {
    if (!entry) return;
    playSfx('tap');
    setPlayingEx(idx);
    const audio = new Audio(`/wa-audio-ex/${word.word.toLowerCase()}.mp3`);
    audio.onended = () => {
      setPlayingEx(null);
      // 播放完英文例句自动说中文释义让小孩听到
      if (entry.senses?.[0]?.zh) {
        setTimeout(() => speak(entry.senses[0].zh), 300);
      }
    };
    audio.onerror = () => setPlayingEx(null);
    audio.play().catch(() => setPlayingEx(null));
  };

  return (
    <div className="min-h-screen page-transition flex flex-col">
      <div className="px-4 pt-4 max-w-md mx-auto w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white font-bold mb-3 big-button"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-2">
          <div className="flex items-center justify-between text-white font-bold text-sm mb-2">
            <span className="flex items-center gap-2">
              {theme.emoji} {theme.name}
              <span className={`text-[10px] font-black bg-gradient-to-br ${word.cefrColor} px-2 py-0.5 rounded-full`}>
                {word.cefr}
              </span>
            </span>
            <span>{index + 1} / {wordList.length}</span>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card area — tap toggles front/back */}
      <div className="flex-1 flex items-center justify-center px-4 py-2">
        <div
          className="w-full max-w-sm aspect-[3/4] cursor-pointer relative"
          onClick={toggleMeaning}
        >
          {/* FRONT: illustration + word */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${theme.color} rounded-[2.5rem] card-shadow overflow-hidden flex flex-col transition-opacity duration-300 ${
              showMeaning ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="h-3/5 bg-white overflow-hidden relative flex items-center justify-center">
              {showRealImg ? (
                <img
                  src={waImg}
                  alt={word.word}
                  className="w-full h-full object-cover"
                  onError={() => setImgFailed((p) => ({ ...p, [word.word]: true }))}
                />
              ) : (
                <>
                  <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-white to-gray-100 -top-6 -left-6 opacity-60" />
                  <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-100 bottom-4 right-6 opacity-50" />
                  <div className="relative z-10 text-[9rem] leading-none animate-pop drop-shadow-lg select-none">
                    {word.emoji}
                  </div>
                </>
              )}
            </div>
            <div className="h-2/5 flex flex-col items-center justify-center p-4">
              <div className="text-white text-4xl font-black text-center tracking-wide drop-shadow-lg">
                {word.word}
              </div>
              {entry?.ipa_us && (
                <div className="text-white/70 text-lg font-mono mt-1">
                  {entry.ipa_us}
                </div>
              )}
              <div className="text-white/70 text-xs mt-2 font-semibold flex items-center gap-1">
                Tap to see meaning <RotateCcw className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* BACK: 完整词条 */}
          <div
            className={`absolute inset-0 bg-white rounded-[2.5rem] card-shadow overflow-hidden transition-opacity duration-300 ${
              showMeaning ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="h-full flex flex-col p-5 overflow-y-auto">
              {/* 头部：emoji + word + ipa */}
              <div className="flex items-start gap-3 mb-3">
                <div className="text-5xl leading-none">{word.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 text-3xl font-black leading-tight">{word.word}</div>
                  {entry?.ipa_us && (
                    <div className="text-gray-500 font-mono text-sm mt-0.5">
                      US {entry.ipa_us} {entry.ipa_uk && <span className="text-gray-400">UK {entry.ipa_uk}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* 词性 + 中文释义 */}
              <div className="space-y-1.5 mb-3">
                {entry?.senses?.length ? entry.senses.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 text-[10px] font-black text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded mt-0.5">
                      {s.pos}
                    </span>
                    <span className="text-gray-700 font-bold text-base">{s.zh}</span>
                  </div>
                )) : word.zh ? (
                  <div className="text-gray-700 font-bold text-lg">{word.zh}</div>
                ) : null}
              </div>

              {/* 例句区 */}
              {entry?.examples?.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3 mb-3">
                  <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Example Sentences
                  </div>
                  {entry.examples.slice(0, 2).map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 mb-2 last:mb-0 cursor-pointer hover:bg-white/60 rounded-xl p-1.5 -mx-1.5 transition-colors"
                      onClick={(e) => { e.stopPropagation(); playExample(i); }}
                    >
                      <button
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          playingEx === i ? 'bg-indigo-500 text-white animate-pulse' : 'bg-indigo-500 text-white'
                        }`}
                        onClick={(e) => { e.stopPropagation(); playExample(i); }}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 text-sm font-semibold leading-snug">{ex.en}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{ex.zh}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CEFR tag */}
              <div className="text-gray-400 text-[10px] font-semibold mb-2">
                CEFR {word.cefr} · {word.difficulty}
              </div>

              {/* Say it again button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak();
                }}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-2xl flex items-center gap-2 big-button self-start"
              >
                <Volume2 className="w-4 h-4" />
                Say it again
              </button>

              <div className="text-gray-300 text-[10px] mt-auto pt-2 text-center font-semibold">
                Tap to flip back ↻
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-6 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center big-button ${
              index === 0 ? 'bg-white/30 text-white/50' : 'bg-white text-gray-700 card-shadow'
            }`}
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={3} />
          </button>

          <button
            onClick={handleMarkLearned}
            disabled={isLearned}
            className={`flex-1 mx-3 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-lg big-button ${
              isLearned
                ? 'bg-green-200 text-green-700'
                : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white card-shadow'
            }`}
          >
            <Check className="w-6 h-6" strokeWidth={3} />
            {isLearned ? 'Learned!' : 'I know it!'}
          </button>

          <button
            onClick={handleNext}
            disabled={index === wordList.length - 1}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center big-button ${
              index === wordList.length - 1 ? 'bg-white/30 text-white/50' : 'bg-white text-gray-700 card-shadow'
            }`}
          >
            <ChevronRight className="w-7 h-7" strokeWidth={3} />
          </button>
        </div>

        <button
          onClick={handleSpeak}
          className="w-full bg-white/90 backdrop-blur rounded-2xl py-3 font-bold text-gray-700 big-button flex items-center justify-center gap-2"
        >
          <Volume2 className="w-5 h-5" />
          Tap to hear
        </button>
      </div>
    </div>
  );
}
