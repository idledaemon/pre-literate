import { useState, useEffect } from 'react';
import Home from './components/Home';
import VocabularyList from './components/VocabularyList';
import WordCards from './components/WordCards';
import ConversationList from './components/ConversationList';
import ConversationCards from './components/ConversationCards';
import Review from './components/Review';
import Game from './components/Game';
import UserSetup from './components/UserSetup';
import { getCurrentUser, createUser, getAvatarChoices } from './utils/storage';

export default function App() {
  const [page, setPage] = useState('boot');
  const [params, setParams] = useState({});
  const [history, setHistory] = useState(['home']);
  const [refreshKey, setRefreshKey] = useState(0); // bumps on user switch

  // On boot: ensure a user exists, otherwise jump to setup
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      const users = JSON.parse(localStorage.getItem('happy-kids-users') || '[]');
      if (users.length === 0) {
        // First time ever: auto-create a "Friend" user so app is immediately usable
        try {
          createUser('Friend', getAvatarChoices()[0]);
        } catch {}
      } else {
        // Users exist but none is current → jump to setup
        setPage('usersetup');
        return;
      }
    }
    setPage('home');
  }, [refreshKey]);

  const navigate = (target, newParams = {}) => {
    setHistory((prev) => [...prev, target]);
    setParams(newParams);
    setPage(target);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      const newPage = newHistory[newHistory.length - 1];
      if (newPage === 'usersetup') {
        // can't go back past user setup in a useful way; just go to home
        setPage('home');
      } else {
        setPage(newPage);
      }
      setParams({});
    }
  };

  if (page === 'boot') return null;

  const handleSelectUser = () => {
    setRefreshKey((k) => k + 1);
    setPage('home');
    setHistory(['home']);
    setParams({});
  };

  return (
    <div className="min-h-screen w-full">
      {page === 'home' && <Home onNavigate={navigate} />}
      {page === 'vocabulary' && (
        <VocabularyList onNavigate={navigate} onBack={goBack} />
      )}
      {page === 'wordcards' && (
        <WordCards themeId={params.themeId} difficulty={params.difficulty} onBack={goBack} />
      )}
      {page === 'conversations' && (
        <ConversationList onNavigate={navigate} onBack={goBack} />
      )}
      {page === 'conversationcards' && (
        <ConversationCards sceneId={params.sceneId} onBack={goBack} />
      )}
      {page === 'review' && <Review onBack={goBack} />}
      {page === 'game' && <Game onBack={goBack} />}
      {page === 'usersetup' && (
        <UserSetup onBack={goBack} onSelectUser={handleSelectUser} />
      )}
    </div>
  );
}
