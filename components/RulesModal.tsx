
import React from 'react';
import { X, Shield, Plane, ExternalLink, Activity, Users } from 'lucide-react';
import { Language } from '../utils/translations';
import { audioManager } from '../utils/audioManager';

interface RulesModalProps {
  onClose: () => void;
  lang: Language;
  t: any;
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose, lang, t }) => {
  const handleClose = () => {
    audioManager.playClick();
    onClose();
  };

  const handleLinkClick = () => {
    audioManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleClose}></div>
      
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 flex items-center justify-center p-0 bg-red-500/10 rounded-md border border-red-500/20 overflow-hidden">
               <img 
                 src="https://logo12.gamer.gd/logo.png" 
                 className="w-full h-full object-contain rounded-md" 
                 alt="Logo" 
                 referrerPolicy="no-referrer"
               />
             </div>
             <h2 className="text-lg font-bold font-display text-white tracking-wide">{t.system_guide}</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
           <div className="space-y-3">
              <h3 className="text-sm font-black italic text-zinc-300 uppercase tracking-widest flex items-center gap-2 font-display">
                <Plane className="w-4 h-4 text-zinc-500" />
                {t.game_mechanics}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                {t.mech_desc}
              </p>
              <div className="bg-zinc-900/30 p-3 rounded-lg border border-white/5 flex gap-4 items-center">
                 <div className="h-8 w-1 bg-red-500 rounded-full shrink-0"></div>
                 <p className="text-xs font-mono text-zinc-300">
                   <strong className="text-white">{t.objective}</strong> {t.obj_desc}
                 </p>
              </div>
           </div>

           <div className="space-y-3">
              <h3 className="text-sm font-black italic text-zinc-300 uppercase tracking-widest flex items-center gap-2 font-display">
                <div className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center text-[10px] font-mono">Z</div>
                {t.system_logic}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                {t.logic_desc}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                 <div className="bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{t.sig_gen}</div>
                    <div className="text-[10px] text-zinc-400 font-mono leading-tight">
                       {t.sig_desc}
                    </div>
                 </div>
                 <div className="bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{t.safe_exit_title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono leading-tight">
                       {t.safe_desc}
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <h3 className="text-sm font-black italic text-zinc-300 uppercase tracking-widest flex items-center gap-2 font-display">
                {t.community_support}
              </h3>
              <a 
                href="https://t.me/IIIIIIIIIIIIIIIIIIIIII00" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-white/5 hover:bg-zinc-800 transition-colors group"
              >
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">{t.official_channel}</span>
                   <span className="text-[10px] text-zinc-500 font-mono">{t.join_updates}</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors shrink-0">
                    <Users className="w-4 h-4 text-red-500" />
                 </div>
              </a>
              <a 
                href="https://t.me/A_1_E_P" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-white/5 hover:bg-zinc-800 transition-colors group"
              >
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{t.dev_contact}</span>
                   <span className="text-[10px] text-zinc-500 font-mono">@A_1_E_P</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shrink-0">
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                 </div>
              </a>
           </div>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-zinc-900/80">
           <button 
             onClick={handleClose}
             className="w-full py-3 bg-white text-black font-bold font-display text-xs rounded-lg hover:bg-zinc-200 transition-colors tracking-widest uppercase"
           >
             {t.acknowledge}
           </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
