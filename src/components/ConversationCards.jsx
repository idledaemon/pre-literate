import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, Check } from 'lucide-react';
import { conversations } from '../data/conversations';
import { speak } from '../utils/speech';
import { markDialogueLearned, getProgress } from '../utils/storage';

export default function ConversationCards({ sceneId, onBack }) {
  const scene = useMemo(
    () => conversations.find((s) => s.id === sceneId),
    [sceneId]
  );
  const [index, setIndex] = useState(0);
  const [learnedSet, setLearnedSet] = useState(() => {
    const p = getProgress();
    return new Set(p.learnedDialogues[sceneId] || []);
  });

  useEffect(() => {
    if (scene && scene.dialogues[index]) {
      const timer = setTimeout(() => {
        speak(scene.dialogues[index].en, { skipAutoplayGate: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [index, scene]);

  if (!scene) return null;

  const dialogue = scene.dialogues[index];
  const progress = ((index + 1) / scene.dialogues.length) * 100;
  const isLearned = learnedSet.has(index);
  const speaker = dialogue.speaker;

  const handleNext = () => {
    if (index < scene.dialogues.length - 1) setIndex(index + 1);
  };
  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };
  const handleMarkLearned = () => {
    markDialogueLearned(sceneId, index);
    setLearnedSet((prev) => new Set([...prev, index]));
    speak('Well done!');
  };
  const handleSpeak = () => speak(dialogue.en);

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
            <span>{scene.emoji} {scene.name}</span>
            <span>{index + 1} / {scene.dialogues.length}</span>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-2">
        <div
          className={`w-full max-w-sm bg-gradient-to-br ${scene.color} rounded-[2.5rem] card-shadow flex flex-col overflow-hidden animate-pop`}
          key={index}
        >
          {/* Scene illustration — big emoji stage with decorations */}
          <div className="relative w-full aspect-[4/3] bg-white overflow-hidden flex items-center justify-center">
            {/* Decorative blob shapes */}
            <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-yellow-50 to-amber-100 -top-5 -left-5 opacity-70" />
            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-pink-50 to-rose-100 bottom-8 right-8 opacity-60" />
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-cyan-100 top-10 right-12 opacity-50" />
            {/* Big scene emoji */}
            <div className="relative z-10 text-[8rem] leading-none drop-shadow-lg animate-pop select-none">
              {scene.emoji}
            </div>
            {/* Floating sparkles */}
            <div className="absolute top-6 left-10 text-2xl opacity-40">⭐</div>
            <div className="absolute bottom-10 right-16 text-xl opacity-35">✨</div>
            <div className="absolute top-16 right-6 text-lg opacity-30">💫</div>

            {/* Speaker portrait — big cartoon avatar */}
            <div className="absolute -bottom-8 left-4">
              <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-5xl">
                  {speaker.emoji}
                </div>
              </div>
            </div>
          </div>

          {/* Dialogue bubble */}
          <div className="flex-1 pt-12 px-6 pb-6 flex flex-col items-center">
            <div className="bg-white rounded-3xl px-5 py-4 shadow-lg w-full mb-4">
              <div className="text-gray-800 text-2xl sm:text-3xl font-black text-center leading-tight">
                "{dialogue.en}"
              </div>
            </div>

            <button
              onClick={handleSpeak}
              className="bg-white/40 backdrop-blur text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 big-button"
            >
              <Volume2 className="w-5 h-5" />
              Tap to hear
            </button>

            <div className="text-white/80 text-xs mt-4 font-semibold text-center">
              {dialogue.translation}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between">
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
            {isLearned ? 'Got it!' : 'I know it!'}
          </button>

          <button
            onClick={handleNext}
            disabled={index === scene.dialogues.length - 1}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center big-button ${
              index === scene.dialogues.length - 1 ? 'bg-white/30 text-white/50' : 'bg-white text-gray-700 card-shadow'
            }`}
          >
            <ChevronRight className="w-7 h-7" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
