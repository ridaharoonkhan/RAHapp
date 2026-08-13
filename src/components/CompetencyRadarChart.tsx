import React from 'react';
import { motion } from 'motion/react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { RadarSkillMetric } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Target, Zap, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

interface CompetencyRadarChartProps {
  data?: RadarSkillMetric[];
  studentStrengths?: string[];
  careerTrack?: string;
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({
  data,
  studentStrengths = [],
  careerTrack = 'General'
}) => {
  const { t } = useLanguage();

  // Fallback radar skills if none provided in result
  const defaultSkills: RadarSkillMetric[] = [
    {
      skill: 'Problem Solving',
      current_strength: studentStrengths.length > 0 ? 80 : 70,
      target_level: 90,
      growth_tip: 'Practice timed past paper MCQs for entry tests (NET/FAST/MDCAT)'
    },
    {
      skill: 'Field Knowledge',
      current_strength: 65,
      target_level: 85,
      growth_tip: 'Strengthen core FSc / A-Level conceptual fundamentals'
    },
    {
      skill: 'Math & Logic',
      current_strength: 75,
      target_level: 90,
      growth_tip: 'Master calculus, quantitative reasoning, and algebra shortcuts'
    },
    {
      skill: 'Self-Study Focus',
      current_strength: 85,
      target_level: 85,
      growth_tip: 'Maintain steady momentum with daily 2-hour study blocks'
    },
    {
      skill: 'Entry Exam Speed',
      current_strength: 60,
      target_level: 90,
      growth_tip: 'Aim for solving 1 question in under 45 seconds under timed pressure'
    },
    {
      skill: 'Practical Execution',
      current_strength: 70,
      target_level: 85,
      growth_tip: 'Build hands-on projects, digital portfolios, or lab practice sets'
    }
  ];

  const skillsToDisplay = data && data.length >= 3 ? data : defaultSkills;

  // Format data for Recharts
  const formattedData = skillsToDisplay.map(item => ({
    subject: item.skill,
    'Current Strength': item.current_strength,
    'Target Level': item.target_level,
    gap: Math.max(0, item.target_level - item.current_strength),
    growthTip: item.growth_tip
  }));

  // Identify top growth gaps
  const sortedGaps = [...skillsToDisplay].sort(
    (a, b) => (b.target_level - b.current_strength) - (a.target_level - a.current_strength)
  );
  const topGaps = sortedGaps.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-50 text-teal-800 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-md border border-teal-200/80 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-teal-600" />
              <span>Competency Diagnostics</span>
            </span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
              Benchmark vs Roadmap Target
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-600 stroke-[2]" />
            <span>{t('results.radarChartTitle')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('results.radarChartSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
          <span>Current</span>
          <span className="text-slate-400">vs</span>
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
          <span>Target</span>
        </div>
      </div>

      {/* Spider-Web Radar Chart Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart Display (7 cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-7 h-[320px] sm:h-[360px] w-full bg-slate-50/60 p-3 rounded-2xl border border-slate-200/80 relative flex items-center justify-center"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={formattedData}>
              <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" opacity={0.6} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 9 }}
              />
              {/* Radar Area for Current Strengths */}
              <Radar
                name={t('results.currentStrength')}
                dataKey="Current Strength"
                stroke="#0d9488"
                fill="#14b8a6"
                fillOpacity={0.45}
                strokeWidth={2}
                isAnimationActive={true}
                animationBegin={250}
                animationDuration={900}
                animationEasing="ease-out"
              />
              {/* Radar Area for Target Requirements */}
              <Radar
                name={t('results.targetLevel')}
                dataKey="Target Level"
                stroke="#6366f1"
                fill="#818cf8"
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="4 4"
                isAnimationActive={true}
                animationBegin={400}
                animationDuration={900}
                animationEasing="ease-out"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 z-50">
                        <div className="font-semibold text-teal-300 text-sm">{data.subject}</div>
                        <div className="flex items-center justify-between gap-4 text-slate-300">
                          <span>Current Level:</span>
                          <span className="font-mono font-bold text-teal-400">{data['Current Strength']}/100</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-300">
                          <span>Target Level:</span>
                          <span className="font-mono font-bold text-indigo-300">{data['Target Level']}/100</span>
                        </div>
                        {data.gap > 0 && (
                          <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-300 font-medium flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-400" />
                            <span>Growth Gap: +{data.gap} pts</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: '600' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Growth Recommendations Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>{t('results.growthAreasHeading')}</span>
          </h4>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {topGaps.map((item, idx) => {
              const gap = Math.max(0, item.target_level - item.current_strength);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span>{item.skill}</span>
                    </span>
                    <span className="bg-rose-50 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-rose-200">
                      Gap: +{gap} pts
                    </span>
                  </div>

                  {/* Progress Bar comparison */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-teal-600 h-full transition-all"
                        style={{ width: `${item.current_strength}%` }}
                        title={`Current: ${item.current_strength}%`}
                      />
                      <div
                        className="bg-indigo-300 h-full transition-all opacity-80"
                        style={{ width: `${gap}%` }}
                        title={`Target Gap: ${gap}%`}
                      />
                    </div>
                  </div>

                  {/* Growth Tip */}
                  {item.growth_tip && (
                    <div className="text-[11px] font-medium text-slate-600 flex items-start gap-1.5 bg-white p-2 rounded-lg border border-slate-200/80">
                      <ArrowUpRight className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{item.growth_tip}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
