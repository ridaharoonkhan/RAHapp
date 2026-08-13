import React from 'react';
import { Compass } from 'lucide-react';

interface IkigaiVisualizerProps {
  loveLabel?: string;
  goodAtLabel?: string;
  worldNeedsLabel?: string;
  paidForLabel?: string;
}

export const IkigaiVisualizer: React.FC<IkigaiVisualizerProps> = ({
  loveLabel = "Complex Problem Solving",
  goodAtLabel = "Math & Analytical Reasoning",
  worldNeedsLabel = "Better Healthcare Access",
  paidForLabel = "Health-Tech & Bioinformatics"
}) => {
  return (
    <div className="space-y-4">
      {/* High Density Framework List Block */}
      <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xs border border-slate-800">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-teal-300/90 mb-4 flex items-center justify-between">
          <span>Alignment Framework</span>
          <span className="text-[9px] bg-slate-800 text-teal-300 px-2 py-0.5 rounded uppercase font-semibold border border-slate-700">Intersection</span>
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0 mt-0.5"></div>
            <p className="leading-snug">
              <span className="font-semibold text-rose-300">Love:</span> <span className="text-slate-200">{loveLabel}</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0 mt-0.5"></div>
            <p className="leading-snug">
              <span className="font-semibold text-indigo-300">Good at:</span> <span className="text-slate-200">{goodAtLabel}</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0 mt-0.5"></div>
            <p className="leading-snug">
              <span className="font-semibold text-teal-300">World Needs:</span> <span className="text-slate-200">{worldNeedsLabel}</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-0.5"></div>
            <p className="leading-snug">
              <span className="font-semibold text-amber-300">Paid for:</span> <span className="text-slate-200">{paidForLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Intersection Matrix */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="mb-2 text-center">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overlap Diagram
          </h4>
        </div>

        <div className="relative aspect-square w-full max-w-[280px] mx-auto flex items-center justify-center">
          {/* Circle 1: Love */}
          <div className="absolute top-[8%] left-[8%] h-[58%] w-[58%] rounded-full bg-rose-500/10 border border-rose-300 p-2.5 flex flex-col justify-start">
            <span className="text-[10px] font-bold text-rose-700">Love</span>
            <p className="text-[9px] text-slate-600 line-clamp-2 leading-tight mt-0.5 font-medium">{loveLabel}</p>
          </div>

          {/* Circle 2: Good At */}
          <div className="absolute top-[8%] right-[8%] h-[58%] w-[58%] rounded-full bg-indigo-500/10 border border-indigo-300 p-2.5 flex flex-col items-end text-right">
            <span className="text-[10px] font-bold text-indigo-700">Good At</span>
            <p className="text-[9px] text-slate-600 line-clamp-2 leading-tight mt-0.5 font-medium">{goodAtLabel}</p>
          </div>

          {/* Circle 3: World Needs */}
          <div className="absolute bottom-[8%] left-[8%] h-[58%] w-[58%] rounded-full bg-teal-500/10 border border-teal-300 p-2.5 flex flex-col justify-end">
            <p className="text-[9px] text-slate-600 line-clamp-2 leading-tight mb-0.5 font-medium">{worldNeedsLabel}</p>
            <span className="text-[10px] font-bold text-teal-700">World Needs</span>
          </div>

          {/* Circle 4: Paid For */}
          <div className="absolute bottom-[8%] right-[8%] h-[58%] w-[58%] rounded-full bg-amber-500/10 border border-amber-300 p-2.5 flex flex-col items-end justify-end text-right">
            <p className="text-[9px] text-slate-600 line-clamp-2 leading-tight mb-0.5 font-medium">{paidForLabel}</p>
            <span className="text-[10px] font-bold text-amber-800">Paid For</span>
          </div>

          {/* Center */}
          <div className="z-10 h-20 w-20 rounded-full bg-slate-900 text-white shadow-sm flex flex-col items-center justify-center p-1 text-center border border-slate-700">
            <Compass className="h-4 w-4 text-teal-400" />
            <span className="text-[10px] font-bold tracking-wider text-teal-200">IKIGAI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

