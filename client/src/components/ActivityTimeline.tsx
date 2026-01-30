'use client';

import { useEffect, useState, useRef } from 'react';
import { GitCommit, Star, GitPullRequest, FolderPlus, Activity } from 'lucide-react';

interface GitHubEvent {
    id: string;
    type: string;
    actor: {
        login: string;
        avatar_url: string;
    };
    repo: {
        name: string;
        url: string;
    };
    created_at: string;
    payload: any;
}

export default function ActivityTimeline({
    initialEvents,
    login
}: {
    initialEvents: GitHubEvent[];
    login: string;
}) {
    const [events, setEvents] = useState<GitHubEvent[]>(initialEvents);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        // Sync initial events when data changes
        setEvents(initialEvents);
    }, [initialEvents]);

    useEffect(() => {
        const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/activity/stream/${login}`;
        const eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
            setIsLive(true);
            console.log('SSE Connected');
        };

        eventSource.onmessage = (e) => {
            try {
                const parsed = JSON.parse(e.data);

                if (parsed.type === 'CONNECTED') {
                    setIsLive(true);
                } else if (parsed.type === 'NEW_ACTIVITY') {
                    // Prepend new events
                    setEvents((prev) => {
                        const existingIds = new Set(prev.map(ev => ev.id));
                        const uniqueNew = parsed.data.filter((ev: GitHubEvent) => !existingIds.has(ev.id));

                        if (uniqueNew.length === 0) return prev;

                        return [...uniqueNew, ...prev].slice(0, 50); // Keep max 50 items
                    });
                }
            } catch (err) {
                console.error('SSE Error parsing', err);
            }
        };

        eventSource.onerror = (e) => {
            console.error('SSE Error', e);
            setIsLive(false);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [login]);

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'PushEvent': return <GitCommit className="w-4 h-4 text-emerald-400" />;
            case 'WatchEvent': return <Star className="w-4 h-4 text-yellow-400" />;
            case 'PullRequestEvent': return <GitPullRequest className="w-4 h-4 text-purple-400" />;
            case 'CreateEvent': return <FolderPlus className="w-4 h-4 text-blue-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    const getEventMessage = (event: GitHubEvent) => {
        switch (event.type) {
            case 'PushEvent':
                return `Pushed ${event.payload.size || 1} commit(s) to ${event.repo.name}`;
            case 'WatchEvent':
                return `Starred ${event.repo.name}`;
            case 'CreateEvent':
                return `Created repository ${event.repo.name}`;
            case 'PullRequestEvent':
                return `Opened Pull Request in ${event.repo.name}`;
            case 'IssuesEvent':
                return `${event.payload.action} issue in ${event.repo.name}`;
            default:
                return `Activity on ${event.repo.name}`;
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Activity Stream</h3>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-xs text-slate-500">{isLive ? 'LIVE' : 'Connecting...'}</span>
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/30">
                {events.length === 0 && (
                    <div className="text-center text-slate-500 py-4">No recent public activity</div>
                )}
                {events.map((event) => (
                    <div key={event.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="mt-1">{getEventIcon(event.type)}</div>
                        <div>
                            <p className="text-slate-300">{getEventMessage(event)}</p>
                            <p className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
