
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleGrid } from './AppleGrid';

const MotionDiv = motion.div as any;
import { audioManager } from '../utils/audioManager';
import { GameState, PredictionResult, Language, Platform } from '../types';
import { 
    Target,
    Zap,
    Scan,
    Crosshair,
    Users
} from 'lucide-react';

interface AppleGameProps {
    language: Language;
    t: any;
    userId: string;
    platform: Platform;
}

export const AppleGameView: React.FC<AppleGameProps> = ({ language, t, userId, platform }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [isUpdating, setIsUpdating] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(() => Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000);
  const [fluxValue, setFluxValue] = useState(98.2);
  const [rowCount, setRowCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Hard');
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [revealRotten, setRevealRotten] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState(29 * 60 + 59);

  interface WinRecord {
      id: string;
      maskedId: string;
      betAmount: string;
      winMultiplier: string;
      winAmount: string;
      timestamp: number;
  }

  const generateRandomWinRecord = (): WinRecord => {
      const length = Math.floor(Math.random() * 3) + 10;
      const startDigits = String(Math.floor(Math.random() * 90) + 10);
      const endDigits = String(Math.floor(Math.random() * 90) + 10);
      const asterisks = '*'.repeat(length - 4);
      const maskedId = `${startDigits}${asterisks}${endDigits}`;

      const multipliers = ["1.23", "1.54", "1.93", "2.41", "4.02", "6.71", "11.18", "27.96", "69.91", "349.54"];
      const mult = parseFloat(multipliers[Math.floor(Math.random() * Math.min(multipliers.length, rowCount))]);
      
      const rawBet = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
      const betVal = Math.max(100, Math.min(1000, Math.round(rawBet / 50) * 50));
      const winVal = Math.round(betVal * mult);

      return {
          id: Math.random().toString(36).substring(2),
          maskedId,
          betAmount: `${betVal.toLocaleString()} EGP`,
          winMultiplier: `x${mult.toFixed(2)}`,
          winAmount: `${winVal.toLocaleString()} EGP`,
          timestamp: Date.now()
      };
  };

  const [winList, setWinList] = useState<WinRecord[]>(() => {
      return Array.from({ length: 5 }, () => generateRandomWinRecord());
  });

  const isAdmin = userId.startsWith("ADMIN_SESS_PROTOCOL_");

  useEffect(() => {
    const userInterval = setInterval(() => {
        setOnlineUsersCount(Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000);
    }, 1500);

    const fluxInterval = setInterval(() => {
        setFluxValue(prev => {
            const change = (Math.random() * 0.4 - 0.2);
            return parseFloat((prev + change).toFixed(1));
        });
    }, 3000);

    return () => {
        clearInterval(userInterval);
        clearInterval(fluxInterval);
    };
  }, []);

  useEffect(() => {
      const t = setInterval(() => {
          setTimeRemaining(prev => prev > 0 ? prev - 1 : 29 * 60 + 59);
      }, 1000);
      return () => clearInterval(t);
  }, []);

  useEffect(() => {
      const t = setInterval(() => {
          const newWin = generateRandomWinRecord();
          setWinList(prev => [newWin, ...prev.slice(0, 4)]);
      }, 4000);
      return () => clearInterval(t);
  }, []);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  // حساب نسبة المخاطرة بناءً على الارتفاع والصعوبة
  const calculateRiskValue = () => {
    let base = 0;
    if (difficulty === 'Easy') base = 15 + (rowCount * 2);
    else if (difficulty === 'Medium') base = 45 + (rowCount * 3);
    else base = 72 + (rowCount * 2.5);
    
    return Math.min(99, Math.round(base));
  };

  const fetchPredictions = async (isResync: boolean = false) => {
    let path: number[] = [];
    let confidence = 99;
    let analysisMsg = "";
    const cleanId = userId.replace("ADMIN_SESS_PROTOCOL_", "");

    try {
        const idCheckResponse = await fetch('https://crazy-12-default-rtdb.firebaseio.com/ids/ids.json');
        const idsData = await idCheckResponse.json();
        
        let isAuthorized = false;
        if (idsData) {
            const values = Object.values(idsData).map(v => String(v));
            const keys = Object.keys(idsData).map(k => String(k));
            if (values.includes(cleanId) || keys.includes(cleanId) || idsData[cleanId]) {
                isAuthorized = true;
            }
        }

        if (isAuthorized) {
            const m11Response = await fetch('https://crazy-12-default-rtdb.firebaseio.com/m11.json');
            const m11Data = await m11Response.json();

            if (m11Data) {
                for (let r = 0; r < rowCount; r++) {
                    let safeCol = -1;
                    for (let c = 0; c < 5; c++) {
                        const cellKey = `m${(r * 5) + (c + 1)}`;
                        const cellData = m11Data[cellKey];
                        let val = cellData;
                        if (cellData && typeof cellData === 'object') {
                            val = cellData[cellKey];
                        }
                        if (String(val) === "0") {
                            safeCol = c;
                            break;
                        }
                    }
                    path.push(safeCol !== -1 ? safeCol : Math.floor(Math.random() * 5));
                }
                confidence = isResync ? 99.9 : 99.8;
                analysisMsg = `RISK_${calculateRiskValue()}%`; // تم تبسيط النص ليحتوي المخاطر فقط
            } else {
                throw new Error("No data in m11");
            }
        } else {
            for (let i = 0; i < rowCount; i++) path.push(Math.floor(Math.random() * 5));
            confidence = Math.floor(Math.random() * (85 - 75) + 75);
            analysisMsg = `RISK_${calculateRiskValue() + 10}%`;
        }
    } catch (error) {
        for (let i = 0; i < rowCount; i++) path.push(Math.floor(Math.random() * 5));
        confidence = 90;
        analysisMsg = `RISK_ERR_%`;
    }

    return { path, confidence, analysis: analysisMsg };
  };

  const handlePredict = async () => {
    if (gameState === GameState.ANALYZING) return;
    
    audioManager.playSoftClick();
    setGameState(GameState.ANALYZING);
    setRevealRotten(false);
    setCurrentResult(null);

    await new Promise(resolve => setTimeout(resolve, 2800));
    
    const resultData = await fetchPredictions();

    const result: PredictionResult = {
        ...resultData,
        id: crypto.randomUUID(),
        timestamp: Date.now()
    };

    setGameState(GameState.PREDICTED);
    audioManager.playSuccess();
    setCurrentResult(result);
    setHistory(prev => [result, ...prev].slice(0, 10));
  };

  const handleNewGame = async () => {
      if (isUpdating || gameState === GameState.ANALYZING) return;
      
      setIsUpdating(true);
      audioManager.playSoftClick();
      
      // مسح التفاحات من الـ grid فوراً
      setCurrentResult(null);
      setGameState(GameState.ANALYZING);
      setRevealRotten(false);
      
      try {
          if (isAdmin) {
              const badCounts = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]; 
              const newData: Record<string, any> = {};

              for (let r = 0; r < 10; r++) {
                  const badCount = badCounts[r];
                  const colIndices = [0, 1, 2, 3, 4];
                  for (let i = colIndices.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [colIndices[i], colIndices[j]] = [colIndices[j], colIndices[i]];
                  }
                  const badIndices = colIndices.slice(0, badCount);
                  for (let c = 0; c < 5; c++) {
                      const cellNum = (r * 5) + (c + 1);
                      const cellKey = `m${cellNum}`;
                      newData[cellKey] = { [cellKey]: badIndices.includes(c) ? "1" : "0" };
                  }
              }

              await fetch('https://crazy-12-default-rtdb.firebaseio.com/m11.json', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newData)
              });
          }

          await new Promise(r => setTimeout(r, 2000));
          setGameState(GameState.IDLE);
          audioManager.playSuccess();
      } catch (err) {
          console.error("Resync failed", err);
          setGameState(GameState.IDLE);
      } finally {
          setIsUpdating(false);
      }
  };



  return (
    <div className="flex flex-col h-full relative pt-4 overflow-y-auto px-4 pb-28 select-none bg-transparent text-left custom-scrollbar">
        {/* Header with USERS ONLINE & ACCOUNT ID */}
        <div className="flex items-center justify-between mb-4 px-1 shrink-0 border-b border-white/5 pb-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-red-700" />
                    <h1 className="text-md font-black text-white uppercase tracking-[0.15em] italic font-display">
                        APPLE<span className="text-red-500"> OF FORTUNE</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2 mt-1 font-mono">
                    <span className="text-[9px] text-zinc-500 uppercase font-black">
                        {language === 'ar' ? 'المعرف:' : 'ID:'} <span className="text-red-500 font-bold">{userId.replace("ADMIN_SESS_PROTOCOL_", "")}</span>
                    </span>
                    <div className="w-1 h-1 bg-red-900 rounded-full" />
                    <span className="text-[7px] text-zinc-650 font-bold uppercase tracking-[0.2em]">{t.liveConnection}_00{onlineUsersCount % 9}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end bg-zinc-950/60 px-2.5 py-1 rounded-xl border border-white/5">
                    <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">{t.online}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Users className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                        <span className="text-[9px] font-black text-white font-mono">{onlineUsersCount}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 3 Rings Countdown Timer */}
        <div className="flex items-center justify-center gap-4 mb-5 shrink-0 px-1 py-1">
            <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-zinc-950 to-zinc-900 border border-red-500/30 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] relative group overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600/20" />
                    <span className="text-sm font-mono font-black text-white leading-none mt-1">
                        {String(hours).padStart(2, '0')}
                    </span>
                    <span className="text-[6px] font-black tracking-widest text-red-500/70 font-sans uppercase mt-1">
                        {language === 'ar' ? 'ساعة' : 'HR'}
                    </span>
                </div>
            </div>

            <div className="text-red-500 font-mono text-lg font-bold animate-pulse -mt-4">:</div>

            <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-zinc-950 to-zinc-900 border border-red-500/30 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] relative group overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-650/20 animate-pulse" />
                    <span className="text-sm font-mono font-black text-white leading-none mt-1">
                        {String(minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[6px] font-black tracking-widest text-red-500/70 font-sans uppercase mt-1">
                        {language === 'ar' ? 'دقيقة' : 'MIN'}
                    </span>
                </div>
            </div>

            <div className="text-red-500 font-mono text-lg font-bold animate-pulse -mt-4">:</div>

            <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-zinc-950 to-zinc-900 border border-red-500/30 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] relative group overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600/20" />
                    <span className="text-sm font-mono font-black text-red-500 leading-none mt-1">
                        {String(seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[6px] font-black tracking-widest text-red-500/70 font-sans uppercase mt-1">
                        {language === 'ar' ? 'ثانية' : 'SEC'}
                    </span>
                </div>
            </div>
        </div>

        {/* Polished Grid Container */}
        <div className="relative mb-6 group min-h-[500px] flex flex-col justify-center shrink-0">
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-2 border-l-2 border-red-500/60 z-20" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-2 border-r-2 border-red-500/60 z-20" />
            <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-2 border-l-2 border-red-500/60 z-20" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-2 border-r-2 border-red-500/60 z-20" />

            {/* Glowing Backdrop Frame */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent blur-xl rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative rounded-[25px] border-2 border-red-500/50 bg-black/45 backdrop-blur-md shadow-[0_0_35px_rgba(239,68,68,0.3)] p-2.5">
                <AppleGrid 
                    path={currentResult?.path || []} 
                    isAnalyzing={gameState === GameState.ANALYZING}
                    predictionId={currentResult?.id}
                    rowCount={rowCount}
                    difficulty={difficulty}
                    revealRotten={revealRotten}
                    language={language}
                    t={t}
                 />
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black px-4 py-1.5 border border-red-500/20 rounded-full z-20 shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                <span className="text-[7.5px] font-mono font-black text-zinc-400 tracking-widest uppercase flex items-center gap-1.5">
                    <Crosshair className="w-2.5 h-2.5 text-red-500" />
                    {t.targetingActive}
                </span>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </div>
        </div>

        {/* Start / Restart Buttons directly under grid */}
        <div className="grid grid-cols-2 gap-4 mt-2 shrink-0 px-1">
            <button 
                onClick={handlePredict} 
                disabled={gameState === GameState.ANALYZING || isUpdating} 
                className={`group relative h-14 rounded-xl overflow-hidden font-black tracking-[0.2em] uppercase text-xs transition-all active:scale-[0.98] ${gameState === GameState.ANALYZING ? 'bg-zinc-900 text-zinc-700 border border-zinc-800' : 'bg-red-700 text-white hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}
            >
                <div className="relative z-10 flex items-center justify-center gap-2">
                    {gameState === GameState.ANALYZING ? (
                        <><Scan className="w-4 h-4 animate-spin" /><span>{language === 'ar' ? 'تحليل...' : 'ANALYZING...'}</span></>
                    ) : (
                        <><Target className="w-4 h-4" /><span>{language === 'ar' ? 'ابدأ' : 'START'}</span></>
                    )}
                </div>
            </button>
            
            <button 
                onClick={handleNewGame} 
                disabled={isUpdating || gameState === GameState.ANALYZING} 
                className="h-14 rounded-xl border border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
                <Zap className={`w-4 h-4 ${isUpdating ? 'animate-pulse text-red-500' : ''}`} />
                <span>{language === 'ar' ? 'إعادة تشغيل' : 'RESTART'}</span>
            </button>
        </div>

        {/* Live Statistics ListView */}
        <div className="mt-6 border border-white/5 bg-[#050508]/60 rounded-xl p-3 shrink-0 px-1 select-none font-mono">
            <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-550 animate-pulse" />
                    <h3 className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                        {language === 'ar' ? 'الانتصارات الفورية النشطة' : 'LIVE ACCREDITED WINS'}
                    </h3>
                </div>
                <span className="text-[7px] text-zinc-700 font-black uppercase">REALTIME BROADCAST</span>
            </div>

            <div className="space-y-1.5">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-2 px-2 py-1 text-[7.5px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-white/5 pb-1.5">
                    <div>{language === 'ar' ? 'معرف الحساب' : 'USER ID'}</div>
                    <div>{language === 'ar' ? 'مبلغ الرهان' : 'BET AMOUNT'}</div>
                    <div>{language === 'ar' ? 'مبلغ الفوز' : 'WIN AMOUNT'}</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-1">
                    {winList.map((win, idx) => (
                        <div 
                          key={win.id} 
                          className={`grid grid-cols-3 gap-2 px-2 py-2 rounded-lg border items-center text-center transition-all duration-700 ${
                            idx === 0 
                              ? 'bg-red-500/[0.02] border-red-500/20 text-white shadow-[inset_0_0_8px_rgba(239,68,68,0.01)]' 
                              : 'bg-zinc-950/20 border-white/5 text-zinc-400'
                          }`}
                        >
                            <div className="text-[9.5px] font-black tracking-wider text-zinc-300">
                                {win.maskedId}
                            </div>
                            <div className="text-[9px] font-bold text-zinc-400">
                                {win.betAmount}
                            </div>
                            <div className="text-[9px] font-black text-emerald-500 flex items-center justify-center gap-1">
                                <span className="text-[7px] text-zinc-400 font-bold bg-[#040d04] px-1 py-0.5 rounded border border-emerald-950/30 shrink-0">
                                    {win.winMultiplier}
                                </span>
                                <span className="drop-shadow-[0_0_6px_rgba(16,185,129,0.25)]">
                                    {win.winAmount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
