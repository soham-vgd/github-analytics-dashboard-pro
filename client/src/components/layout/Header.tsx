'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';
import SearchInput from '../SearchInput';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Github className="w-6 h-6 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                    <span className="font-bold text-slate-100 hidden sm:inline-block">GitHub Analytics</span>
                </Link>

                <div className="w-full max-w-sm pl-4">
                    <SearchInput className="scale-90 origin-right" />
                </div>
            </div>
        </header>
    );
}
