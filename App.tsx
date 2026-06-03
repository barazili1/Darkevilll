
import React, { useState, useEffect } from 'react';
import { Info, Globe, X, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import PlatformSelection from './components/PlatformSelection';
import SettingsView from './components/SettingsView';
import RulesModal from './components/RulesModal';
import GameLoadingOverlay from './components/GameLoadingOverlay';
import { AppleGameView } from './components/AppleGameView';
import { AdminView } from './components/AdminView';
import { AdminApprovalModal } from './components/AdminApprovalModal';
import { ViewState, Platform, GameType } from './types';
import { translations, Language } from './utils/translations';
import { audioManager } from './utils/audioManager';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('splash');
  const [activeTab, setActiveTab] = useState<'info' | 'conditions' | 'platform'>('platform');
  const [lang, setLang] = useState<Language>('en');
  const [userId, setUserId] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('linebet');
  const [selectedGame, setSelectedGame] = useState<GameType>('apple');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [approvalPending, setApprovalPending] = useState(false);

  useEffect(() => {
    // Only prefill userId from storage, but do not bypass the splash/selection screens on page reload
    const approvedUser = localStorage.getItem('bypass_approved_userId');
    const pendingUser = localStorage.getItem('admin_approval_userId');

    if (approvedUser) {
      setUserId(approvedUser);
    } else if (pendingUser) {
      setUserId(pendingUser);
    }
  }, []);

  const rawT = translations[lang];
  
  const processTranslations = (obj: any): any => {
    const platformName = selectedPlatform === '1xbet' ? '1xBet' : 'Linebet';
    const newT: any = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        newT[key] = obj[key].replace(/1xBet/gi, platformName);
      } else {
        newT[key] = obj[key];
      }
    }
    return newT;
  };

  const t = processTranslations(rawT);
  const isArabic = lang === 'ar';

  useEffect(() => {
    const initAudio = () => {
        audioManager.resume();
        document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const handleSplashComplete = () => {
    // Always start from platform selection on first-time entry loading
    setView('platform_selection');
    setActiveTab('platform');
  };

  const handlePlatformSelect = (p: Platform) => {
    setSelectedPlatform(p);
    setView('settings');
    setActiveTab('conditions');
  };

  const handleConditionsSubmit = (id: string, bypass: boolean = false) => {
    if (id === "000999000") {
      setUserId(id);
      setView('admin');
      return;
    }
    setUserId(id);
    if (bypass) {
      setSelectedGame('apple');
      setView('info');
      setActiveTab('info');
      setIsGameLoading(true);
    } else {
      setApprovalPending(true);
    }
  };

  const handleApprovalSuccess = () => {
    setApprovalPending(false);
    setSelectedGame('apple');
    setView('info');
    setActiveTab('info');
    setIsGameLoading(true);
  };

  const handleApprovalRejected = () => {
    setApprovalPending(false);
    setUserId('');
    setView('settings');
    setActiveTab('conditions');
  };

  const handleApprovalDismiss = () => {
    setApprovalPending(false);
    setView('settings');
    setActiveTab('conditions');
  };

  const handleAdminLogout = () => {
    setView('platform_selection');
    setActiveTab('platform');
    setUserId('');
  };

  const handleGameSelect = (game: GameType) => {
    setSelectedGame(game);
    setView('info');
    setActiveTab('info');
    setIsGameLoading(true);
  };

  const onGameLoadingComplete = () => {
    setIsGameLoading(false);
  };

  const handleBack = () => {
    audioManager.playClick();
    if (view === 'settings') {
      setView('platform_selection');
      setActiveTab('platform');
    } else if (view === 'info') {
      setView('settings');
      setActiveTab('conditions');
    }
  };
  
  const toggleLanguage = (l: Language) => {
      audioManager.playClick();
      setLang(l);
      setIsLangMenuOpen(false);
  }

  const renderContent = () => {
    if (view === 'admin') {
      return <AdminView onLogout={handleAdminLogout} lang={lang} />;
    }

    if (view === 'platform_selection') {
      return <PlatformSelection onSelect={handlePlatformSelect} t={t} />;
    }

    if (view === 'info') {
      return <AppleGameView language={lang} t={t} userId={userId} platform={selectedPlatform} />;
    }

    switch (activeTab) {
      case 'conditions':
        return <SettingsView onComplete={handleConditionsSubmit} lang={lang} t={t} platform={selectedPlatform} />;
      default:
        return <PlatformSelection onSelect={handlePlatformSelect} t={t} />;
    }
  };

  return (
    <div dir="ltr" className={isArabic ? 'font-arabic' : 'font-sans'}>
      {view === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
      
      {isGameLoading && <GameLoadingOverlay t={t} onComplete={onGameLoadingComplete} />}

      <div 
        className={`fixed inset-0 bg-black text-white flex flex-col transition-opacity duration-1000 ${view === 'splash' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <video 
                src="https://www.image2url.com/r2/default/videos/1780430955803-dd8e67dd-8b65-447a-80a3-d4e3332c5eee.mp4"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
                autoPlay
                loop
                muted
                playsInline
            />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-905/10 to-transparent" />
        </div>
        <header className="px-6 py-4 flex items-center justify-between border-b border-red-500/10 bg-black/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            {view !== 'platform_selection' && view !== 'admin' && (
              <button 
                onClick={handleBack}
                className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-red-500/50 hover:text-red-500 transition-all group active:scale-90"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <img 
                src="https://logo12.gamer.gd/logo.png" 
                alt="Logo" 
                className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-black text-xl tracking-tight text-white uppercase select-none">
                DARK <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">EVIL</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => { audioManager.playClick(); setIsLangMenuOpen(!isLangMenuOpen); }}
                  className={`flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-lg bg-zinc-950 border transition-all duration-200 group ${isLangMenuOpen ? 'border-red-500 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                >
                    <span className="text-xs">{lang === 'en' ? '🇬🇧' : '🇸🇦'}</span>
                    <span className="text-[10px] font-black font-mono tracking-widest">{lang === 'en' ? 'EN' : 'AR'}</span>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isLangMenuOpen ? 'rotate-180 text-red-500' : ''}`} />
                </button>

                {isLangMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => { audioManager.playClick(); setIsLangMenuOpen(false); }} />
                    <div className="absolute top-full mt-2 w-36 bg-zinc-950 border border-red-500/20 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.15)] overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200 right-0">
                       <div className="p-1 space-y-0.5">
                          <button
                            onClick={() => toggleLanguage('en')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${lang === 'en' ? 'bg-red-500/10 text-red-500 font-extrabold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                          >
                             <span className="text-xs">🇬🇧</span>
                             <span className="text-[10px] font-black font-display tracking-widest uppercase">ENGLISH</span>
                          </button>
                          
                          <button
                            onClick={() => toggleLanguage('ar')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${lang === 'ar' ? 'bg-red-500/10 text-red-500 font-extrabold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                          >
                             <span className="text-xs">🇸🇦</span>
                             <span className="text-[10px] font-black font-display tracking-widest uppercase">العربية</span>
                          </button>
                       </div>
                    </div>
                  </>
                )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none" 
              style={{ 
                  backgroundImage: 'linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)', 
                  backgroundSize: '40px 40px'
              }} 
            />
            <div className="h-full w-full max-w-lg mx-auto relative z-10">
                {renderContent()}
            </div>
        </main>

        {showInfoModal && <RulesModal onClose={() => { audioManager.playClick(); setShowInfoModal(false); }} lang={lang} t={t} />}
        {approvalPending && (
          <AdminApprovalModal
            userId={userId}
            lang={lang}
            onApprove={handleApprovalSuccess}
            onReject={handleApprovalRejected}
            onDismiss={handleApprovalDismiss}
          />
        )}
      </div>
    </div>
  );
};

export default App;
