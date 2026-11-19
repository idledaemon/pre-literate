import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Volume2, Trophy, Star } from 'lucide-react';
import { allWords } from '../data/vocabulary';
import { speak, stopSpeaking } from '../utils/speech';
import { getWaIllustration } from '../utils/word-atlas';
import { getProgress } from '../utils/storage';

// SFX 播放器
const sfxCache = {};
function playSfx(name) {
  try {
    if (!sfxCache[name]) { sfxCache[name] = new Audio(`/wa-sfx/${name}.mp3`); sfxCache[name].volume = 0.5; }
    const a = sfxCache[name]; a.currentTime = 0; a.play().catch(() => {});
  } catch {}
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function sampleRandom(pool, n) { return shuffle(pool).slice(0, n); }

const DIFFICULTY_LEVELS = [
  { key: 'learned', label: 'My Words', emoji: '⭐', cefr: '', color: 'from-pink-400 to-rose-500', hint: 'Only words I learned' },
  { key: 'easy',    label: 'Easy',    emoji: '🌱', cefr: 'A1-A2', color: 'from-green-400 to-emerald-500', hint: 'Basic words' },
  { key: 'medium',  label: 'Medium',  emoji: '🌿', cefr: 'B1',   color: 'from-yellow-400 to-orange-500',  hint: 'Growing words' },
  { key: 'hard',    label: 'Hard',    emoji: '🌳', cefr: 'B2+',  color: 'from-orange-400 to-red-500',     hint: 'Challenge!' },
];

export default function Game({ onBack }) {
  const [difficulty, setDifficulty] = useState(null);       // null = 选难度页
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [skipped, setSkipped] = useState(new Set());
  const [imgFailed, setImgFailed] = useState({});

  // 按难度过滤词池 —— 用 word 字符串去重，防止跨主题重复
  const pool = useMemo(() => {
    if (!difficulty) {
      const seen = new Set();
      return allWords.filter((w) => {
        if (seen.has(w.word)) return false;
        seen.add(w.word);
        return true;
      });
    }
    if (difficulty === 'learned') {
      const p = getProgress();
      const learned = new Set();
      Object.values(p.learnedWords).forEach((arr) => arr.forEach((w) => learned.add(w)));
      const seen = new Set();
      return allWords.filter((w) => {
        if (!learned.has(w.word)) return false;
        if (seen.has(w.word)) return false;
        seen.add(w.word);
        return true;
      });
    }
    const seen = new Set();
    return allWords.filter((w) => {
      if (w.difficulty !== difficulty) return false;
      if (seen.has(w.word)) return false;
      seen.add(w.word);
      return true;
    });
  }, [difficulty]);

  const startGame = (diff) => {
    setDifficulty(diff);
    setScore(0);
    setQuestionCount(0);
    setGameOver(false);
    setQuestion(null);
    setSelected(null);
    setSkipped(new Set());
  };

  const generateQuestion = () => {
    if (questionCount >= 10) {
      setGameOver(true);
      return;
    }
    // 从未出过的词里选，池太小就回到全池
    let available = pool.filter((w) => !skipped.has(w.word));
    if (available.length < 4) available = pool;

    // 保证 pool 至少 4 个词（难度选择页已经 disabled 了 <4 的情况）
    if (available.length < 4) {
      // 极端兜底：从全量 allWords 里抽（已去重）
      const seen = new Set();
      available = allWords.filter((w) => {
        if (seen.has(w.word)) return false;
        seen.add(w.word);
        return true;
      }).slice(0, 100);
    }

    const correct = sampleRandom(available, 1)[0];
    // wrongs 从同一个 available 池抽，确保不重复、不与 correct 重名
    const wrongPool = available.filter((w) => w.word !== correct.word);
    const wrongs = sampleRandom(wrongPool, Math.min(3, wrongPool.length));
    // 如果 wrongs 不够 3 个（极端小池），从全量补
    if (wrongs.length < 3) {
      const extra = sampleRandom(
        allWords.filter((w) => w.word !== correct.word && !wrongs.some((x) => x.word === w.word)),
        3 - wrongs.length
      );
      wrongs.push(...extra);
    }

    const opts = shuffle([correct, ...wrongs]);
    setQuestion(correct);
    setOptions(opts);
    setSelected(null);
    setQuestionCount((c) => c + 1);
    setSkipped((prev) => new Set([...prev, correct.word]));

    // Auto-speak the correct answer
    const wordToSpeak = correct.word;
    setTimeout(() => {
      speak(wordToSpeak, { word: wordToSpeak, skipAutoplayGate: true });
    }, 400);
  };

  useEffect(() => {
    if (!gameOver && !question && difficulty) generateQuestion();
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, question, difficulty]);

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option.word);
    if (option.word === question.word) {
      setScore((s) => s + 1);
      playSfx('correct');
      speak('Correct! Nice!');
    } else {
      playSfx('wrong');
      speak(`Oops, it is ${question.word}`, { skipAutoplayGate: true });
    }
    setTimeout(() => { setQuestion(null); generateQuestion(); }, 1800);
  };

  const handlePlaySound = () => {
    if (question) speak(question.word, { word: question.word, skipAutoplayGate: true });
  };

  const imgFor = (w) => {
    const url = getWaIllustration(w.word);
    if (url && !imgFailed[w.word]) return { url, real: true };
    return { real: false };
  };

  // ========= 难度选择页 =========
  if (!difficulty) {
    // 提前算好 learned 模式的词数
    const p = getProgress();
    const learnedSet = new Set();
    Object.values(p.learnedWords).forEach((arr) => arr.forEach((w) => learnedSet.add(w)));
    const learnedPool = allWords.filter((w) => learnedSet.has(w.word));

    return (
      <div className="min-h-screen page-transition pb-8">
        <div className="px-4 pt-6 max-w-md mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white font-bold mb-4 big-button">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <h2 className="text-3xl font-black text-white drop-shadow-lg mb-1">🎮 Game</h2>
          <p className="text-white/80 font-semibold mb-6">Pick a difficulty!</p>

          <div className="space-y-3">
            {DIFFICULTY_LEVELS.map((lvl) => {
              let count;
              if (lvl.key === 'learned') count = learnedPool.length;
              else count = allWords.filter((w) => w.difficulty === lvl.key).length;

              const disabled = count < 4; // 少于 4 个词没法凑 4 个选项
              return (
                <button
                  key={lvl.key}
                  onClick={() => { playSfx('tap'); !disabled && startGame(lvl.key); }}
                  disabled={disabled}
                  className={`w-full bg-gradient-to-br ${lvl.color} rounded-3xl card-shadow big-button p-5 text-left flex items-center gap-4 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                    {lvl.emoji}
                  </div>
                  <div className="flex-1 text-white">
                    <div className="font-black text-xl">{lvl.label}</div>
                    {lvl.cefr && <div className="text-white/90 text-xs font-semibold">CEFR {lvl.cefr}</div>}
                    <div className="text-white/80 text-xs mt-0.5">
                      {count} words
                      {disabled && <span className="ml-1">· Learn more first! 📚</span>}
                    </div>
                  </div>
                  <div className="text-white text-3xl">›</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => startGame(null)}  // null = 全量
            className="w-full bg-white/20 backdrop-blur rounded-3xl card-shadow big-button p-4 mt-4 text-white font-bold text-sm"
          >
            🎲 Mixed (all 1896 words)
          </button>
        </div>
      </div>
    );
  }

  // ========= Game Over =========
  if (gameOver) {
    const percent = Math.round((score / 10) * 100);
    let emoji = '🌟', msg = 'Good job!';
    if (percent === 100) { emoji = '🏆'; msg = 'Perfect! You are amazing!'; }
    else if (percent >= 70) { emoji = '🎉'; msg = 'Great work!'; }
    else if (percent >= 50) { emoji = '👍'; msg = 'Keep practicing!'; }

    return (
      <div className="min-h-screen page-transition flex flex-col">
        <div className="px-4 pt-6 max-w-md mx-auto w-full">
          <button onClick={onBack} className="flex items-center gap-2 text-white font-bold mb-4 big-button">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 card-shadow text-center max-w-sm w-full">
            <div className="text-8xl mb-4 animate-pop">{emoji}</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Game Over!</h2>
            <p className="text-gray-500 font-bold mb-6">{msg}</p>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
              <div className="flex justify-center gap-8">
                <div><div className="text-4xl font-black text-green-500">{score}</div><div className="text-xs font-semibold text-green-400">Correct</div></div>
                <div className="text-4xl text-gray-300">|</div>
                <div><div className="text-4xl font-black text-red-400">{10 - score}</div><div className="text-xs font-semibold text-red-300">Wrong</div></div>
              </div>
              <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
              </div>
            </div>
            <button onClick={() => { playSfx('ignite'); startGame(difficulty); }} className="w-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-black text-xl py-4 rounded-2xl card-shadow big-button">
              Play Again! 🎮
            </button>
            <button onClick={() => setDifficulty(null)} className="w-full mt-3 bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl big-button">
              Change difficulty
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  // ========= 游戏进行中 =========
  const levelInfo = DIFFICULTY_LEVELS.find((l) => l.key === difficulty);

  return (
    <div className="min-h-screen page-transition flex flex-col">
      <div className="px-4 pt-4 max-w-md mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-white font-bold mb-3 big-button">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span>{score} / {questionCount}</span>
            {levelInfo && (
              <span className={`ml-2 text-[10px] font-black bg-gradient-to-br ${levelInfo.color} px-2 py-0.5 rounded-full`}>
                {levelInfo.emoji} {levelInfo.label}
              </span>
            )}
          </div>
          <div className="text-white font-bold text-sm">Q {questionCount} / 10</div>
        </div>
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${(questionCount / 10) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4">
        {/* 题目区：全图标，小孩不认字 */}
        <div className="bg-white rounded-3xl p-6 card-shadow text-center mb-5 w-full max-w-sm">
          <div className="text-3xl mb-3">🎧 ⁉️</div>
          <button onClick={handlePlaySound}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 w-28 h-28 rounded-full card-shadow big-button flex items-center justify-center mx-auto animate-pop">
            <Volume2 className="w-14 h-14 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* 4 个选项 */}
        <div className="text-white font-bold mb-3 text-xl">👆</div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {options.map((option) => {
            const isCorrect = option.word === question.word;
            const isSelected = selected === option.word;
            const showResult = selected !== null;
            const optImg = imgFor(option);

            let btnClass = 'bg-white';
            if (showResult) {
              if (isCorrect) btnClass = 'bg-gradient-to-br from-green-400 to-emerald-500';
              else if (isSelected) btnClass = 'bg-gradient-to-br from-red-400 to-red-500';
              else btnClass = 'bg-white opacity-60';
            }

            return (
              <button
                key={option.word}
                onClick={() => handleSelect(option)}
                disabled={selected !== null}
                className={`${btnClass} rounded-3xl card-shadow big-button text-center overflow-hidden`}
              >
                {/* 全图片，不给单词文字（小孩不认字！） */}
                <div className="w-full aspect-square bg-gray-50 overflow-hidden relative flex items-center justify-center">
                  {optImg.real ? (
                    <img src={optImg.url} alt="" className="w-full h-full object-cover"
                      onError={() => setImgFailed((p) => ({ ...p, [option.word]: true }))} />
                  ) : (
                    <div className="text-6xl leading-none">{option.emoji}</div>
                  )}
                </div>
                {/* 只有选完才 reveal 文字 —— 给陪同家长看的 */}
                {showResult && (
                  <div className={`py-1.5 font-black text-xs ${isCorrect ? 'text-white' : isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {option.word}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
