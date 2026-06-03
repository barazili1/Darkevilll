
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, XCircle } from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import { Language } from '../types';

const MotionDiv = motion.div as any;

interface GridProps {
  path: number[]; 
  isAnalyzing: boolean;
  predictionId?: string;
  onCellClick?: (rowIndex: number, colIndex: number) => void;
  rowCount: number;
  difficulty: string;
  revealRotten?: boolean;
  gridData?: boolean[][]; 
  language: Language;
  t: any;
}

const COLS = 5;

const ODDS_MAP = [
  "1.23", "1.54", "1.93", "2.41", "4.02", 
  "6.71", "11.18", "27.96", "69.91", "349.54",
  "x500", "x1k", "x2.5k", "x5k", "MAX"
];

const COL_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const AppleGrid: React.FC<GridProps> = ({ 
  path, 
  isAnalyzing, 
  predictionId, 
  rowCount,
  difficulty,
  revealRotten = false,
  gridData,
  language,
  t
}) => {
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  
  const renderRowIndices = useMemo(() => {
    return Array.from({ length: rowCount }, (_, i) => rowCount - 1 - i);
  }, [rowCount]);

  const isFailure = !isAnalyzing && predictionId && (path.length === 0 || path.every(v => v === -1));
  const isSuccess = !isAnalyzing && predictionId && !isFailure;

  useEffect(() => {
      if (isSuccess) {
          setShowSuccessFlash(true);
          const timer = setTimeout(() => setShowSuccessFlash(false), 1500);
          return () => clearTimeout(timer);
      }
  }, [predictionId, isSuccess]);

  const boardLayout = useMemo(() => {
    if (!predictionId) return null;

    return Array.from({ length: rowCount }).map((_, rowIndex) => {
        const safeColIndex = path[rowIndex] !== undefined ? path[rowIndex] : -1;
        
        if (safeColIndex === -1 && !gridData) {
             return Array(COLS).fill('unknown');
        }

        if (gridData && gridData[rowIndex]) {
            const realRow = gridData[rowIndex];
            return realRow.map((isSafe, colIndex) => {
                if (colIndex === safeColIndex) return 'path';
                return isSafe ? 'good' : 'bad';
            });
        }

        const badAppleCounts = Array.from({ length: 15 }, (_, i) => {
            const level = i + 1;
            if (level <= 4) return 1;
            if (level <= 7) return 2;
            if (level <= 9) return 3;
            return 4;
        });

        const numBad = badAppleCounts[rowIndex];
        const indices = Array.from({ length: COLS }, (_, i) => i);
        const potentialBadIndices = indices.filter(i => i !== safeColIndex);
        
        for (let i = potentialBadIndices.length - 1; i > 0; i--) {
             const j = Math.floor(Math.random() * (i + 1));
             [potentialBadIndices[i], potentialBadIndices[j]] = [potentialBadIndices[j], potentialBadIndices[i]];
        }

        const badIndices = potentialBadIndices.slice(0, numBad);
        
        return indices.map(colIndex => {
            if (colIndex === safeColIndex) return 'path';
            if (badIndices.includes(colIndex)) return 'bad';
            return 'good';
        });
    });
  }, [predictionId, path, rowCount, gridData, difficulty]);

  const getExtraVisibleIndex = (rowIndex: number, layoutRow: string[]) => {
      const goodIndices = layoutRow.map((type, idx) => type === 'good' ? idx : -1).filter(idx => idx !== -1);
      if (goodIndices.length === 0) return -1;
      return goodIndices[(rowIndex * 7 + 3) % goodIndices.length];
  };

  return (
    <div className="relative w-full mx-auto">
      <div className={`flex flex-col gap-1.5 p-4 relative z-10 transition-all duration-700 ${showSuccessFlash ? 'scale-[1.01]' : ''}`}>
        
        <div className="flex items-center gap-3 mb-2 pb-2 border-b border-white/5 opacity-40">
            <div className="w-14 shrink-0" />
            <div className="grid grid-cols-5 gap-2 flex-1">
                {COL_LETTERS.map(l => (
                    <div key={l} className="text-center">
                        <span className="text-[8px] font-black text-zinc-500 font-mono tracking-widest">{l}</span>
                    </div>
                ))}
            </div>
        </div>

        {renderRowIndices.map((rowIndex) => {
          const currentOdd = ODDS_MAP[rowIndex] || "MAX";
          const hasSelection = path[rowIndex] !== undefined && path[rowIndex] !== -1;
          const showResult = (hasSelection || (path.length > 0 && path[0] !== -1)) && !isAnalyzing && boardLayout;
          
          let layoutRow: string[] = [];
          let extraVisibleIndex = -1;

          if (showResult && boardLayout && boardLayout[rowIndex]) {
              layoutRow = boardLayout[rowIndex];
              if (difficulty === 'Medium') extraVisibleIndex = getExtraVisibleIndex(rowIndex, layoutRow);
          }

          return (
            <div key={`row-${rowIndex}`} className="flex items-center gap-3 group/row">
               <div className="w-14 select-none shrink-0 text-center flex items-center justify-center">
                  <div className={`w-full py-1 rounded-[25px] border transition-all duration-500 flex items-center justify-center ${
                    showResult 
                      ? 'border-red-500 bg-red-950/40 text-red-400 font-bold shadow-[0_0_10px_rgba(239,68,68,0.25)]' 
                      : 'border-red-500/25 bg-black/45 text-zinc-400'
                  }`}>
                    <span className="font-mono text-[9px] font-black tracking-normal leading-none">
                      {currentOdd}
                    </span>
                  </div>
               </div>

              <div className="grid grid-cols-5 gap-2 flex-1">
                {Array.from({ length: COLS }).map((_, colIndex) => {
                  let cellType = 'unknown';
                  if (showResult && layoutRow.length > 0) cellType = layoutRow[colIndex];

                  const isPath = cellType === 'path';
                  const isBad = cellType === 'bad';
                  const isGood = cellType === 'good';
                  
                  let isVisible = !!showResult;

                  return (
                    <MotionDiv
                      key={`cell-${rowIndex}-${colIndex}`}
                      whileHover={!isAnalyzing && (isVisible || !showResult) ? { scale: 1.05, zIndex: 20 } : {}}
                      onMouseEnter={() => !isAnalyzing && audioManager.playSoftClick()}
                      className={`
                        aspect-square rounded-full flex items-center justify-center relative overflow-hidden border transition-all duration-300
                        ${(isVisible && showResult)
                          ? (isPath
                              ? 'bg-emerald-600/35 border-emerald-500 shadow-[inset_0_0_12px_rgba(16,185,129,0.3)]'
                              : isBad 
                                ? 'bg-red-950/30 border-red-500/50 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]' 
                                : 'bg-zinc-950/60 border-white/10')
                          : 'bg-[#08080c]/50 border-white/5 hover:border-white/10'}
                      `}
                    >
                      <span className="absolute top-1 left-1 text-[5px] font-mono text-zinc-800 opacity-50 select-none">
                        [{String(rowIndex + 1).padStart(2, '0')}-{COL_LETTERS[colIndex]}]
                      </span>

                      {(isVisible && showResult) ? (
                         <MotionDiv
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.35, ease: "easeOut", delay: rowIndex * 0.06 }}
                          className="w-full h-full flex items-center justify-center relative rounded-full overflow-hidden"
                         >
                           {isPath && (
                               <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
                                   <img 
                                        src="https://video11.rf.gd/apple.png" 
                                        alt="Healthy Apple" 
                                        className="w-full h-full object-cover rounded-full p-[1px]"
                                        referrerPolicy="no-referrer"
                                   />
                                   <div className="absolute inset-0 border-2 border-emerald-500 rounded-full pointer-events-none animate-none" />
                               </div>
                           )}
                           
                           {isGood && (
                               <div className="w-full h-full flex items-center justify-center">
                                   <img 
                                        src="https://video11.rf.gd/apple.png" 
                                        alt="Healthy Apple" 
                                        className="w-full h-full object-cover rounded-full p-[1px] opacity-95"
                                        referrerPolicy="no-referrer"
                                   />
                               </div>
                           )}

                           {isBad && (
                               <div className="w-full h-full flex items-center justify-center">
                                   <img 
                                        src="https://video11.rf.gd/poi.png" 
                                        alt="Rotten Apple" 
                                        className="w-full h-full object-cover rounded-full p-[1px]"
                                        referrerPolicy="no-referrer"
                                   />
                               </div>
                           )}
                         </MotionDiv>
                      ) : (
                        <div className={`w-0.5 h-0.5 rounded-full transition-all duration-1000 ${isAnalyzing ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse' : 'bg-zinc-900 opacity-30'}`} />
                      )}
                    </MotionDiv>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
           {isFailure && (
             <MotionDiv 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl rounded-xl p-8 text-center"
             >
                 <div className="relative p-6 mb-6">
                     <XCircle className="w-16 h-16 text-red-500 relative z-10" />
                     <div className="absolute inset-0 bg-red-500/30 blur-3xl animate-pulse" />
                 </div>
                 <h3 className="text-xl font-black text-white tracking-[0.3em] uppercase mb-2">{t.matrixFailure}</h3>
                 <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed mb-6">
                     {t.matrixFailureMsg}
                 </p>
                 <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-lg">{t.retrySync}</button>
             </MotionDiv>
           )}
      </AnimatePresence>
    </div>
  );
};
