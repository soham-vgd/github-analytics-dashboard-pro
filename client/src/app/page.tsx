'use client';

import SearchInput from '@/components/SearchInput';
import { Github } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />

      <div className="z-10 w-full max-w-md px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/20">
            <Github className="w-12 h-12 text-slate-100" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-4 tracking-tight">
          GitHub Analytics
        </h1>
        <p className="text-slate-400 mb-10 text-lg">
          Dive deep into developer profiles with real-time insights and beautiful visualizations.
        </p>

        <SearchInput className="w-full" />

        <div className="mt-12 flex gap-4 justify-center">
          {['Production Ready', 'Real-time', 'No-Lib Charts'].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-xs text-slate-500 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
