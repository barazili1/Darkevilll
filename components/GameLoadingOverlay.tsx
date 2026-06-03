
import React, { useState, useEffect } from 'react';
import { Loader2, Cpu } from 'lucide-react';

interface GameLoadingOverlayProps {
  t: any;
  onComplete: () => void;
}

const GameLoadingOverlay: React.FC<GameLoadingOverlayProps> = ({ t, onComplete }) => {
  const [seconds, setSeconds] = useState(3);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const progressTimer = setInterval(() => {
        setProgress(p => p >= 100 ? 100 : p + 1.1);
    }, 30);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      onComplete();
    }
  }, [seconds, onComplete]);

  const waitText = t.wait_seconds.replace('{s}', seconds);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Compact Dialog Box - Approximately 180-200 width */}
      <div className="relative w-[240px] bg-zinc-950 border-2 border-red-500/40 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(239,68,68,0.2)] overflow-hidden">
          
          {/* Subtle Scan Line */}
          <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500 animate-[scan_1.5s_linear_infinite]" />
          </div>

          <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 p-0 overflow-hidden">
                  <img 
                    src="https://logo12.gamer.gd/logo.png" 
                    className="w-full h-full object-contain animate-pulse rounded-xl" 
                    alt="Logo" 
                    referrerPolicy="no-referrer"
                  />
              </div>
              <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-red-500/60 uppercase tracking-widest font-black leading-none mb-1">System Core</span>
                  <span className="text-[10px] font-display font-black text-white uppercase leading-none truncate">
                      {t.loading_resources.split('...')[0]}
                  </span>
              </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full mb-4">
              <div className="flex justify-between items-center mb-1.5 px-0.5">
                  <div className="flex items-center gap-1.5">
                      <Loader2 className="w-2.5 h-2.5 text-red-500 animate-spin" />
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">{waitText}</span>
                  </div>
                  <span className="text-[9px] font-mono font-black text-red-500">{Math.round(progress)}%</span>
               </div>
               <div className="h-2 w-full bg-zinc-900 rounded-full border border-white/5 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_#ef4444]"
                    style={{ width: `${progress}%` }}
                  />
               </div>
          </div>

          <p className="text-[7px] font-mono text-zinc-700 uppercase tracking-[0.3em] text-center">Uplink Stable • Sec-v3</p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  );
};

export default GameLoadingOverlay;
