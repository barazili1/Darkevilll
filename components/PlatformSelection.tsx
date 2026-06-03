import React, { useState, useEffect, useRef } from 'react';
import { Platform } from '../types';
import { Check, ChevronRight, Binary, Hexagon, Database, Lock, Loader2, Terminal, ShieldAlert, Cpu, Copy } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface PlatformSelectionProps {
  onSelect: (platform: Platform) => void;
  t: any;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

const PlatformSelection: React.FC<PlatformSelectionProps> = ({ onSelect, t }) => {
  const [selected, setSelected] = useState<Platform>('linebet');
  const [isConnecting, setIsConnecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("H2000");
    setCopied(true);
    audioManager.playClick();
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Only linebet remains block as requested
  const platforms = [
    {
      id: 'linebet' as Platform,
      name: 'Linebet',
      img: 'https://image2url.com/images/1766063887850-97673d7d-b0b6-491f-872a-4fd7b71d4a72.jpeg',
      tagline: 'SECURE CORE: BRAVO-4',
      status: 'ENCRYPTED',
      latency: '15ms',
      integrity: '99.9%',
      packets: '228.4 KB/s'
    }
  ];

  const isArabic = t.system_active === "النظام نشط";

  const statusSteps = isArabic ? [
    "جاري تأسيس خادم الاتصال الرئيسي",
    "تجاوز بوابة حماية Linebet",
    "تثبيت النص البرمجي التنبؤي",
    "تم تشفير الاتصال بالكامل"
  ] : [
    "Establishing Uplink Server",
    "Bypassing Linebet Gateway",
    "Deploying Predictive Script",
    "Quantum Cipher Established"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for(let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for(let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.fillStyle = `rgba(239, 68, 68, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Removed automatic transition timer to allow manual 'Start Now' action by user

  const handleProceed = () => {
    audioManager.playClick();
    setIsConnecting(true);
  };

  return (
    <div className="flex flex-col h-full px-6 pt-10 pb-8 overflow-y-auto custom-scrollbar relative bg-transparent font-sans">
      {/* Header */}
      <div className="text-center mb-8 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/30 border border-red-500/20 mb-3">
           <Binary className="w-3 h-3 text-red-500 animate-pulse" />
           <span className={`font-black uppercase ${isArabic ? 'text-[10px] font-sans tracking-[0.1em]' : 'text-[8px] font-mono tracking-[0.3em]'}`}>
             {isArabic ? "مسار آمن ومعزول" : "TUNNEL: SHIELDED BYPASS"}
           </span>
         </div>
        
        <h2 className="text-3xl font-display font-black text-white tracking-tight mb-1.5 uppercase">
          {isArabic ? "اختر " : "CHOOSE "}<span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">{isArabic ? "المنصة" : "GATEWAY"}</span>
        </h2>
        <p className={`font-black uppercase ${isArabic ? 'text-[11px] font-sans tracking-[0.1em]' : 'text-[8px] font-mono tracking-[0.3em]'}`}>
          {isArabic ? "حدد العقدة النشطة للحقن" : "Select active node for injection"}
        </p>
      </div>

      {/* Node Selection - Shrunk and Optimized container as requested */}
      <div className="relative z-10 mb-6 flex-1 flex flex-col justify-center items-center">
        {platforms.map((p, idx) => (
          <button 
            key={p.id}
            onClick={() => { audioManager.playClick(); }}
            disabled={isConnecting}
            className="group relative w-full max-w-[280px] rounded-[2rem] transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 fill-mode-both overflow-hidden cursor-default"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b10] to-[#050508] transition-all duration-700" />
            <div className="absolute inset-0 border border-red-500/30 rounded-[2rem] shadow-[0_0_30px_rgba(239,68,68,0.1)] group-hover:border-red-500/70 transition-all duration-500" />

            {/* Glass glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

            <div className="relative z-10 flex flex-col p-5 items-center text-center">
              {/* Giant Round Premium Avatar for Platform - Shrunk from w-28 h-28 */}
              <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden border border-red-500/30 p-[2px] flex items-center justify-center bg-[#050507]">
                 <div className="absolute inset-0 bg-gradient-to-tr from-red-650/20 to-transparent animate-spin-slow"></div>
                 <img src={p.img} alt={p.name} className="w-full h-full object-cover rounded-full" />
              </div>

              {/* Text Info */}
              <div className="w-full">
                <h3 className="text-xl font-display font-black tracking-tight text-white mb-1 flex items-center justify-center gap-1.5 uppercase">
                  {p.name}
                  <Hexagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                </h3>
                
                <p className="text-[8px] font-mono text-zinc-500 tracking-[0.15em] uppercase font-bold mb-4">{p.tagline}</p>
                
                {/* Tech stats metrics to make it look incredibly cool */}
                <div className="grid grid-cols-3 gap-1.5 p-3 bg-black/50 rounded-xl border border-white/5 font-mono text-[8px]">
                   <div className="flex flex-col items-center border-r border-white/5">
                      <span className={`text-zinc-650 uppercase tracking-wider font-black mb-0.5 ${isArabic ? 'text-[9.5px]' : 'text-[6px]'}`}>
                        {isArabic ? "الاستجابة" : "LATENCY"}
                      </span>
                      <span className="text-red-500 font-black">{p.latency}</span>
                   </div>
                   <div className="flex flex-col items-center border-r border-white/5">
                      <span className={`text-zinc-650 uppercase tracking-wider font-black mb-0.5 ${isArabic ? 'text-[9.5px]' : 'text-[6px]'}`}>
                        {isArabic ? "السلامة" : "INTEGRITY"}
                      </span>
                      <span className="text-white font-black">{p.integrity}</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className={`text-zinc-650 uppercase tracking-wider font-black mb-0.5 ${isArabic ? 'text-[9.5px]' : 'text-[6px]'}`}>
                        {isArabic ? "النطاق" : "PACKETS"}
                      </span>
                      <span className="text-white font-black">{p.packets}</span>
                   </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto relative z-10 w-full max-w-[280px] mx-auto">
        <div className="flex items-center gap-3 mb-4 bg-[#060609]/80 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
           <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-red-500/20">
              <Database className="w-3.5 h-3.5 text-red-500" />
           </div>
           <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                 <span className={`block truncate text-zinc-500 uppercase font-black ${isArabic ? 'text-[10px] font-sans' : 'text-[7px] font-mono tracking-widest'}`}>
                   {isArabic ? "قنوات الاتصال المفرزة" : "UPLINK CHANNELS ACTIVE"}
                 </span>
                 <span className={`shrink-0 text-red-500 uppercase font-black ${isArabic ? 'text-[10px] font-sans' : 'text-[7px] font-mono'}`}>
                   {isArabic ? "مشفر" : "LINEBET SECURE"}
                 </span>
              </div>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden p-[1px]">
                 <div className="h-full w-full bg-red-650 rounded-full animate-pulse shadow-[0_0_8px_#dc2626]"></div>
              </div>
           </div>
        </div>

        {/* Premium cyber-designed action button - smaller, glass-bordered and highly aesthetic */}
        <button 
          onClick={handleProceed}
          disabled={isConnecting}
          className="relative w-full h-14 rounded-2xl bg-gradient-to-r from-red-950/20 via-[#0a0a0f] to-red-950/20 border border-red-500/40 text-white font-black font-display text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2.5 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.12)] hover:bg-[#07070a] hover:border-red-550 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
        >
          {/* Neon micro glow sidebar accents */}
          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-red-550 to-transparent" />
          <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-t from-red-550 to-transparent" />

          <span className={`drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] ${isArabic ? 'text-[14px] font-sans' : 'text-xs'}`}>
            {isArabic ? "اختيار المنصة" : "LOGIN SECURELY"}
          </span>
          <ChevronRight className="w-4 h-4 text-red-550 animate-pulse" />
        </button>
      </div>

      {/* PREMIUM CYBER CONNECTION LOADER */}
      {isConnecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500 p-6" dir="ltr">
           <div className="relative w-full max-w-sm flex flex-col items-center">
              
              <div className="w-full bg-[#07070a] border border-red-500/30 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(239,68,68,0.2)] relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(127,29,29,0.08)_0%,_transparent_70%)] pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                   <div className="w-10 h-10 rounded-xl bg-[#09090d] border border-red-550/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0">
                      <Terminal className="w-5 h-5 text-red-500" />
                   </div>
                   <div className="text-left">
                     <h3 className="text-base font-display font-black text-white uppercase tracking-tight">
                       {isArabic ? "خطوات التنشيط والتفعيل" : "ACTIVATION STEPS"}
                     </h3>
                     <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                       {isArabic ? "يرجى اتباع التعليمات بدقة" : "FOLLOW INSTRUCTIONS CAREFULLY"}
                     </p>
                   </div>
                </div>

                {/* Requirements / Instruction List */}
                <div className="space-y-4 mb-8">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-950/40 border border-red-500/30 text-red-500 text-xs font-bold font-mono">
                      1
                    </span>
                    <p className={`text-zinc-200 leading-relaxed font-semibold self-center text-left ${isArabic ? 'text-sm font-sans' : 'text-xs'}`}>
                      {isArabic ? "إنشاء حساب جديد تماماً" : "Create a completely new account"}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-950/40 border border-red-500/30 text-red-500 text-xs font-bold font-mono">
                      2
                    </span>
                    <p className={`text-zinc-200 leading-relaxed font-semibold self-center text-left ${isArabic ? 'text-sm font-sans' : 'text-xs'}`}>
                      {isArabic ? "الحد الأدنى للإيداع 200 جنيه أو 5 دولار" : "Minimum required deposit is 200 EGP or 5 USD"}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-950/40 border border-red-500/30 text-red-500 text-xs font-bold font-mono">
                      3
                    </span>
                    <a 
                      href="https://t.me/kdjsksjsy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-[#229ED9] hover:underline leading-relaxed font-semibold self-center text-left ${isArabic ? 'text-sm font-sans' : 'text-xs'}`}
                    >
                      {isArabic ? "الاشتراك في قناة التليجرام الخاصة بنا" : "Subscribe to our Telegram channel"}
                    </a>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-950/40 border border-red-500/30 text-red-500 text-xs font-bold font-mono">
                      4
                    </span>
                    <p className={`text-zinc-200 leading-relaxed font-semibold self-center text-left ${isArabic ? 'text-sm font-sans' : 'text-xs'}`}>
                      {isArabic ? "استخدم البروموكود أدناه للتسجيل" : "Use registration promo code below"}
                    </p>
                  </div>
                </div>

                {/* Promo Code Copy block */}
                <div className="mb-8 p-4 bg-zinc-950/80 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                  <div className="text-left flex flex-col">
                    <span className={`text-zinc-500 uppercase tracking-widest font-black ${isArabic ? 'text-[11px] font-sans' : 'text-[7.5px] font-mono'}`}>
                      {isArabic ? "كود التفعيل والبروموكود" : "PROMOCODE"}
                    </span>
                    <span className="text-xl font-display font-black text-white tracking-widest mt-0.5">
                      H2000
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleCopy}
                    className="h-10 px-4 rounded-xl bg-red-950/25 border border-red-500/30 text-red-500 hover:text-white hover:bg-red-650/40 hover:border-red-500 text-[10px] font-black font-mono tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 animate-pulse" />
                        <span>{isArabic ? "تم النسخ!" : "COPIED"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isArabic ? "نسخ" : "COPY"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Start Button */}
                <button 
                  onClick={() => {
                    audioManager.playClick();
                    onSelect(selected);
                  }}
                  className="relative w-full h-12 rounded-xl bg-gradient-to-r from-red-650 to-red-500 text-white font-black font-display text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:brightness-110 active:scale-[0.98] transition-all duration-300"
                >
                  <span>
                    {isArabic ? "ابدأ الآن" : "START NOW"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
                
              </div>
           </div>
        </div>
      )}

      <style>{`
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PlatformSelection;
