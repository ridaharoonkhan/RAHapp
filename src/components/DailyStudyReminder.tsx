import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Volume2,
  X,
  Calendar,
  Flame,
  ArrowRight
} from 'lucide-react';

interface DailyStudyReminderProps {
  onScrollToRoadmap?: () => void;
}

export const DailyStudyReminder: React.FC<DailyStudyReminderProps> = ({ onScrollToRoadmap }) => {
  const { t } = useLanguage();

  // Load initial settings from localStorage
  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('rah_reminder_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('rah_reminder_time') || '18:00';
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [showToastNudge, setShowToastNudge] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Encouraging motivational study quotes
  const motivationalQuotes = [
    "Consistency beats intensity! Review 1 roadmap step today.",
    "ECAT, MDCAT & NET prep is a marathon — keep up your daily streak!",
    "30 minutes of focused study today shapes your university admission tomorrow.",
    "Your future self will thank you for today's effort. Check off a milestone!"
  ];

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('rah_reminder_enabled', JSON.stringify(enabled));
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem('rah_reminder_time', reminderTime);
  }, [reminderTime]);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
      } catch (err) {
        console.error("Error requesting notification permission:", err);
      }
    }
  };

  // Web Audio API synth chime sound
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      osc2.frequency.setValueAtTime(1046.50, now); // C6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch (e) {
      // Audio fallback
    }
  };

  // Trigger Nudge Alert
  const triggerNudge = (isTest = false) => {
    playChimeSound();

    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    const title = t('reminder.nudgeToastTitle');
    const body = `${t('reminder.nudgeToastBody')} "${randomQuote}"`;

    setToastMessage(randomQuote);
    setShowToastNudge(true);

    // If browser notifications allowed, send system desktop notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'rah-study-nudge'
        });
      } catch (e) {
        console.log("Desktop notification fallback:", e);
      }
    }

    if (isTest) {
      setIsTesting(true);
      setTimeout(() => setIsTesting(false), 2000);
    }
  };

  // Background timer interval to check scheduled time
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      const todayStr = now.toISOString().split('T')[0];
      const lastTriggeredDate = localStorage.getItem('rah_reminder_last_date');

      if (currentTimeStr === reminderTime && lastTriggeredDate !== todayStr) {
        localStorage.setItem('rah_reminder_last_date', todayStr);
        triggerNudge(false);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [enabled, reminderTime]);

  // Format 24h time to 12h display
  const formatTime12h = (time24: string) => {
    if (!time24) return '6:00 PM';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${mStr} ${ampm}`;
  };

  const timePresets = [
    { label: t('reminder.morning'), value: '08:00', icon: '🌄' },
    { label: t('reminder.afternoon'), value: '14:00', icon: '☀️' },
    { label: t('reminder.evening'), value: '19:00', icon: '🌆' },
    { label: t('reminder.night'), value: '22:00', icon: '🌙' },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5 relative overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-rose-50 text-rose-800 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-md border border-rose-200/80 flex items-center gap-1">
                <BellRing className="h-3 w-3 text-rose-600" />
                <span>Habit Builder</span>
              </span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                Daily Study Alarm
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-rose-600 stroke-[2]" />
              <span>{t('reminder.title')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('reminder.subtitle')}
            </p>
          </div>

          {/* Toggle Enable/Disable Switch */}
          <div className="shrink-0 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">
              {enabled ? t('reminder.enable') : t('reminder.disable')}
            </span>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center cursor-pointer ${
                enabled ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
              aria-label="Toggle daily study reminder"
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-xs"
              />
            </button>
          </div>
        </div>

        {/* Main Controls Grid */}
        <div className={`space-y-4 transition-all duration-300 ${!enabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Time Selector Input (5 cols) */}
            <div className="md:col-span-5 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-600" />
                <span>{t('reminder.timeLabel')}</span>
              </label>

              <div className="flex items-center gap-2.5">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-white text-slate-900 font-bold text-base px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                />
                <div className="bg-teal-50 text-teal-900 text-xs font-semibold px-3 py-2 rounded-lg border border-teal-200/80">
                  {formatTime12h(reminderTime)}
                </div>
              </div>
            </div>

            {/* Quick Presets (7 cols) */}
            <div className="md:col-span-7 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                <span>{t('reminder.quickPresets')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timePresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setReminderTime(preset.value)}
                    className={`p-2 rounded-lg border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      reminderTime === preset.value
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-sm">{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {notificationPermission === 'granted' ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t('reminder.permissionGranted')}</span>
                </div>
              ) : notificationPermission === 'denied' ? (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>{t('reminder.permissionDenied')}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>{t('reminder.permissionBtn')}</span>
                </button>
              )}
            </div>

            {/* Test Nudge Button */}
            <button
              type="button"
              onClick={() => triggerNudge(true)}
              disabled={isTesting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Volume2 className={`h-3.5 w-3.5 text-teal-400 ${isTesting ? 'animate-bounce' : ''}`} />
              <span>{t('reminder.testBtn')}</span>
            </button>
          </div>

          {/* Active Reminder Summary Banner */}
          {enabled && (
            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 text-xs font-medium text-teal-950 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-teal-700 shrink-0" />
              <span>
                {t('reminder.activeMsg')} <strong className="font-bold text-teal-900">{formatTime12h(reminderTime)}</strong> daily. Keeps your university preparation on track.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Pop-Art Nudge Modal / Toast Overlay */}
      <AnimatePresence>
        {showToastNudge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowToastNudge(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 max-w-md w-full shadow-xl space-y-5 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowToastNudge(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Nudge Header */}
              <div className="space-y-2">
                <span className="bg-teal-50 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-teal-200/80 inline-flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-teal-600" />
                  <span>Daily Study Reminder</span>
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {t('reminder.nudgeToastTitle')}
                </h3>
              </div>

              {/* Quote Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                  "{toastMessage || motivationalQuotes[0]}"
                </p>
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Scheduled Check-In</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowToastNudge(false);
                    if (onScrollToRoadmap) onScrollToRoadmap();
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Review Roadmap Steps</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowToastNudge(false)}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
