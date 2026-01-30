import axios from 'axios';

// In production, use env var
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

export interface ProfileData {
    profile: {
        login: string;
        name: string;
        avatar_url: string;
        bio: string;
        public_repos: number;
        followers: number;
        following: number;
        html_url: string;
        type: 'User' | 'Organization';
        location: string | null;
        blog: string | null;
        company: string | null;
    };
    topRepos: {
        id: number;
        name: string;
        description: string;
        stargazers_count: number;
        language: string;
        html_url: string;
    }[];
    languages: {
        language: string;
        percentage: number;
        count: number;
    }[];
    contributions: {
        totalContributions: number;
        weeks: {
            contributionDays: {
                contributionCount: number;
                date: string;
                contributionLevel: string;
            }[];
        }[];
    } | null;
    events: any[];
}

export const fetchProfile = async (login: string): Promise<ProfileData> => {
    const { data } = await api.get<{ data: ProfileData }>(`/profile/${login}`);
    return data.data;
};

export default api;
