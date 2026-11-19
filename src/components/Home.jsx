import { BookOpen, MessageCircle, RotateCcw, Gamepad2, Trophy, ChevronRight } from 'lucide-react';
import { getTotalLearned, getCurrentUser } from '../utils/storage';

export default function Home({ onNavigate }) {
  const { words, dialogues } = getTotalLearned();
  const user = getCurrentUser();

  return (
    <div className="min-h-screen page-transition">
      <div className="px-4 pt-6 pb-6 max-w-md mx-auto">
        {/* User bar */}
        <button
          onClick={() => onNavigate('usersetup')}
          className="w-full flex items-center gap-3 bg-white/90 backdrop-blur rounded-2xl p-3 mb-4 card-shadow big-button"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-3xl">
            {user?.avatar || '🦊'}
          </div>
          <div className="flex-1 text-left">
            <div className="font-black text-gray-800">{user?.name || 'Friend'}</div>
            <div className="text-xs text-gray-400 font-semibold">Tap to switch profile</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-2 animate-bounce-slow">🦊</div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            Happy Kids
          </h1>
          <p className="text-white/90 text-lg font-bold mt-1">
            Let's learn English together!
          </p>
        </div>

        {(words > 0 || dialogues > 0) && (
          <div className="bg-white/90 backdrop-blur rounded-3xl p-4 mb-6 card-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-700">My Progress</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-purple-600">{words}</div>
                <div className="text-xs font-semibold text-purple-500">Words</div>
              </div>
              <div className="flex-1 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-blue-600">{dialogues}</div>
                <div className="text-xs font-semibold text-blue-500">Sentences</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => onNavigate('vocabulary')}
            className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 card-shadow big-button text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/25 backdrop-blur rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-white text-2xl font-black">📖 Vocabulary</div>
                <div className="text-white/80 text-sm font-semibold">Learn new words</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('conversations')}
            className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 card-shadow big-button text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/25 backdrop-blur rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-white text-2xl font-black">💬 Conversations</div>
                <div className="text-white/80 text-sm font-semibold">Daily talk</div>
              </div>
            </div>
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('game')}
              className="flex-1 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-4 card-shadow big-button"
            >
              <div className="flex flex-col items-center gap-1">
                <Gamepad2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                <div className="text-white font-black text-sm">🎮 Game</div>
              </div>
            </button>
            <button
              onClick={() => onNavigate('review')}
              className="flex-1 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-4 card-shadow big-button"
            >
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-7 h-7 text-white" strokeWidth={2.5} />
                <div className="text-white font-black text-sm">📝 Review</div>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-white/70 text-xs font-semibold">
          Tap to hear pronunciation · 🎧
        </div>
      </div>
    </div>
  );
}
