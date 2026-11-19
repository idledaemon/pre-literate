import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { vocabularyThemes, difficultyBreakdown } from '../data/vocabulary';
import { getWaIllustration } from '../utils/word-atlas';
import { getProgress } from '../utils/storage';

const DIFFICULTY_TABS = [
  { key: 'all',    label: 'All',    emoji: '🌟', count: difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard, color: 'from-purple-500 to-indigo-600' },
  { key: 'easy',   label: 'Easy',   emoji: '🌱', count: difficultyBreakdown.easy,                        color: 'from-green-400 to-emerald-500' },
  { key: 'medium', label: 'Medium', emoji: '🌿', count: difficultyBreakdown.medium,                      color: 'from-yellow-400 to-orange-500' },
  { key: 'hard',   label: 'Hard',   emoji: '🌳', count: difficultyBreakdown.hard,                        color: 'from-orange-400 to-red-500' },
];

export default function VocabularyList({ onNavigate, onBack }) {
  const progress = useMemo(() => getProgress(), []);
  const [filter, setFilter] = useState('all');
  const [imgFailed, setImgFailed] = useState({});

  // Filter themes by difficulty: theme must have >= 1 word matching
  const filteredThemes = useMemo(() => {
    if (filter === 'all') return vocabularyThemes;
    return vocabularyThemes.filter((t) =>
      t.words.some((w) => w.difficulty === filter)
    );
  }, [filter]);

  return (
    <div className="min-h-screen page-transition pb-8">
      <div className="px-4 pt-6 max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white font-bold mb-4 big-button"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-4">
          <h2 className="text-3xl font-black text-white drop-shadow-lg">📖 Vocabulary</h2>
          <p className="text-white/80 font-semibold">Choose a theme!</p>
        </div>

        {/* Difficulty filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {DIFFICULTY_TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 px-3 py-2 rounded-2xl font-bold text-sm big-button transition-all ${
                  active
                    ? `bg-gradient-to-br ${tab.color} text-white card-shadow scale-105`
                    : 'bg-white/90 text-gray-700'
                }`}
              >
                <span className="mr-1">{tab.emoji}</span>
                {tab.label}
                <span className={`ml-1 text-xs font-black ${active ? 'text-white/90' : 'text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredThemes.map((theme) => {
            const learned = progress.learnedWords[theme.id]?.length || 0;
            const total = theme.wordCount;
            const percent = Math.round((learned / total) * 100);

            // Filter word list by chosen difficulty for "cover preview"
            let displayWords = theme.words;
            if (filter !== 'all') {
              const subset = theme.words.filter((w) => w.difficulty === filter);
              if (subset.length) displayWords = subset;
            }
            const coverWord = displayWords[0];
            const coverImg = coverWord ? getWaIllustration(coverWord.word) : null;
            const err = !!imgFailed[theme.id];
            const showReal = coverImg && !err;

            return (
              <button
                key={theme.id}
                onClick={() => onNavigate('wordcards', { themeId: theme.id, difficulty: filter === 'all' ? null : filter })}
                className={`bg-gradient-to-br ${theme.color} rounded-3xl card-shadow big-button text-left overflow-hidden relative`}
              >
                {/* Cover */}
                <div className="w-full aspect-square bg-white/20 overflow-hidden relative flex items-center justify-center">
                  {showReal ? (
                    <img
                      src={coverImg}
                      alt={theme.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgFailed((p) => ({ ...p, [theme.id]: true }))}
                    />
                  ) : (
                    <>
                      <div className="absolute w-16 h-16 rounded-full bg-white/30 -top-4 -left-4" />
                      <div className="absolute w-12 h-12 rounded-full bg-white/25 bottom-3 right-3" />
                      <div className="relative z-10 text-7xl leading-none drop-shadow-lg select-none">
                        {theme.emoji}
                      </div>
                    </>
                  )}
                </div>

                {/* Text overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
                  <div className="text-white font-black text-lg drop-shadow-lg leading-tight">{theme.name}</div>
                  <div className="text-white/90 text-xs font-semibold mt-0.5">
                    {filter === 'all'
                      ? `${learned}/${total} words`
                      : `${displayWords.length} ${filter} words`}
                  </div>
                  {/* Difficulty badges */}
                  <div className="flex gap-1 mt-1">
                    {theme.easyCount > 0 && (
                      <span className="text-[9px] font-black bg-green-400/90 text-white px-1.5 py-0.5 rounded-full">
                        E {theme.easyCount}
                      </span>
                    )}
                    {theme.mediumCount > 0 && (
                      <span className="text-[9px] font-black bg-yellow-400/90 text-white px-1.5 py-0.5 rounded-full">
                        M {theme.mediumCount}
                      </span>
                    )}
                    {theme.hardCount > 0 && (
                      <span className="text-[9px] font-black bg-red-400/90 text-white px-1.5 py-0.5 rounded-full">
                        H {theme.hardCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
