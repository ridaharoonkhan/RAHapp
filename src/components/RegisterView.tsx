import React, { useState } from 'react';
import { RegisteredUser } from '../types';
import { PAKISTAN_CITIES, ACADEMIC_TRACKS } from '../data/presetData';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Target,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface RegisterViewProps {
  onRegistrationComplete?: (user: RegisteredUser) => void;
  onNavigateToQuiz?: () => void;
}


export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegistrationComplete,
  onNavigateToQuiz
}) => {
  const { t } = useLanguage();

  const [existingUser, setExistingUser] = useState<RegisteredUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [academicStage, setAcademicStage] = useState('FSc Pre-Engineering');
  const [targetGoal, setTargetGoal] = useState('Software Engineering / Computer Science');
  const [selectedAvatar] = useState('student');
  const [bio, setBio] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const populateFields = (user: RegisteredUser) => {
    setFullName(user.fullName || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setCity(user.city || 'Lahore');
    setAcademicStage(user.academicStage || 'FSc Pre-Engineering');
    setTargetGoal(user.targetGoal || 'Software Engineering / Computer Science');
    setBio(user.bio || '');
  };

  const handleQuickFill = () => {
    setFullName('Muhammad Hamza Ali');
    setEmail('hamza.ali@student.edu.pk');
    setPhone('+92 301 8492011');
    setCity('Lahore');
    setAcademicStage('ICS (Computer Science / Math)');
    setTargetGoal('BS Computer Science & Software Engineering');
    setBio('Preparing for FAST NU, NUST NET-1 & GIKI tests. Passionate about AI & cloud computing.');
    setPasscode('hamza2026');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (passcode.length < 8) { setError('Please use a password of at least 8 characters.'); return; }

    setError(null);

    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      fullName: fullName.trim(),
      email: email.trim(),
      password: passcode, phone: phone.trim(),
      city,
      academicStage,
      targetGoal: targetGoal.trim() || 'Software Engineering / Technology',
      avatarId: selectedAvatar,
      bio: bio.trim()
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setExistingUser(data.user);
      setIsSuccess(true);
      setIsEditing(false);

      if (onRegistrationComplete) {
        onRegistrationComplete(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    }
  };

  const handleRegisterNew = () => {
    setExistingUser(null);
    setIsEditing(true);
    setIsSuccess(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCity('Lahore');
    setAcademicStage('FSc Pre-Engineering');
    setTargetGoal('Software Engineering / Computer Science');
    setBio('');
    setPasscode('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-teal-200/80 flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-teal-600" />
                <span>{t('auth.registerBadge')}</span>
              </span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                🇵🇰 Rah Pakistan Network
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('register.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              {t('register.subtitle')}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs"><UserCheck className="h-5 w-5 text-teal-600" /></div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">Profile</div>
              <div className="text-xs font-bold text-slate-900">Your information</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-teal-900">
                {t('register.success')}
              </h4>
              <p className="text-xs text-teal-700">
                {t('auth.saved').replace('{name}', fullName)}
              </p>
            </div>
          </div>
          {onNavigateToQuiz && (
            <button
              onClick={onNavigateToQuiz}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <span>{t('register.continueQuiz')}</span>
              <ArrowRight className="h-3.5 w-3.5 text-teal-400" />
            </button>
          )}
        </div>
      )}

      {/* If existing user and not explicitly editing, show Registered Card View */}
      {existingUser && !isEditing ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200"><User className="h-7 w-7 text-fuchsia-300" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{existingUser.fullName}</h3>
                  <span className="text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md">
                    {t('auth.active')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {existingUser.academicStage} • {existingUser.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200 cursor-pointer transition-all"
              >
                {t('register.editProfile')}
              </button>
              <button
                type="button"
                onClick={handleRegisterNew}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 rounded-lg border border-rose-200 cursor-pointer transition-all flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t('register.newRegister')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-500" />
                <span>Email Address</span>
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">{existingUser.email}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-500" />
                <span>Phone / WhatsApp</span>
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">{existingUser.phone}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                <span>Location</span>
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">{existingUser.city}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-slate-500" />
                <span>Academic Track</span>
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">{existingUser.academicStage}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Target className="h-3 w-3 text-slate-500" />
                <span>Target Degree Goal</span>
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">{existingUser.targetGoal}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-teal-600" />
                <span>Registration Date</span>
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">
                {new Date(existingUser.registeredAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {existingUser.bio && (
            <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold uppercase text-teal-800">
                Student Ambition & Bio
              </span>
              <p className="text-xs font-medium text-slate-800 leading-relaxed italic">
                "{existingUser.bio}"
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Your profile is active and synced with the Rah diagnostic engine.
            </span>
            {onNavigateToQuiz && (
              <button
                type="button"
                onClick={onNavigateToQuiz}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <BookOpen className="h-4 w-4 text-teal-400" />
                <span>{t('register.continueQuiz')}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Registration Form Component */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900">Student Profile Information</h3>
            </div>

            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>{t('auth.autofill')}</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.fullName')} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ayesha Khan"
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.email')} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ayesha.khan@student.edu.pk"
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.phone')}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* City / Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.city')}</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Academic Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.stage')}</span>
              </label>
              <select
                value={academicStage}
                onChange={(e) => setAcademicStage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {ACADEMIC_TRACKS.map((track) => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>

            {/* Target Goal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.goal')}</span>
              </label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="e.g. Software Engineering, Medicine MBBS, CA, Data Science"
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Student Bio & Passcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.bio')}</span>
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your ambitions or test targets (e.g. Aiming for NUST NET 2026)"
                className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('register.passcode')} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <p className="text-[10px] text-slate-400">
                Your password is securely hashed on the server and is required to sign in.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {isEditing && existingUser && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                {t('auth.cancelEdit')}
              </button>
            )}

            <button
              type="submit"
              className="ml-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>{t('register.submit')}</span>
              <ArrowRight className="h-4 w-4 text-teal-400" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
