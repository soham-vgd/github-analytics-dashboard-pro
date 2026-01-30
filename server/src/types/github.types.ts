export interface GitHubProfile {
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    html_url: string;
    type: 'User' | 'Organization';
    location: string | null;
    blog: string | null;
    company: string | null; // For users
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
    fork: boolean;
    updated_at: string;
}

export interface ContributionDay {
    contributionCount: number;
    date: string;
    contributionLevel: string; // "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE"
}

export interface ContributionWeek {
    contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
    totalContributions: number;
    weeks: ContributionWeek[];
}

export interface LanguageStats {
    [language: string]: number; // Percentage or count, likely count first then aggregated
}

export interface GitHubEvent {
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
