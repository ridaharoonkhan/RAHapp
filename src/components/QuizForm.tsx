import React, { useState } from 'react';
import { RegisteredUser, StudentQuizAnswers, RunwayTimeframe } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  VIBE_QUESTIONS,
  RUNWAY_OPTIONS,
  PAKISTAN_CITIES,
  ACADEMIC_TRACKS,
  INTEREST_TAGS,
  STRENGTH_TAGS,
  WORLD_NEEDS_TAGS,
  FINANCIAL_PREFERENCES
} from '../data/presetData';
import { Sparkles, ArrowRight, UserCheck, Zap, Compass, Clock, Check, Plus, Trash2, User } from 'lucide-react';

interface QuizFormProps {
  onSubmit: (answers: StudentQuizAnswers) => void;
  isLoading: boolean;
  registeredUser?: RegisteredUser | null;
}

export const QuizForm: React.FC<QuizFormProps> = ({ onSubmit, isLoading, registeredUser }) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState<StudentQuizAnswers>(() => {
    return {
      academicTrack: registeredUser?.academicStage || ACADEMIC_TRACKS[2], // ICS
      location: registeredUser?.city || 'Lahore',
      interests: ['Game Development', 'Coding & Python Automation', 'UI/UX Design'],
      customInterests: registeredUser?.bio || '',
      strengths: ['Troubleshooting & Coding', 'Self-Directed Online Learning'],
      worldNeeds: ['Boosting Pakistan Tech & Software Exports', 'Digital Services & Local Job Creation'],
      financialPreference: FINANCIAL_PREFERENCES[2],
      careerPriority: registeredUser?.targetGoal || '',
      notes: '',
      vibeArchetype: '',
      runway: '6_months',
      learningRoute: 'both',
    };
  });

  // Vibe Quiz Answers state
  const [vibeAnswers, setVibeAnswers] = useState<Record<number, number>>({ 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [customInterestInput, setCustomInterestInput] = useState('');

  const handleVibeSelect = (qId: number, optIdx: number, archetype: string) => {
    setVibeAnswers(prev => ({ ...prev, [qId]: optIdx }));
    setFormData(prev => ({
      ...prev,
      vibeArchetype: archetype
    }));
  };

  const toggleInterest = (tag: string) => {
    setFormData(prev => {
      const exists = prev.interests.includes(tag);
      return {
        ...prev,
        interests: exists ? prev.interests.filter(i => i !== tag) : [...prev.interests, tag]
      };
    });
  };

  const addCustomInterestTag = () => {
    if (!customInterestInput.trim()) return;
    const tag = customInterestInput.trim();
    if (!formData.interests.includes(tag)) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, tag] }));
    }
    setCustomInterestInput('');
  };

  const toggleStrength = (tag: string) => {
    setFormData(prev => {
      const exists = prev.strengths.includes(tag);
      return {
        ...prev,
        strengths: exists ? prev.strengths.filter(s => s !== tag) : [...prev.strengths, tag]
      };
    });
  };

  const toggleWorldNeed = (tag: string) => {
    setFormData(prev => {
      const exists = prev.worldNeeds.includes(tag);
      return {
        ...prev,
        worldNeeds: exists ? prev.worldNeeds.filter(w => w !== tag) : [...prev.worldNeeds, tag]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Registered Student Active Badge */}
      {registeredUser && (
        <div className="bg-teal-50/80 border border-teal-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-xl border border-teal-200 text-teal-800"><UserCheck className="h-4 w-4" /></div>
            <div>
              <span className="font-bold text-teal-950">Registered Student: </span>
              <span className="font-semibold text-teal-900">{registeredUser.fullName}</span>
              <span className="text-teal-700 font-medium"> ({registeredUser.city} • {registeredUser.academicStage})</span>
            </div>
          </div>
          <span className="text-[10px] bg-teal-200/80 text-teal-900 font-semibold px-2 py-0.5 rounded-md shrink-0">
            Verified Registration
          </span>
        </div>
      )}

      {/* Hero Intro Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-900 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              {t('hero.badge')}
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            Personalized Academic & Career Mapping
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {t('hero.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
          {t('hero.desc')}
        </p>
      </div>

      {/* Onboarding Flow Stepper Tabs & Progress Bar */}
      <div className="space-y-3">
        {/* Step Graphical Progress Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span className="uppercase tracking-wider text-[11px]">Assessment Progress</span>
            </span>
            <span className="bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 font-bold text-slate-800 text-[11px]">
              Step {activeStep} of 3 ({Math.round((activeStep / 3) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(activeStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="flex border border-slate-200 rounded-xl bg-slate-100/80 p-1 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeStep === 1
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-teal-600" />
            <span className="hidden sm:inline">{t('onboarding.step1')}</span>
            <span className="sm:hidden">1. Vibe</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeStep === 2
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">{t('onboarding.step2')}</span>
            <span className="sm:hidden">2. Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeStep === 3
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{t('onboarding.step3')}</span>
            <span className="sm:hidden">3. Runway</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        {/* STEP 1: Personality & Vibe Check */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('onboarding.step1')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('onboarding.step1.desc')}
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                Your answers stay personal
              </span>
            </div>

            {/* Vibe Questions */}
            <div className="space-y-4">
              {VIBE_QUESTIONS.map(q => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                      Q{q.id}
                    </span>
                    {q.question}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = vibeAnswers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleVibeSelect(q.id, optIdx, opt.archetype)}
                          className={`text-left p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-semibold shadow-xs ring-1 ring-teal-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={isSelected ? 'text-teal-600 font-bold' : 'text-slate-400'}>
                              {isSelected ? '✓' : '•'}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>Next: Interest Sandbox</span>
                <ArrowRight className="h-4 w-4 text-teal-400" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Custom Interest Sandbox */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t('onboarding.step2')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('onboarding.step2.desc')}
              </p>
            </div>

            {/* Custom Input Box for Custom Badges */}
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-800">
                Add Custom Interest or Domain Tag:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Game Development, Stock Trading, Robotics, Python Automation"
                  value={customInterestInput}
                  onChange={e => setCustomInterestInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomInterestTag();
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={addCustomInterestTag}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg shadow-xs hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Tag</span>
                </button>
              </div>
            </div>

            {/* Interactive Interest Badges Sandbox Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Select or Toggle Domain Interests:
              </span>
              <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-slate-200 bg-slate-50/50 min-h-[120px]">
                {INTEREST_TAGS.map(tag => {
                  const isSelected = formData.interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-1 ring-teal-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{tag}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-teal-600" />}
                    </button>
                  );
                })}

                {/* Show custom tags if added */}
                {formData.interests
                  .filter(i => !INTEREST_TAGS.includes(i))
                  .map(customTag => (
                    <button
                      key={customTag}
                      type="button"
                      onClick={() => toggleInterest(customTag)}
                      className="px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{customTag}</span>
                      <Trash2 className="h-3.5 w-3.5 text-indigo-700" />
                    </button>
                  ))}
              </div>
            </div>

            {/* Strengths Grid */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Select Core Academic & Cognitive Strengths:
              </span>
              <div className="flex flex-wrap gap-2">
                {STRENGTH_TAGS.map(tag => {
                  const isSelected = formData.strengths.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleStrength(tag)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Back: Vibe Check
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-xs shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>Next: Time Runway Budgeter</span>
                <ArrowRight className="h-4 w-4 text-teal-400" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: The Runway & Time Budgeter */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t('onboarding.step3')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('onboarding.step3.desc')}
              </p>
            </div>

            {/* Available Runway Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-800">
                Choose Target Preparation Horizon:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RUNWAY_OPTIONS.map(opt => {
                  const isSelected = formData.runway === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, runway: opt.id as RunwayTimeframe })}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 leading-snug mt-1">
                          {opt.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-semibold">
                        <span className="text-slate-500">{isSelected ? 'Active Selection' : 'Select'}</span>
                        {isSelected && <span className="text-teal-700 font-bold">✓ Selected</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Academic Track & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Pre-University Academic Track *
                </label>
                <select
                  value={formData.academicTrack}
                  onChange={e => setFormData({ ...formData, academicTrack: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {ACADEMIC_TRACKS.map(track => (
                    <option key={track} value={track}>{track}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  City / Location in Pakistan *
                </label>
                <select
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {PAKISTAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* World Needs / Impact */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Socioeconomic Value & National Impact Priorities:
              </span>
              <div className="flex flex-wrap gap-2">
                {WORLD_NEEDS_TAGS.map(tag => {
                  const isSelected = formData.worldNeeds.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleWorldNeed(tag)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Financial Access / University Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Financial Accessibility & Tuition Tier *
              </label>
              <select
                value={formData.financialPreference}
                onChange={e => setFormData({ ...formData, financialPreference: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {FINANCIAL_PREFERENCES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Which learning route fits you best?
              </label>
              <p className="text-[11px] text-slate-500">Choose freelance-first if you want to build skills, a portfolio, and paid client work without relying on a typical university route.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'university', title: 'University route', text: 'Degree and entrance-test plan' },
                  { id: 'freelance_first', title: 'Freelance-first', text: 'Portfolio and client-ready plan' },
                  { id: 'both', title: 'Keep both open', text: 'Degree plan plus freelance side lane' },
                ].map(route => {
                  const selected = formData.learningRoute === route.id;
                  return (
                    <button key={route.id} type="button" onClick={() => setFormData({ ...formData, learningRoute: route.id as StudentQuizAnswers['learningRoute'] })}
                      className={`rounded-xl border p-3 text-left transition cursor-pointer ${selected ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500/20' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <span className="block text-xs font-bold text-slate-900">{route.title}</span>
                      <span className="mt-1 block text-[10px] leading-snug text-slate-600">{route.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Final Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 text-white px-6 py-3.5 text-sm font-semibold shadow-sm hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{t('quiz.submitting')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span>{t('quiz.submit')}</span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
