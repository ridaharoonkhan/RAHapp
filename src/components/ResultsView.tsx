import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IkigaiAnalysisResult, StudentQuizAnswers, RunwayTimeframe, ScholarshipOpportunity, GroundedSource, SkillRoadmap } from '../types';
import { IkigaiVisualizer } from './IkigaiVisualizer';
import { CompetencyRadarChart } from './CompetencyRadarChart';
import { DailyStudyReminder } from './DailyStudyReminder';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  BookOpen,
  Building2,
  AlertTriangle,
  CalendarCheck,
  CheckSquare,
  Square,
  Copy,
  Check,
  RotateCcw,
  Code,
  Clock,
  ExternalLink,
  Zap,
  Compass,
  GraduationCap,
  Coins,
  Search,
  Loader2,
  Heart,
  Target,
  Flame,
  ShieldCheck,
  Award
  , Map, Briefcase
} from 'lucide-react';

interface ResultsViewProps {
  result: IkigaiAnalysisResult;
  answers: StudentQuizAnswers;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, answers, onReset }) => {
  const { t } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [selectedRunway, setSelectedRunway] = useState<RunwayTimeframe>(answers.runway || '6_months');
  const [selectedSkillMap, setSelectedSkillMap] = useState(0);
  const [skillRoute, setSkillRoute] = useState<'university_route' | 'freelance_route'>(
    answers.learningRoute === 'freelance_first' ? 'freelance_route' : 'university_route'
  );

  const scrollToRoadmap = () => {
    const el = document.getElementById('roadmap-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const scrollToCategory = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Scholarship Search Grounding States
  const [scholarships, setScholarships] = useState<ScholarshipOpportunity[]>(result.scholarships || []);
  const [isSearchingScholarships, setIsSearchingScholarships] = useState(false);
  const [scholarshipSearchQuery, setScholarshipSearchQuery] = useState(
    `${answers.academicTrack} scholarships in Pakistan ${answers.location || ''}`
  );
  const [groundedSources, setGroundedSources] = useState<GroundedSource[]>([]);
  const [searchQueriesUsed, setSearchQueriesUsed] = useState<string[]>([]);
  const [scholarshipError, setScholarshipError] = useState<string | null>(null);

  const handleSearchScholarships = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchingScholarships(true);
    setScholarshipError(null);

    try {
      const res = await fetch('/api/search-scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: scholarshipSearchQuery,
          careerPath: result.paths?.[0]?.title,
          academicTrack: answers.academicTrack,
          location: answers.location,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.scholarships && Array.isArray(data.scholarships)) {
        setScholarships(data.scholarships);
      }
      if (data.grounding_sources && Array.isArray(data.grounding_sources)) {
        setGroundedSources(data.grounding_sources);
      }
      if (data.search_queries && Array.isArray(data.search_queries)) {
        setSearchQueriesUsed(data.search_queries);
      }
    } catch (err: any) {
      console.error("Failed to search scholarships:", err);
      setScholarshipError("Failed to fetch live grounded scholarships. Showing default Pakistani opportunities.");
    } finally {
      setIsSearchingScholarships(false);
    }
  };

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const handleCopy = () => {
    const textToCopy = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  // Get current active roadmap items from dynamic timeframes if available, else fallback to result.roadmap
  const activeRoadmap = (result.dynamic_timeframe_roadmaps && result.dynamic_timeframe_roadmaps[selectedRunway])
    ? result.dynamic_timeframe_roadmaps[selectedRunway]
    : result.roadmap;
  const skillMaps = result.skill_roadmaps || [];
  const activeSkillMap: SkillRoadmap | undefined = skillMaps[selectedSkillMap] || skillMaps[0];

  const totalSteps = activeRoadmap.length;
  const completedCount = activeRoadmap.filter((_, idx) => completedSteps[`${selectedRunway}_${idx}`]).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const markAllComplete = () => {
    const updated: Record<string, boolean> = { ...completedSteps };
    activeRoadmap.forEach((_, idx) => {
      updated[`${selectedRunway}_${idx}`] = true;
    });
    setCompletedSteps(updated);
  };

  const clearAllProgress = () => {
    const updated: Record<string, boolean> = { ...completedSteps };
    activeRoadmap.forEach((_, idx) => {
      updated[`${selectedRunway}_${idx}`] = false;
    });
    setCompletedSteps(updated);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider">
              {t('results.analysisComplete')}
            </span>
            <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              {answers.academicTrack} • {answers.location}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {t('results.heading')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
            <span>{copied ? t('results.copied') : t('results.copy')}</span>
          </button>

          <button
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-all"
          >
            <Code className="h-4 w-4 text-slate-600" />
            <span>{showJsonInspector ? t('results.hideJson') : t('results.json')}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer shadow-xs transition-all"
          >
            <RotateCcw className="h-4 w-4 text-teal-400" />
            <span>{t('results.newSearch')}</span>
          </button>
        </div>
      </div>

      {/* Raw JSON Inspector */}
      {showJsonInspector && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-teal-300 font-mono text-xs overflow-x-auto shadow-md">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <span>Validated Output JSON Schema</span>
            <span>UTF-8 JSON</span>
          </div>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <nav aria-label="Analysis categories" className="sticky top-[72px] z-20 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#151518]/95 p-2 shadow-lg backdrop-blur">
        {[
          ['profile-category', '01 Profile'],
          ['paths-category', '02 Pathways'],
          ['funding-category', '03 Funding'],
          ['roadmap-section', '04 Plan'],
        ].map(([id, label]) => <button key={id} type="button" onClick={() => scrollToCategory(id)} className="shrink-0 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 hover:text-white">{label}</button>)}
      </nav>

      {/* Profile Archetype Banner */}
      <div id="profile-category" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm relative overflow-hidden scroll-mt-28">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex flex-col items-center shrink-0">
            <div className="text-4xl p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
              <Compass className="h-9 w-9 text-fuchsia-300" />
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-teal-300 px-2.5 py-0.5 rounded-md">
              YOUR PROFILE
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Your career profile
              </span>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                Executive Profile
              </span>
            </div>

            {/* Profile Summary Box */}
            <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-1">
              <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                "{result.profile_summary}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Generated Ikigai Profile Summary & Motivations Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 relative overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-md border border-teal-200/80 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-teal-600" />
                <span>AI Diagnostics</span>
              </span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                Quiz Analysis
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Compass className="h-5 w-5 text-teal-600 stroke-[2]" />
              <span>{t('results.ikigaiSummaryTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('results.ikigaiSummarySubtitle')}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Compass className="h-5 w-5 text-fuchsia-300" />
            <div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">Learning approach</div>
              <div className="text-xs font-bold text-slate-900">{answers.vibeArchetype || 'Personalized from your answers'}</div>
            </div>
          </div>
        </div>

        {/* Core Value Intersection Narrative */}
        <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-teal-900 font-semibold text-xs uppercase">
            <Target className="h-4 w-4 text-teal-600" />
            <span>{t('results.valueIntersection')}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
            {result.ikigai_breakdown?.value_intersection || result.profile_summary}
          </p>
        </div>

        {/* Core Motivations & Discovered Strengths 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Core Motivations Column */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>{t('results.coreMotivations')}</span>
            </h4>
            <div className="space-y-2">
              {(result.ikigai_breakdown?.core_motivations || answers.interests).map((motivation, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-start gap-2 shadow-2xs"
                >
                  <span className="text-xs font-bold text-rose-600 shrink-0">#{idx + 1}</span>
                  <span className="text-xs font-medium text-slate-800">{motivation}</span>
                </div>
              ))}
              {answers.careerPriority && (
                <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-200/80 text-xs font-medium text-slate-800 italic">
                  💡 Priority Target: {answers.careerPriority}
                </div>
              )}
            </div>
          </div>

          {/* Discovered Strengths Column */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t('results.discoveredStrengths')}</span>
            </h4>
            <div className="space-y-2">
              {(result.ikigai_breakdown?.discovered_strengths || answers.strengths).map((strength, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-start gap-2 shadow-2xs"
                >
                  <Award className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-slate-800">{strength}</span>
                </div>
              ))}
              {answers.vibeArchetype && (
                <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-200/80 text-xs font-medium text-slate-800">
                  🎯 Learning Style: {answers.vibeArchetype}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Ikigai Pillars Grid */}
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-semibold uppercase text-rose-700 flex items-center justify-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                <span>{t('results.whatYouLove')}</span>
              </span>
              <p className="text-[11px] font-medium text-slate-800 truncate" title={answers.interests.join(', ')}>
                {answers.interests.slice(0, 2).join(', ')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-semibold uppercase text-indigo-700 flex items-center justify-center gap-1">
                <Zap className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />
                <span>{t('results.whatYoureGoodAt')}</span>
              </span>
              <p className="text-[11px] font-medium text-slate-800 truncate" title={answers.strengths.join(', ')}>
                {answers.strengths.slice(0, 2).join(', ')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-semibold uppercase text-teal-700 flex items-center justify-center gap-1">
                <Compass className="h-3.5 w-3.5 text-teal-600" />
                <span>{t('results.whatWorldNeeds')}</span>
              </span>
              <p className="text-[11px] font-medium text-slate-800 truncate" title={answers.worldNeeds.join(', ')}>
                {answers.worldNeeds.slice(0, 1).join(', ')}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-semibold uppercase text-amber-700 flex items-center justify-center gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-600" />
                <span>{t('results.whatPaysWell')}</span>
              </span>
              <p className="text-[11px] font-medium text-slate-800 truncate" title={answers.financialPreference}>
                {answers.financialPreference.split('(')[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spider-web (Radar Chart) Competency & Growth Gaps Analysis */}
      <CompetencyRadarChart
        data={result.radar_skills}
        studentStrengths={answers.strengths}
        careerTrack={answers.academicTrack}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (4 cols): Ikigai Diagram & Context */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border-3 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              🎯 {t('results.yourProfile')}
            </h3>

            <IkigaiVisualizer
              loveLabel={answers.interests[0] || "Core Passions"}
              goodAtLabel={answers.strengths[0] || "Core Skills"}
              worldNeedsLabel={answers.worldNeeds[0] || "Pakistan Needs"}
              paidForLabel={answers.financialPreference.split('(')[0]}
            />
          </div>

          {/* Study Resources Section */}
          {result.study_resources && result.study_resources.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <BookOpen className="h-4 w-4 text-teal-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  {t('results.resources')}
                </h3>
              </div>
              <div className="space-y-2">
                {result.study_resources.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{res.title}</span>
                      <span className="text-[9px] font-semibold uppercase bg-slate-900 text-white px-1.5 py-0.5 rounded">
                        {res.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                      {res.description}
                    </p>
                    {res.recommended_for && (
                      <p className="text-[10px] text-teal-700 font-medium">
                        For: {res.recommended_for}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 font-normal leading-relaxed">
            {t('results.note')}
          </div>
        </section>

        {/* Right Column (8 cols): Career Paths & Dynamic Runway Roadmap */}
        <section className="lg:col-span-8 flex flex-col gap-8">
          {/* Recommended Career & Degree Pathways */}
          <div id="paths-category" className="space-y-4 scroll-mt-28">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Zap className="h-4 w-4 text-teal-600" />
              <span>{t('results.recommendedPathways')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.paths.map((pathItem, idx) => {
                return (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase bg-slate-900 text-teal-300 px-2 py-0.5 rounded">
                          PATH {idx + 1}
                        </span>
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          Recommended
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {pathItem.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">
                        {pathItem.description}
                      </p>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px]">
                      <p className="leading-tight">
                        <span className="font-semibold text-slate-900 uppercase">Entrance Test: </span>
                        <span className="font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {pathItem.entry_point}
                        </span>
                      </p>

                      {pathItem.example_institutions && pathItem.example_institutions.length > 0 && (
                        <p className="leading-tight">
                          <span className="font-semibold text-slate-900 uppercase">Top Universities: </span>
                          <span className="font-medium text-slate-700">{pathItem.example_institutions.join(', ')}</span>
                        </p>
                      )}

                      <div className="mt-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                        <p className="text-[11px] font-normal text-slate-700 leading-snug">
                          <span className="text-slate-900 font-semibold uppercase">Key Tradeoff: </span>
                          {pathItem.tradeoff}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Roadmap-style skill map for each recommended path */}
          {activeSkillMap && (
            <div className="space-y-4 border-t border-slate-200/80 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Map className="h-4 w-4 text-teal-600" />
                    <span>Career Skill Map</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Follow connected stages for a degree route or a client-ready freelance route.</p>
                </div>
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 gap-1">
                  <button type="button" onClick={() => setSkillRoute('university_route')}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase cursor-pointer ${skillRoute === 'university_route' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}>
                    University
                  </button>
                  <button type="button" onClick={() => setSkillRoute('freelance_route')}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase cursor-pointer ${skillRoute === 'freelance_route' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600'}`}>
                    <Briefcase className="mr-1 inline h-3 w-3" />Freelance first
                  </button>
                </div>
              </div>

              {skillMaps.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {skillMaps.map((map, index) => (
                    <button key={map.path_title} type="button" onClick={() => setSelectedSkillMap(index)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold cursor-pointer transition ${activeSkillMap.path_title === map.path_title ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                      {map.path_title}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{activeSkillMap.path_title}</span>
                  {activeSkillMap.core_skills.map(skill => <span key={skill} className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-[10px] font-medium text-teal-800">{skill}</span>)}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {activeSkillMap[skillRoute].map((stage, index) => (
                    <div key={`${skillRoute}-${stage.title}`} className="relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                      {index < activeSkillMap[skillRoute].length - 1 && <div className="hidden xl:block absolute left-full top-8 h-0.5 w-3 bg-teal-300" />}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-teal-300">{index + 1}</span>
                      <p className="mt-2 text-xs font-bold text-slate-900">{stage.title}</p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase text-teal-700">{stage.timeframe}</p>
                      <ul className="mt-2 space-y-1 text-[11px] leading-snug text-slate-600">
                        {stage.focus.map(item => <li key={item}>• {item}</li>)}
                      </ul>
                      <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] leading-snug text-slate-500"><span className="font-bold text-slate-700">Outcome: </span>{stage.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Alternative & Adjacent Pathways Section */}
          {result.alternative_paths && result.alternative_paths.length > 0 && (
            <div className="space-y-4 border-t border-slate-200/80 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-indigo-600" />
                    <span>{t('results.alternativePaths')}</span>
                  </h3>
                  <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                    {t('results.alternativeSubtitle')}
                  </p>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-bold uppercase bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-md border border-indigo-200">
                  💡 DISCOVER MORE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.alternative_paths.map((altPath, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-500/50 hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                          {altPath.field_category || 'ADJACENT DISCIPLINE'}
                        </span>
                        <span className="text-[9px] font-medium uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {idx === 0 ? 'HIGH MATCH' : 'EXPLORE'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {altPath.title}
                      </h4>

                      {/* Why relevant callout box */}
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                        <p className="text-[10px] font-semibold uppercase text-indigo-900 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-indigo-600" />
                          <span>{t('results.whyRelevant')}</span>
                        </p>
                        <p className="text-xs text-slate-700 font-normal leading-relaxed">
                          {altPath.why_relevant}
                        </p>
                      </div>

                      {/* Transferable Skills */}
                      {altPath.transferable_skills && altPath.transferable_skills.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold uppercase text-slate-500">
                            {t('results.transferableSkills')}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {altPath.transferable_skills.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px]">
                      {altPath.example_degrees && altPath.example_degrees.length > 0 && (
                        <p className="leading-tight">
                          <span className="font-semibold text-slate-900 uppercase">{t('results.exampleDegrees')} </span>
                          <span className="font-normal text-slate-700">{altPath.example_degrees.join(', ')}</span>
                        </p>
                      )}

                      {altPath.example_institutions && altPath.example_institutions.length > 0 && (
                        <p className="leading-tight">
                          <span className="font-semibold text-slate-900 uppercase">{t('results.topInstitutions')} </span>
                          <span className="font-normal text-slate-600">{altPath.example_institutions.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scholarships & Financial Aid Grounding Section */}
            <div id="funding-category" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 scroll-mt-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                    <Search className="h-3 w-3 stroke-[2]" />
                    <span>GOOGLE SEARCH GROUNDED</span>
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                    🇵🇰 Live Financial Aid
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-teal-600" />
                  <span>{t('results.scholarshipsTitle')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('results.scholarshipsSubtitle')}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-medium uppercase bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                  {scholarships.length} Grants Displayed
                </span>
              </div>
            </div>

            {/* Live Search Input Form */}
            <form onSubmit={handleSearchScholarships} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={scholarshipSearchQuery}
                  onChange={(e) => setScholarshipSearchQuery(e.target.value)}
                  placeholder="e.g. Computer Science need-based scholarships in Lahore or PEEF grants"
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingScholarships}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium text-xs uppercase rounded-xl border border-slate-900 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSearchingScholarships ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                    <span>{t('results.searchingScholarships')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span>{t('results.searchScholarshipsBtn')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Executed Search Queries Badge */}
            {searchQueriesUsed.length > 0 && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900 uppercase text-[10px]">Google Queries Executed:</span>
                {searchQueriesUsed.map((q, idx) => (
                  <span key={idx} className="bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                    "{q}"
                  </span>
                ))}
              </div>
            )}

            {scholarshipError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{scholarshipError}</span>
              </div>
            )}

            {/* Scholarships Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scholarships.map((sch, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                        {sch.provider}
                      </span>
                      {sch.deadline_note && (
                        <span className="text-[9px] font-medium bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {sch.deadline_note}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {sch.title}
                    </h4>

                    {/* Coverage Highlight Box */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-0.5">
                      <span className="text-[9px] font-semibold uppercase text-teal-800 flex items-center gap-1">
                        <Coins className="h-3 w-3 text-teal-600" />
                        <span>{t('results.scholarshipCoverage')}</span>
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {sch.coverage}
                      </p>
                    </div>

                    <p className="text-xs font-normal text-slate-600 leading-relaxed">
                      {sch.description}
                    </p>

                    {/* Eligibility */}
                    <div className="text-[11px] font-normal text-slate-700 pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-900 uppercase text-[10px]">{t('results.scholarshipEligibility')} </span>
                      <span className="font-medium text-slate-600">{sch.eligibility}</span>
                    </div>
                  </div>

                  {/* Grounded Links for this scholarship if available */}
                  {sch.source_urls && sch.source_urls.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      <span className="text-[9px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                        <ExternalLink className="h-2.5 w-2.5 text-teal-600" />
                        <span>Verified Portal Links:</span>
                      </span>
                      <div className="flex flex-col gap-1">
                        {sch.source_urls.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-medium text-teal-700 hover:text-teal-900 underline flex items-center gap-1 truncate max-w-full"
                          >
                            <span className="truncate">{src.title || src.url}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Global Grounded Sources Section */}
            {groundedSources.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h5 className="text-[11px] font-semibold uppercase text-slate-800 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
                  <span>{t('results.groundedSources')}</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {groundedSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-800 text-[10px] font-medium rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span className="max-w-[200px] truncate">{source.title}</span>
                      <ExternalLink className="h-3 w-3 text-teal-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Study Reminder & Habit Nudge Widget */}
          <DailyStudyReminder onScrollToRoadmap={scrollToRoadmap} />

          {/* Dynamic Runway Roadmap Container */}
          <div id="roadmap-section" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <span>{t('results.roadmap')}</span>
                </h3>
                <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                  Select a runway duration & check off milestones as you complete them:
                </p>
              </div>

              {/* Dynamic Runway Switcher Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                {(['3_months', '6_months', '12_months'] as RunwayTimeframe[]).map(tf => {
                  const isCurrent = selectedRunway === tf;
                  const label = tf === '3_months' ? '3M Sprint' : tf === '6_months' ? '6M Standard' : '12M Marathon';
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setSelectedRunway(tf)}
                      className={`px-2.5 py-1 text-[10px] font-semibold uppercase rounded-lg transition cursor-pointer ${
                        isCurrent
                          ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkbox Progress Bar & Quick Actions */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-auto flex-1 space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-800">
                  <span>{t('results.progress')} {completedCount} / {totalSteps} Steps</span>
                  <span className="text-teal-700 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={markAllComplete}
                  className="px-2.5 py-1.5 text-[10px] font-semibold uppercase bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg border border-teal-200 cursor-pointer transition-all"
                >
                  {t('results.markAll')}
                </button>
                <button
                  type="button"
                  onClick={clearAllProgress}
                  className="px-2.5 py-1.5 text-[10px] font-medium uppercase bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer transition-all"
                >
                  {t('results.clearProgress')}
                </button>
              </div>
            </div>

            {/* Steps Timeline List with Checkboxes */}
            <div className="relative space-y-3.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRunway}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  className="space-y-3.5"
                >
                  {activeRoadmap.map((stepItem, idx) => {
                    const stepKey = `${selectedRunway}_${idx}`;
                    const isDone = !!completedSteps[stepKey];
                    return (
                      <motion.div
                        key={`${selectedRunway}_step_${idx}`}
                        variants={{
                          hidden: { opacity: 0, y: 18, scale: 0.97 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { type: 'spring', stiffness: 350, damping: 25 }
                          },
                        }}
                        onClick={() => toggleStep(stepKey)}
                        className="flex items-start gap-3 relative cursor-pointer group"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStep(stepKey);
                          }}
                          className={`w-6 h-6 rounded-md border shrink-0 transition-all flex items-center justify-center font-bold text-xs z-10 cursor-pointer ${
                            isDone
                              ? 'bg-teal-600 border-teal-600 text-white shadow-2xs'
                              : 'bg-white border-slate-300 hover:border-teal-500 text-slate-400'
                          }`}
                          aria-label={isDone ? "Step completed" : "Step pending"}
                        >
                          {isDone ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Square className="h-3.5 w-3.5 text-slate-300" />}
                        </button>

                        <div
                          className={`flex-1 p-3.5 rounded-xl border transition-all ${
                            isDone
                              ? 'bg-teal-50/50 border-teal-200/80'
                              : 'bg-slate-50/70 border-slate-200/80 group-hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <span className="text-[10px] font-semibold uppercase bg-slate-900 text-teal-300 px-2 py-0.5 rounded">
                              {stepItem.timeframe}
                            </span>
                            <span
                              className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${
                                isDone
                                  ? 'bg-teal-100 text-teal-800 border-teal-300'
                                  : 'bg-slate-200/80 text-slate-600 border-slate-300'
                              }`}
                            >
                              {isDone ? '✓ Completed' : 'Pending'}
                            </span>
                          </div>
                          <p className={`text-xs font-medium leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {stepItem.step}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
