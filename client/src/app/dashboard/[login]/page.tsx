'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '@/services/api';
import Header from '@/components/layout/Header';
import Heatmap from '@/components/Heatmap';
import RepoList from '@/components/RepoList';
import LanguageChart from '@/components/LanguageChart';
import ActivityTimeline from '@/components/ActivityTimeline';
import { Users, MapPin, Link as LinkIcon, Building, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardPage() {
    const { login } = useParams();
    const username = login as string;

    const { data, isLoading, error } = useQuery({
        queryKey: ['profile', username],
        queryFn: () => fetchProfile(username),
        retry: 1,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Analyzing GitHub profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
                    <p className="text-slate-400 mb-6">
                        {(error as any)?.response?.data?.message || 'Failed to fetch profile. User might not exist or API rate limit exceeded.'}
                    </p>
                    <a href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors">
                        Go Back
                    </a>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <Header />

            <main className="container mx-auto px-4 py-8 space-y-6">
                {/* Profile Header */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 shadow-2xl relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
                        <Image
                            src={data.profile.avatar_url}
                            alt={data.profile.name || data.profile.login}
                            fill
                            className="rounded-full border-4 border-slate-800 shadow-xl object-cover"
                            priority
                        />
                    </div>

                    <div className="text-center md:text-left flex-1 relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {data.profile.name || data.profile.login}
                            <span className="text-lg md:text-xl font-normal text-slate-500 ml-2">@{data.profile.login}</span>
                        </h1>
                        <p className="text-slate-300 max-w-2xl mb-6 text-lg leading-relaxed">{data.profile.bio}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-slate-400 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-indigo-400" />
                                <span className="text-slate-200 font-semibold">{data.profile.followers}</span> followers
                                <span className="mx-1">·</span>
                                <span className="text-slate-200 font-semibold">{data.profile.following}</span> following
                            </div>
                            {data.profile.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-emerald-400" />
                                    {data.profile.location}
                                </div>
                            )}
                            {data.profile.company && (
                                <div className="flex items-center gap-1.5">
                                    <Building className="w-4 h-4 text-blue-400" />
                                    {data.profile.company}
                                </div>
                            )}
                            {data.profile.blog && (
                                <a href={data.profile.blog.startsWith('http') ? data.profile.blog : `https://${data.profile.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                                    <LinkIcon className="w-4 h-4" />
                                    Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Heatmap Section */}
                <section>
                    <Heatmap data={data.contributions} />
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-full">
                        <LanguageChart languages={data.languages} />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <RepoList repos={data.topRepos} />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <ActivityTimeline initialEvents={data.events} login={data.profile.login} />
                    </div>
                </div>
            </main>
        </div>
    );
}
