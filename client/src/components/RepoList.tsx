'use client';

import { Star, GitFork, ExternalLink } from 'lucide-react';

interface Repo {
    id: number;
    name: string;
    description: string;
    stargazers_count: number;
    language: string;
    html_url: string;
}

export default function RepoList({ repos }: { repos: Repo[] }) {
    if (!repos.length) return null;

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl h-full">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Top Repositories</h3>
            <div className="space-y-4">
                {repos.map((repo) => (
                    <a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                {repo.name}
                            </span>
                            <ExternalLink className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3 h-10">
                            {repo.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                {repo.language || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {repo.stargazers_count}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
