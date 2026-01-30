'use client';

interface LanguageStat {
    language: string;
    percentage: number;
    count: number;
}

export default function LanguageChart({ languages }: { languages: LanguageStat[] }) {
    if (!languages.length) return null;

    // Take top 5
    const topLanguages = languages.slice(0, 5);

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl h-full">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Top Languages</h3>
            <div className="space-y-4">
                {topLanguages.map((lang) => (
                    <div key={lang.language}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{lang.language}</span>
                            <span className="text-slate-500">{lang.percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${lang.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
