import { useState, useMemo } from 'react';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
import {
  getUsers,
  createUser,
  deleteUser,
  setCurrentUser,
  getCurrentUser,
  getAvatarChoices,
} from '../utils/storage';

export default function UserSetup({ onBack, onSelectUser }) {
  const users = useMemo(() => getUsers(), []);
  const currentUser = getCurrentUser();
  const avatarChoices = getAvatarChoices();

  const [mode, setMode] = useState(users.length === 0 ? 'create' : 'list');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatarChoices[0]);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (users.some((u) => u.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('That name already exists');
      return;
    }
    createUser(name.trim(), avatar);
    setName('');
    setError('');
    // refresh users by switching mode back
    setMode('list');
    // signal parent to refresh too
    onSelectUser();
  };

  const handleSelect = (u) => {
    setCurrentUser(u.id);
    onSelectUser();
  };

  const handleDelete = (u) => {
    if (confirm(`Delete ${u.name}? All progress will be lost.`)) {
      deleteUser(u.id);
      onSelectUser();
      // re-memo users
      location.reload();
    }
  };

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

        <h2 className="text-3xl font-black text-white drop-shadow-lg mb-2">👤 Choose Profile</h2>
        <p className="text-white/80 font-semibold mb-6">Each kid has their own progress!</p>

        {mode === 'list' && (
          <div>
            <div className="space-y-3 mb-6">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelect(u)}
                    className={`w-full bg-white rounded-2xl card-shadow big-button text-left flex items-center gap-4 ${
                      isCurrent ? 'ring-4 ring-yellow-400' : ''
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-4xl flex-shrink-0">
                      {u.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-gray-800 text-lg">{u.name}</div>
                      <div className="text-xs text-gray-400 font-semibold">
                        {isCurrent ? '✓ Learning now' : 'Tap to switch'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(u);
                      }}
                      className="p-3 text-gray-300 hover:text-red-400 big-button"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMode('create')}
              className="w-full bg-white/90 backdrop-blur rounded-2xl p-4 card-shadow big-button flex items-center justify-center gap-3 text-gray-700 font-black"
            >
              <UserPlus className="w-6 h-6" />
              Add New Kid
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-white rounded-3xl p-6 card-shadow">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{avatar}</div>
              <div className="text-gray-500 font-bold text-sm">Choose avatar</div>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {avatarChoices.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-3xl big-button ${
                    avatar === a
                      ? 'bg-gradient-to-br from-purple-400 to-indigo-500 ring-4 ring-yellow-400'
                      : 'bg-gray-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-gray-500 font-bold text-sm block mb-2">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alice"
                maxLength={20}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none text-gray-800 text-lg font-bold"
              />
              {error && <div className="text-red-400 text-sm mt-1 font-semibold">{error}</div>}
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-lg py-4 rounded-2xl card-shadow big-button"
            >
              Let's start! 🚀
            </button>

            {users.length > 0 && (
              <button
                onClick={() => setMode('list')}
                className="w-full mt-3 text-gray-400 font-bold py-2 big-button"
              >
                ← Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
