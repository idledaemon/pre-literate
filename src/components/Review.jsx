import { useMemo, useState } from 'react';
import { ArrowLeft, Volume2, Trash2 } from 'lucide-react';
import { vocabularyThemes } from '../data/vocabulary';
import { conversations } from '../data/conversations';
import { getProgress, clearProgress } from '../utils/storage';
import { speak } from '../utils/speech';

export default function Review({ onBack }) {
  const [tab, setTab] = useState('words');
  const [confirmClear, setConfirmClear] = useState(false);

  const progress = useMemo(() => getProgress(), []);

  const learnedWords = useMemo(() => {
    const items = [];
    vocabularyThemes.forEach((theme) => {
      const learned = progress.learnedWords[theme.id] || [];
      learned.forEach((wordText) => {
        const w = theme.words.find((x) => x.word === wordText);
        if (w) items.push({ ...w, themeName: theme.name, themeId: theme.id });
      });
    });
    return items;
  }, [progress]);

  const learnedDialogues = useMemo(() => {
    const items = [];
    conversations.forEach((scene) => {
      const learned = progress.learnedDialogues[scene.id] || [];
      learned.forEach((idx) => {
        const d = scene.dialogues[idx];
        if (d) items.push({ ...d, sceneName: scene.name, sceneId: scene.id });
      });
    });
    return items;
  }, [progress]);

  const handleClear = () => {
    clearProgress();
    setConfirmClear(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen page-transition pb-8">
      <div className="px-4 pt-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white font-bold big-button"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            className="text-white/70 hover:text-white big-button p-2"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-3xl font-black text-white drop-shadow-lg mb-4">📝 Review</h2>

        <div className="flex bg-white/30 backdrop-blur rounded-2xl p-1 mb-4">
          <button
            onClick={() => setTab('words')}
            className={`flex-1 py-2 rounded-xl font-bold big-button transition-all ${
              tab === 'words' ? 'bg-white text-gray-800 shadow' : 'text-white'
            }`}
          >
            Words ({learnedWords.length})
          </button>
          <button
            onClick={() => setTab('dialogues')}
            className={`flex-1 py-2 rounded-xl font-bold big-button transition-all ${
              tab === 'dialogues' ? 'bg-white text-gray-800 shadow' : 'text-white'
            }`}
          >
            Talk ({learnedDialogues.length})
          </button>
        </div>

        {confirmClear && (
          <div className="bg-white rounded-2xl p-4 mb-4 card-shadow">
            <p className="text-gray-800 font-bold mb-3">Clear all progress?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 big-button"
              >
                No
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 rounded-xl font-bold bg-red-500 text-white big-button"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {tab === 'words' && (
          <div>
            {learnedWords.length === 0 ? (
              <div className="bg-white/90 rounded-3xl p-8 text-center card-shadow">
                <div className="text-5xl mb-3">📚</div>
                <p className="text-gray-600 font-bold">No words learned yet!</p>
                <p className="text-gray-400 text-sm mt-1">Go learn some words first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {learnedWords.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => speak(w.word)}
                    className="bg-white rounded-2xl p-4 card-shadow big-button text-center"
                  >
                    <div className="text-4xl mb-2">{w.emoji}</div>
                    <div className="font-black text-gray-800 text-lg">{w.word}</div>
                    <div className="text-xs text-purple-400 font-semibold mt-1 flex items-center justify-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      {w.themeName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'dialogues' && (
          <div>
            {learnedDialogues.length === 0 ? (
              <div className="bg-white/90 rounded-3xl p-8 text-center card-shadow">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-gray-600 font-bold">No sentences yet!</p>
                <p className="text-gray-400 text-sm mt-1">Learn some conversations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {learnedDialogues.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => speak(d.en)}
                    className="w-full bg-white rounded-2xl p-4 card-shadow big-button text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{d.speaker?.emoji || '👤'}</div>
                      <div className="flex-1">
                        <div className="font-black text-gray-800">{d.en}</div>
                        <div className="text-xs text-emerald-500 font-semibold mt-1">
                          {d.sceneName}
                        </div>
                      </div>
                      <Volume2 className="w-5 h-5 text-gray-400 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
