'use client';

import clsx from 'clsx';

interface ContributionDay {
    contributionCount: number;
    date: string;
    contributionLevel: string;
}

interface HeatmapProps {
    data: {
        totalContributions: number;
        weeks: {
            contributionDays: ContributionDay[];
        }[];
    } | null;
}

const LEVEL_COLORS: Record<string, string> = {
    NONE: 'bg-slate-800/50',
    FIRST_QUARTILE: 'bg-emerald-900',
    SECOND_QUARTILE: 'bg-emerald-700',
    THIRD_QUARTILE: 'bg-emerald-500',
    FOURTH_QUARTILE: 'bg-emerald-400',
};

export default function Heatmap({ data }: HeatmapProps) {
    if (!data) return (
        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse h-48 flex items-center justify-center text-slate-500">
            No contribution data available (Organization or limitation)
        </div>
    );

    return (
        <div className="w-full overflow-x-auto p-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Contribution Graph</h3>
                <span className="text-sm text-slate-400">{data.totalContributions} contributions in the last year</span>
            </div>

            <div className="flex gap-1 min-w-max">
                {data.weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-1">
                        {week.contributionDays.map((day) => (
                            <div
                                key={day.date}
                                tabIndex={0}
                                role="gridcell"
                                className={clsx(
                                    'w-3 h-3 rounded-sm transition-all duration-200 hover:ring-2 focus:ring-2 ring-white/20 relative group cursor-help outline-none',
                                    LEVEL_COLORS[day.contributionLevel] || LEVEL_COLORS.NONE
                                )}
                                aria-label={`${day.contributionCount} contributions on ${day.date}`}
                            >
                                {/* Custom CSS Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700 shadow-xl">
                                    {day.contributionCount} contributions on {new Date(day.date).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 justify-end">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
                <div className="w-3 h-3 rounded-sm bg-emerald-900" />
                <div className="w-3 h-3 rounded-sm bg-emerald-700" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <span>More</span>
            </div>
        </div>
    );
}
