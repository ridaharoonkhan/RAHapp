import React, { useState } from 'react';
import { Info, Sparkles, BookOpen, Globe, Heart, Award, Target, Coins, X, UserCheck, Compass, LogOut, LogIn, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { RegisteredUser } from '../types';

interface HeaderProps {
  currentTab?: 'register' | 'login' | 'dashboard' | 'journal' | 'quiz' | 'results';
  onSelectTab?: (tab: 'register' | 'login' | 'dashboard' | 'journal' | 'quiz') => void;
  registeredUser?: RegisteredUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab = 'quiz',
  onSelectTab,
  registeredUser, onLogout
}) => {
  const [showIkigaiModal, setShowIkigaiModal] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="border-b border-white/10 bg-[#0c0c0c]/90 backdrop-blur-md px-4 py-3.5 sm:px-8 sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              onClick={() => onSelectTab && onSelectTab('dashboard')}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white font-bold text-lg flex items-center justify-center shadow-xs border border-white/20 tracking-tight cursor-pointer"
            >
              {lang === 'ur' ? 'راہ' : 'R'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  onClick={() => onSelectTab && onSelectTab('dashboard')}
                  className="text-xl font-bold tracking-tight text-white cursor-pointer"
                >
                  Rah راہ
                </h1>
                <span className="text-[11px] font-semibold bg-white/10 text-white/85 border border-white/15 px-2 py-0.5 rounded-md">
                  {t('app.tagline')}
                </span>
              </div>
              <p className="text-xs text-white/50 font-medium mt-0.5 flex items-center gap-1">
                <span>{t('app.subtitle')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Registered User Profile Pill */}
          {registeredUser && (
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('register')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-900 hover:bg-teal-100 transition-all cursor-pointer shadow-2xs"
              title="View your registered profile"
            >
              <span className="truncate max-w-[120px]">{registeredUser.fullName}</span>
              <span className="text-[10px] font-semibold bg-teal-200 text-teal-800 px-1.5 py-0.2 rounded">
                Registered
              </span>
            </button>
          )}
          {registeredUser ? <button onClick={onLogout} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700"><LogOut className="h-3.5 w-3.5" />{t('auth.logout')}</button> : <button onClick={() => onSelectTab && onSelectTab('login')} className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800"><LogIn className="h-3.5 w-3.5" />{t('auth.login')}</button>}
          {registeredUser && <button onClick={() => onSelectTab && onSelectTab('dashboard')} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${currentTab === 'dashboard' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}><LayoutDashboard className="h-3.5 w-3.5"/>{t('auth.journey')}</button>}
          {registeredUser && <button onClick={() => onSelectTab && onSelectTab('journal')} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${currentTab === 'journal' ? 'bg-indigo-700 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}><BookOpen className="h-3.5 w-3.5"/>{t('auth.journal')}</button>}

          {/* Navigation Tab: Register Yourself */}
          {false && !registeredUser && <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('register')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              currentTab === 'register'
                ? 'bg-slate-900 text-white font-bold border border-slate-900'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className={`h-3.5 w-3.5 ${currentTab === 'register' ? 'text-teal-400' : 'text-teal-600'}`} />
            <span>{t('register.title')}</span>
          </button>}

          {/* Navigation Tab: Ikigai Diagnostic */}
          {false && <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('quiz')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              currentTab === 'quiz' || currentTab === 'results'
                ? 'bg-slate-900 text-white font-bold border border-slate-900'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass className={`h-3.5 w-3.5 ${currentTab === 'quiz' || currentTab === 'results' ? 'text-teal-400' : 'text-slate-500'}`} />
            <span>{lang === 'ur' ? 'اکیگائی ڈائیگنوسٹک' : 'Ikigai Engine'}</span>
          </button>}

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
            title={lang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
          >
            <Globe className="h-3.5 w-3.5 text-teal-600" />
            <span>{lang === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Framework Info Button */}
          <button
            type="button"
            onClick={() => setShowIkigaiModal(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
          >
            <Info className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden md:inline">{t('header.framework')}</span>
          </button>
        </div>
      </div>

      {/* Formal Ikigai Framework Modal */}
      {showIkigaiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t('modal.title')}</h3>
                  <p className="text-xs text-slate-500 font-medium">Japanese Career & Purpose Blueprint</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIkigaiModal(false)}
                className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-4 space-y-4 text-xs text-slate-600 leading-relaxed">
              <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 font-medium text-slate-700">
                {t('modal.desc')}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-rose-50/60 p-3 border border-rose-100 space-y-1">
                  <span className="font-bold text-rose-900 flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-600 fill-rose-100" />
                    <span>{t('modal.love')}</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-snug">{t('modal.love.desc')}</p>
                </div>

                <div className="rounded-xl bg-sky-50/60 p-3 border border-sky-100 space-y-1">
                  <span className="font-bold text-sky-900 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-sky-600" />
                    <span>{t('modal.goodAt')}</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-snug">{t('modal.goodAt.desc')}</p>
                </div>

                <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-100 space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t('modal.worldNeeds')}</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-snug">{t('modal.worldNeeds.desc')}</p>
                </div>

                <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-100 space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-amber-600" />
                    <span>{t('modal.paidFor')}</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-snug">{t('modal.paidFor.desc')}</p>
                </div>
              </div>

              <div className="rounded-xl bg-teal-50/70 p-3.5 text-xs text-teal-950 border border-teal-200/80 flex items-start gap-2.5">
                <BookOpen className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-teal-900">{t('modal.grounding')}</strong> {t('modal.grounding.desc')}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIkigaiModal(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
              >
                {t('modal.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
