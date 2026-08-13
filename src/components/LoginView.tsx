import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, Lock, Mail, Sparkles } from 'lucide-react';
import { RegisteredUser } from '../types';
import { useLanguage } from '../context/LanguageContext';

const CAREER_VISIONS = [
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png', bg: '#ef765e', label: 'Build digital futures' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png', bg: '#4a9d6c', label: 'Find your impact' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png', bg: '#bf5c92', label: 'Turn talent into work' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png', bg: '#4c91d6', label: 'Choose your own path' },
];

const characterSwipeStyle = `
  @keyframes slideInFromRight {
    0% {
      transform: translateX(150px) scale(0.8);
      opacity: 0;
    }
    60% {
      transform: translateX(-15px) scale(1.05);
      opacity: 1;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-150px) scale(0.8);
      opacity: 0;
    }
    60% {
      transform: translateX(15px) scale(1.05);
      opacity: 1;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes slidingBounce {
    0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
    25% { transform: translateY(-15px) scale(1.02); opacity: 1; }
    50% { transform: translateY(0) scale(1); opacity: 1; }
    75% { transform: translateY(-10px) scale(1.01); opacity: 1; }
  }

  .character-slide {
    animation: slideInFromRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .character-slide.left {
    animation: slideInFromLeft 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .character-center {
    animation: slidingBounce 2.5s ease-in-out infinite;
  }
`;


export const LoginView: React.FC<{ onLogin: (user: RegisteredUser) => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => { CAREER_VISIONS.forEach(item => { const image = new Image(); image.src = item.src; }); }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setActiveIndex(current => (current + 1) % CAREER_VISIONS.length);
      setTimeout(() => setIsAnimating(false), 650);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const navigate = (direction: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(current => (direction === 'next' ? current + 1 : current + CAREER_VISIONS.length - 1) % CAREER_VISIONS.length);
    window.setTimeout(() => setIsAnimating(false), 650);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onLogin(data.user);
    } catch (err: any) { setError(err.message || 'Unable to sign in.'); }
    finally { setLoading(false); }
  };

  return <section className="relative -mx-4 -my-8 min-h-[calc(100vh-76px)] overflow-hidden px-4 py-8 sm:-mx-8 sm:px-8" style={{ backgroundColor: CAREER_VISIONS[activeIndex].bg, transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)' }}>
    <style>{characterSwipeStyle}</style>
    <div className="rah-grain pointer-events-none absolute inset-0 z-10" />
    <p className="pointer-events-none absolute left-1/2 top-[8%] z-0 -translate-x-1/2 select-none whitespace-nowrap font-display text-[24vw] leading-none tracking-[-.06em] text-white/25">YOUR PATH</p>
    <div className="absolute inset-0 z-[1]">
      {CAREER_VISIONS.map((vision, index) => {
        const distance = (index - activeIndex + CAREER_VISIONS.length) % CAREER_VISIONS.length;
        const role = distance === 0 ? 'center' : distance === 1 ? 'right' : distance === 3 ? 'left' : 'back';
        const positions = {
          center: 'left-1/2 bottom-[13%] h-[52%] -translate-x-1/2 scale-[1.45] opacity-100 blur-0 z-20 sm:bottom-0 sm:h-[84%] sm:scale-[1.64]',
          left: 'left-[16%] bottom-[31%] h-[16%] -translate-x-1/2 opacity-70 blur-[2px] z-10 sm:left-[29%] sm:bottom-[12%] sm:h-[27%]',
          right: 'left-[84%] bottom-[31%] h-[16%] -translate-x-1/2 opacity-70 blur-[2px] z-10 sm:left-[71%] sm:bottom-[12%] sm:h-[27%]',
          back: 'left-1/2 bottom-[31%] h-[13%] -translate-x-1/2 opacity-70 blur-[4px] z-[5] sm:bottom-[12%] sm:h-[21%]',
        };
        return <img key={vision.src} src={vision.src} draggable={false} alt="" className={`absolute w-auto object-contain object-bottom transition-all duration-[650ms] ease-out character-slide ${role === 'left' ? 'left' : ''} ${role === 'center' ? 'character-center' : ''} ${positions[role]}`} />;
      })}
    </div>
    <div className="relative z-30 mx-auto grid min-h-[calc(100vh-140px)] max-w-7xl items-end gap-6 lg:grid-cols-[1fr_390px]">
      <div className="self-end pb-2 sm:pb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-white backdrop-blur-sm"><Sparkles className="h-3.5 w-3.5" /> Pakistan career intelligence</div>
        <h2 className="max-w-lg font-kanit text-4xl font-black uppercase leading-[.9] tracking-[-.05em] text-white sm:text-6xl">Find work that <span className="text-white/60">feels like you.</span></h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">{CAREER_VISIONS[activeIndex].label}. Rah turns your interests, strengths, and real opportunities into a roadmap you can act on.</p>
        <div className="mt-5 flex gap-2">
          <button aria-label="Previous career vision" onClick={() => navigate('prev')} className="grid h-11 w-11 place-items-center rounded-full border-2 border-white text-white transition hover:scale-105 hover:bg-white/15"><ArrowLeft className="h-5 w-5" /></button>
          <button aria-label="Next career vision" onClick={() => navigate('next')} className="grid h-11 w-11 place-items-center rounded-full border-2 border-white text-white transition hover:scale-105 hover:bg-white/15"><ArrowRight className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="rounded-[28px] border border-white/30 bg-[#0c0c0c]/90 p-5 text-[#d7e2ea] shadow-2xl backdrop-blur-md sm:p-7">
        <div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500"><Compass className="h-5 w-5 text-white" /></div><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60">Start your journey</p><h2 className="font-kanit text-2xl font-bold leading-none">{t('auth.welcomeBack')}</h2></div></div>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-200">{error}</p>}
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">{t('register.email')}<span className="relative mt-1.5 block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400" placeholder="you@example.com" /></span></label>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">{t('auth.password')}<span className="relative mt-1.5 block"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400" placeholder={t('auth.passwordPlaceholder')} /></span></label>
          <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-orange-500 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_4px_18px_rgba(182,0,168,.35)] transition hover:brightness-110 disabled:opacity-60">{loading ? t('auth.signingIn') : t('auth.signIn')}</button>
        </form>
        <p className="mt-4 text-center text-xs text-white/60">{t('auth.newHere')} <button onClick={onRegister} className="font-bold text-white underline decoration-fuchsia-400 underline-offset-4">{t('auth.createAccount')}</button></p>
      </div>
    </div>
  </section>;
};
