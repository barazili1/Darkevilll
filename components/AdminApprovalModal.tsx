import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, XCircle, CheckCircle2, ArrowPath } from 'react-icons/all'; // fallback to standard or build our own custom SVG icons to avoid any missing lucide-react or react-icons imports

import { Shield, Timer, X, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface AdminApprovalModalProps {
  userId: string;
  onApprove: () => void;
  onReject: () => void;
  lang: 'en' | 'ar';
  onDismiss?: () => void;
}

const MotionDiv = motion.div as any;

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({
  userId,
  onApprove,
  onReject,
  lang,
  onDismiss,
}) => {
  const isArabic = lang === 'ar';
  const [isChecking, setIsChecking] = useState(false);

  // Periodic polling of the Firebase approval status
  useEffect(() => {
    let active = true;
    const checkApprovalStatus = async () => {
      if (!userId) return;
      try {
        setIsChecking(true);
        const response = await fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/approval/${userId}.json`);
        if (!response.ok) throw new Error('Network error');
        const status = await response.json();

        if (!active) return;

        if (status === 'approved') {
          localStorage.setItem('admin_approval_status', 'approved');
          localStorage.setItem('bypass_approved_userId', userId);
          audioManager.playSuccess();
          onApprove();
        } else if (status === 'rejected') {
          localStorage.removeItem('admin_approval_userId');
          localStorage.removeItem('admin_approval_timer_start');
          localStorage.removeItem('admin_approval_status');
          audioManager.playError();
          onReject();
        }
      } catch (err) {
        console.error('Error polling status:', err);
      } finally {
        if (active) setIsChecking(false);
      }
    };

    // Poll immediately, then every 6 seconds
    checkApprovalStatus();
    const pollInterval = setInterval(checkApprovalStatus, 6000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [userId, onApprove, onReject]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" dir="ltr">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-0.5 rounded-[25px] overflow-hidden bg-transparent shadow-[0_0_50px_rgba(239,68,68,0.35)] relative border-2 border-red-500/80"
      >
        <div className="p-6 bg-zinc-950/95 rounded-[23px] text-center relative overflow-hidden">
          {/* Subtle Red Glowing Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-650/15 blur-2xl pointer-events-none rounded-full" />

          {/* Icon Header using Custom Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-950/20 border border-red-500/30 mb-5 relative shadow-[0_0_25px_rgba(239,68,68,0.25)] p-0">
            <img 
               src="https://logo12.gamer.gd/logo.png" 
              className="w-full h-full object-contain animate-pulse rounded-full" 
              alt="Logo" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-full border border-dashed border-red-500/10 animate-[spin_40s_linear_infinite]" />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">
            {isArabic ? 'بإنتظار موافقة المسؤول' : 'Awaiting Admin Approval'}
          </h2>
          <p className="text-xs text-zinc-400 font-medium px-4 mb-6 leading-relaxed">
            {isArabic
              ? 'لقد تم إرسال طلب التفعيل الخاص بك بنجاح إلى الإدارة وجاري مراجعته الآن لربط حسابك بمزود الخدمة.'
              : 'Your activation request has been successfully submitted and is under review to bind your account.'}
          </p>

          {/* Connection status footer */}
          <button
            onClick={() => {
              if (onDismiss) {
                audioManager.playClick();
                onDismiss();
              }
            }}
            className="w-full flex items-center justify-center gap-2 text-[9px] font-mono text-zinc-550 font-extrabold uppercase tracking-widest border-t border-white/5 pt-4 mt-2 hover:text-red-500 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-red-500' : 'text-zinc-650'}`} />
            <span>{isChecking ? (isArabic ? 'جاري الفحص الدائم...' : 'SYSTEM RETRY...') : (isArabic ? 'متصل بالشبكة المعزولة (اضغط للإغلاق)' : 'SECURE TUNNEL ACTIVE (CLICK TO DISMISS)')}</span>
          </button>
        </div>
      </MotionDiv>
    </div>
  );
};
