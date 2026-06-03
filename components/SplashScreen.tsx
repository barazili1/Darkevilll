import React, { useEffect, useState } from 'react';
import { ShieldAlert, Cpu, Terminal, Eye } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("ESTABLISHING LINK");
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const duration = 3800; 
    const intervalTime = 25;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        
        if (next > 15 && next < 35) setLoadingText("INJECTING BYPASS PROTOCOLS");
        else if (next > 35 && next < 55) setLoadingText("DECRYPTING DATA MATRIX");
        else if (next > 55 && next < 75) setLoadingText("ISOLATING LINEBET CHANNELS");
        else if (next > 75 && next < 92) setLoadingText("SECURING ANONYMOUS VIP TUNNEL");
        else if (next > 92) setLoadingText("ACCESS GRANTED • WELCOME");

        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, duration - 500); 

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (opacity === 0 && progress >= 100) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050507] overflow-hidden transition-opacity duration-500 ease-out font-sans select-none"
      style={{ opacity }}
    >
      {/* Dynamic Cyber-grid background */}
      <div 
        className="absolute inset-0 z-0 opacity-15" 
        style={{ 
             backgroundImage: 'linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)', 
             backgroundSize: '30px 30px',
             maskImage: 'radial-gradient(circle at center, black 30%, transparent 95%)',
             WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 95%)'
        }} 
      />
      
      {/* Dark Ambient Radial Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(127,29,29,0.15)_0%,_transparent_75%)] pointer-events-none"></div>

      {/* Cyberpunk Scanline */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]">
        <div className="w-full h-2 bg-red-600 blur-sm animate-[downscan_3s_linear_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Core Evil Sigil */}
        <div className="relative mb-10 group">
           <div className="absolute inset-0 bg-red-600/10 blur-[80px] rounded-full animate-pulse duration-1000"></div>
           
           <div className="relative w-36 h-36 bg-[#09090d] border border-red-500/20 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.1)] overflow-hidden">
              {/* Spinning technical background element */}
              <div className="absolute inset-2 border-2 border-dashed border-red-500/10 rounded-[2rem] animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-4 border border-zinc-900 rounded-[1.8rem]" />

              {/* Glowing Cyber Eye / Shard replaced with custom Logo */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="relative w-[114px] h-[114px] flex items-center justify-center p-0">
                  <img 
                    src="https://logo12.gamer.gd/logo.png" 
                    className="w-full h-full object-contain animate-[pulse_1.5s_infinite] drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" 
                    alt="Logo" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border border-red-500/40 rounded-full animate-[ping_2s_infinite] scale-75 opacity-10" />
                </div>
              </div>
           </div>
        </div>

        {/* Brand Display */}
        <div className="flex flex-col items-center space-y-3 mb-12">
            <h1 className="text-5xl font-display font-black tracking-[0.1em] text-white flex items-center gap-2">
              <span>DARK</span> 
              <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-[flicker_3s_ease-in-out_infinite]">EVIL</span>
            </h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full"></span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em] font-black">QUANTUM BYPASS INTERFACE</span>
            </div>
            <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        </div>

        {/* Loading Progress Frame */}
        <div className="flex flex-col items-center w-72 bg-[#09090d]/80 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
           <div className="flex justify-between w-full text-[9px] font-mono font-black text-red-500/80 mb-2.5 uppercase tracking-widest px-0.5">
              <span className="truncate max-w-[200px]">{loadingText}</span>
              <span className="font-display font-black text-red-500">{Math.round(progress)}%</span>
           </div>
           
           <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 relative">
              <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent z-20 animate-[shimmer_2s_infinite] skew-x-12"></div>
              <div 
                className="h-full bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_15px_#dc2626] transition-all duration-75 ease-out relative z-10"
                style={{ width: `${progress}%` }}
              />
           </div>
        </div>
      </div>

      {/* Futuristic footer credentials */}
      <div className="absolute bottom-8 flex flex-col items-center space-y-1 opacity-50 font-mono">
        <span className="text-[8px] text-zinc-500 tracking-[0.3em] uppercase">ACCESS GRANTED • LEVEL 7 PROTOCOL</span>
        <span className="text-[7px] text-red-500/60 uppercase">ENCRYPTED DECRYPTION GATE</span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes downscan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
            opacity: 0.99;
          }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
