import React, { useState, useEffect } from 'react';
import { Shield, Check, X, RefreshCw, LogOut, Eye, Trash2 } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface PendingRequest {
  userId: string;
  screenshot: string;
  profileScreenshot: string;
  createdAt: number;
}

interface AdminViewProps {
  onLogout: () => void;
  lang: 'en' | 'ar';
}

export const AdminView: React.FC<AdminViewProps> = ({ onLogout, lang }) => {
  const isArabic = lang === 'ar';
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('https://shopping-ca5f4-default-rtdb.firebaseio.com/pics.json');
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();

      if (!data) {
        setRequests([]);
        return;
      }

      // Format data from record of record into array
      const formatted: PendingRequest[] = Object.keys(data).map((key) => ({
        userId: key,
        screenshot: data[key].screenshot || '',
        profileScreenshot: data[key].profileScreenshot || '',
        createdAt: data[key].createdAt || Date.now(),
      }));

      // Sort by createdAt descending
      formatted.sort((a, b) => b.createdAt - a.createdAt);
      setRequests(formatted);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      setSubmittingId(userId);
      audioManager.playClick();

      // Write approval status to Firebase
      const approvalUrl = `https://shopping-ca5f4-default-rtdb.firebaseio.com/approval/${userId}.json`;
      const putRes = await fetch(approvalUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      });

      if (!putRes.ok) throw new Error(`Failed to write approval status ${status}`);

      // Delete the pictures from Firebase to save storage and respect request
      const deleteUrl = `https://shopping-ca5f4-default-rtdb.firebaseio.com/pics/${userId}.json`;
      const delRes = await fetch(deleteUrl, { method: 'DELETE' });
      if (!delRes.ok) throw new Error('Failed to delete pending pictures');

      if (status === 'approved') {
        audioManager.playSuccess();
      } else {
        audioManager.playError();
      }

      // Remove from list
      setRequests((prev) => prev.filter((r) => r.userId !== userId));
    } catch (err) {
      console.error('Action error:', err);
      alert(isArabic ? 'حدث خطأ أثناء تنفيذ الإجراء' : 'An error occurred during execution');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030304] text-white p-6 overflow-y-auto" dir="ltr">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-red-500/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/20 border-2 border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-display font-black tracking-wide leading-none uppercase">
              {isArabic ? 'لوحة تحكم المسؤول' : 'ADMIN CONTROL CENTER'}
            </h1>
            <span className="text-[9px] font-mono font-black text-red-500 uppercase tracking-widest block mt-0.5">
              DATABASE: PICS TERMINAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { audioManager.playClick(); fetchRequests(); }}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/45 transition-colors disabled:opacity-40"
            title={isArabic ? 'تحديث البيانات' : 'Refresh database'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-500' : 'text-zinc-400'}`} />
          </button>
          
          <button
            onClick={() => { audioManager.playClick(); onLogout(); }}
            className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/20 hover:border-red-500/80 hover:bg-red-900/30 text-red-400 transition-colors flex items-center gap-2 text-xs font-mono font-black uppercase"
          >
            <LogOut className="w-4 h-4" />
            <span>{isArabic ? 'خروج' : 'EXIT'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-9 h-9 animate-spin text-red-500" />
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              {isArabic ? 'جاري تحميل الطلبات...' : 'FETCHING DATA NODES...'}
            </span>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-zinc-900/50 bg-black/30 rounded-2xl p-6 text-center">
            <Shield className="w-8 h-8 text-zinc-700 mb-3" />
            <h2 className="text-sm font-black text-zinc-300 uppercase mb-1">
              {isArabic ? 'لا توجد طلبات معلقة' : 'NO PENDING REQUESTS'}
            </h2>
            <p className="text-[11px] text-zinc-550 max-w-xs font-medium leading-normal block">
              {isArabic
                ? 'جميع الحسابات والاتصالات تحت السيطرة الكاملة حالياً.'
                : 'All incoming uplinks and connection vectors are accounted for.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.userId}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-between gap-4"
              >
                {/* ID Header Section */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">USER ID:</span>
                    <span className="text-sm font-mono font-black text-red-500 tracking-wider">
                      {req.userId}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600 font-medium">
                    {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Submited screenshot preview row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[8px] font-mono text-zinc-500 font-bold uppercase mb-1">
                      {isArabic ? 'إيصال الإيداع' : 'DEPOSIT SLIP'}
                    </span>
                    <div
                      className="relative h-32 rounded-xl overflow-hidden bg-black border border-white/10 group cursor-pointer"
                      onClick={() => setSelectedImg(req.screenshot)}
                    >
                      {req.screenshot ? (
                        <>
                          <img src={req.screenshot} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="deposit" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-mono">NO IMAGE</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[8px] font-mono text-zinc-500 font-bold uppercase mb-1">
                      {isArabic ? 'لقطة الحساب' : 'PROFILE SUMMARY'}
                    </span>
                    <div
                      className="relative h-32 rounded-xl overflow-hidden bg-black border border-white/10 group cursor-pointer"
                      onClick={() => setSelectedImg(req.profileScreenshot)}
                    >
                      {req.profileScreenshot ? (
                        <>
                          <img src={req.profileScreenshot} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="profile" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-mono font-bold">NO IMAGE</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dynamic Controls Bottom */}
                <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-white/5 mt-1">
                  <button
                    disabled={submittingId !== null}
                    onClick={() => handleAction(req.userId, 'approved')}
                    className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-display text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/20 disabled:opacity-40"
                  >
                    {submittingId === req.userId ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5px]" />
                        <span>{isArabic ? 'قبول وتفعيل' : 'ACCEPT'}</span>
                      </>
                    )}
                  </button>

                  <button
                    disabled={submittingId !== null}
                    onClick={() => handleAction(req.userId, 'rejected')}
                    className="h-10 rounded-xl bg-red-650 hover:bg-red-600 text-white font-black font-display text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-red-950/20 disabled:opacity-40"
                  >
                    {submittingId === req.userId ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 stroke-[2.5px]" />
                        <span>{isArabic ? 'رفض الطلب' : 'REJECT'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal Overlay */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedImg(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-405 hover:text-white" onClick={() => setSelectedImg(null)}>
            <X className="w-5 h-5" />
          </button>
          <img src={selectedImg} className="max-w-full max-h-[85vh] rounded-xl object-contain border border-white/10" alt="zoom-view" />
        </div>
      )}
    </div>
  );
};
