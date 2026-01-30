import { Octokit } from 'octokit';
import { AppError } from '../utils/AppError';
import {
    GitHubProfile,
    GitHubRepo,
    ContributionCalendar,
    GitHubEvent
} from '../types/github.types';
import dotenv from 'dotenv';

import { env } from '../config/env';

dotenv.config();

class GithubService {
    private octokit: Octokit;

    constructor() {
        this.octokit = new Octokit({
            auth: env.GITHUB_TOKEN,
        });
    }

    private handleRateLimit(error: any) {
        if (error.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
            const resetTime = error.response.headers['x-ratelimit-reset'];
            throw new AppError(`GitHub API rate limit exceeded. Resets at ${new Date(Number(resetTime) * 1000).toLocaleTimeString()}`, 429);
        }
        throw error;
    }

    async getProfile(username: string): Promise<GitHubProfile> {
        try {
            // Try fetching as user first
            const { data } = await this.octokit.request('GET /users/{username}', {
                username,
            });
            return data as GitHubProfile;
        } catch (error: any) {
            if (error.status === 404) {
                // Could be an org, but the endpoint handles both technically?
                // Actually /users/:username returns both users and orgs.
                throw new AppError('User or Organization not found', 404);
            }
            this.handleRateLimit(error);
            throw new AppError('Failed to fetch profile', 500);
        }
    }

    async getRepos(username: string): Promise<GitHubRepo[]> {
        try {
            // Fetch up to 100 repos to get a good sample for stats
            const { data } = await this.octokit.request('GET /users/{username}/repos', {
                username,
                per_page: 100,
                sort: 'updated',
                direction: 'desc'
            });
            return data as GitHubRepo[];
        } catch (error: any) {
            this.handleRateLimit(error);
            return []; // Return empty on error for sub-data to allow partial degradation? 
            // Requirement: "Graceful degradation... Partial responses allowed"
            // But for now let's strict fail or return empty.
        }
    }

    async getContributions(username: string): Promise<ContributionCalendar | null> {
        // GraphQL query for contribution calendar
        const query = `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

        try {
            const response: any = await this.octokit.graphql(query, {
                login: username,
            });
            return response.user?.contributionsCollection?.contributionCalendar || null;
        } catch (error: any) {
            // If it's an Org, 'user' field might be null or error.
            // Orgs don't have contribution graphs this way.
            // We'll return null gracefully.
            console.error('GraphQL Contribution Fetch Error:', error.message);
            return null;
        }
    }

    async getEvents(username: string): Promise<GitHubEvent[]> {
        try {
            const { data } = await this.octokit.request('GET /users/{username}/events/public', {
                username,
                per_page: 20 // Recent activity
            });
            return data as any as GitHubEvent[];
        } catch (error: any) {
            this.handleRateLimit(error);
            return [];
        }
    }
}

export const githubService = new GithubService();
