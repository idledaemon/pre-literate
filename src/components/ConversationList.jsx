import { ArrowLeft } from 'lucide-react';
import { conversations } from '../data/conversations';
import { getProgress } from '../utils/storage';
import { useMemo } from 'react';

export default function ConversationList({ onNavigate, onBack }) {
  const progress = useMemo(() => getProgress(), []);

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

        <div className="mb-6">
          <h2 className="text-3xl font-black text-white drop-shadow-lg">💬 Conversations</h2>
          <p className="text-white/80 font-semibold">Real-life talking!</p>
        </div>

        <div className="space-y-3">
          {conversations.map((scene) => {
            const learned = progress.learnedDialogues[scene.id]?.length || 0;
            const total = scene.dialogues.length;
            const percent = Math.round((learned / total) * 100);

            return (
              <button
                key={scene.id}
                onClick={() => onNavigate('conversationcards', { sceneId: scene.id })}
                className={`w-full bg-white rounded-3xl card-shadow big-button text-left overflow-hidden flex items-center`}
              >
                {/* Scene thumbnail — big emoji on decorated tile */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 overflow-hidden relative flex items-center justify-center">
                  {/* Tiny decorative blobs */}
                  <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 -top-2 -left-2 opacity-70" />
                  <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 bottom-1 right-1 opacity-60" />
                  {/* Scene emoji */}
                  <div className="relative z-10 text-5xl leading-none select-none drop-shadow-sm">
                    {scene.emoji}
                  </div>
                </div>

                <div className="flex-1 px-4 py-3">
                  <div className="text-gray-800 font-black text-lg">{scene.name}</div>
                  <div className="text-gray-400 text-xs font-semibold mt-1">
                    {learned}/{total} sentences
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${scene.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pr-4 text-gray-300 text-3xl">›</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
