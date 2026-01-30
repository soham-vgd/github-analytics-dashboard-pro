'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function SearchInput({
    initialValue = '',
    className
}: {
    initialValue?: string;
    className?: string;
}) {
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        setIsLoading(true);
        // Navigate to dashboard
        router.push(`/dashboard/${value.trim()}`);
    };

    return (
        <form onSubmit={handleSearch} className={clsx("relative group", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search GitHub username or org..."
                className="w-full bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-full px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500 text-slate-100 shadow-lg"
            />
            {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 animate-spin" />
            )}
        </form>
    );
}
