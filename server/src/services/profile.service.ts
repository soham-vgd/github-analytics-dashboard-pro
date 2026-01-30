import { githubService } from './github.service';
import { cacheService } from './cache.service';
import { AppError } from '../utils/AppError';
import { GitHubRepo } from '../types/github.types';

const CACHE_TTL = 300; // 5 minutes

export class ProfileService {

    private processLanguages(repos: GitHubRepo[]) {
        const counts: Record<string, number> = {};
        let total = 0;

        repos.forEach(repo => {
            if (repo.language) {
                counts[repo.language] = (counts[repo.language] || 0) + 1;
                total++;
            }
        });

        const stats: { language: string; percentage: number; count: number }[] = [];
        for (const [lang, count] of Object.entries(counts)) {
            stats.push({
                language: lang,
                count,
                percentage: Math.round((count / total) * 100)
            });
        }

        return stats.sort((a, b) => b.count - a.count);
    }

    async getFullProfile(username: string) {
        const cacheKey = `profile:${username.toLowerCase()}`;
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            console.log(`Cache hit for ${username}`);
            return cached;
        }

        console.log(`Cache miss for ${username}, fetching from GitHub...`);

        try {
            // Fetch core profile first to validate existence
            const profile = await githubService.getProfile(username);

            // Fetch others in parallel
            const [repos, contributions, events] = await Promise.all([
                githubService.getRepos(username),
                githubService.getContributions(username),
                githubService.getEvents(username)
            ]);

            // Process Data
            const topRepos = [...repos]
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 6);

            const languages = this.processLanguages(repos);

            const data = {
                profile,
                topRepos,
                languages,
                contributions, // Can be null if org
                events
            };

            await cacheService.set(cacheKey, data, CACHE_TTL);
            return data;

        } catch (error: any) {
            throw error;
        }
    }
}

export const profileService = new ProfileService();
