import React from 'react';
import { ArrowRight, BookOpen, Compass, Map, Sparkles } from 'lucide-react';
import { RegisteredUser } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const JourneyDashboard: React.FC<{ user: RegisteredUser; onGo: (tab: 'quiz' | 'journal') => void }> = ({ user, onGo }) => {
  const { t } = useLanguage();
  return <div className="mx-auto max-w-5xl space-y-6 pb-10">
    <section className="relative overflow-hidden rounded-[32px] border border-white/15 bg-[#151518] p-7 shadow-2xl sm:p-10">
      <div className="rah-grain pointer-events-none absolute inset-0" />
      <div className="relative z-10 max-w-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[.24em] text-fuchsia-300">{t('journey.badge')} · 01</p>
        <h2 className="mt-3 font-kanit text-4xl font-black uppercase leading-[.92] tracking-[-.045em] text-white sm:text-6xl">{t('journey.greeting').replace('{name}', user.fullName.split(' ')[0])}</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">{t('journey.description')}</p>
        <button onClick={() => onGo('quiz')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:brightness-110">{t('journey.continue')} <ArrowRight className="h-4 w-4" /></button>
      </div>
      <p className="pointer-events-none absolute -bottom-8 right-3 font-display text-[13rem] leading-none text-white/[.035] sm:text-[17rem]">RAH</p>
    </section>

    <section className="rounded-[28px] border border-white/10 bg-[#151518] p-5 sm:p-7">
      <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Your next action</p><h3 className="mt-1 text-2xl font-bold text-white">Choose one focus</h3></div><Compass className="h-6 w-6 text-fuchsia-300" /></div>
      <div className="grid gap-3 md:grid-cols-3">
        <button onClick={() => onGo('quiz')} className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 text-left transition hover:-translate-y-0.5 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10"><Sparkles className="h-5 w-5 text-fuchsia-300" /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-white">Discover</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Run the Ikigai diagnostic and reveal the career paths that fit.</p><ArrowRight className="mt-4 h-4 w-4 text-white/50 group-hover:text-fuchsia-300" /></button>
        <button onClick={() => onGo('quiz')} className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 text-left transition hover:-translate-y-0.5 hover:border-teal-400/60 hover:bg-teal-500/10"><Map className="h-5 w-5 text-teal-300" /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-white">Build</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Turn your result into a university or freelance-first skill map.</p><ArrowRight className="mt-4 h-4 w-4 text-white/50 group-hover:text-teal-300" /></button>
        <button onClick={() => onGo('journal')} className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-orange-500/10"><BookOpen className="h-5 w-5 text-orange-300" /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-white">Reflect</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Capture what gives you energy and use it in your next analysis.</p><ArrowRight className="mt-4 h-4 w-4 text-white/50 group-hover:text-orange-300" /></button>
      </div>
    </section>
  </div>;
};
