import { Response } from 'express';
import { githubService } from './github.service';

// Poll every 30 seconds to respect GitHub API limits (5000 requests/hour)
// 5000 / 30 * 24 = ~4 requests per user per minute is safe for a demo.
// In production, we'd use Webhooks for "User" events, but for "Public" events polling is capable.
const POLL_INTERVAL = 30000;

/**
 * Service to manage Server-Sent Events (SSE) for real-time GitHub activity updates.
 * Uses a polling mechanism on the backend to fetch new events and push them to connected clients.
 * This avoids the need for clients to poll, saving bandwidth and request overhead.
 */
class SseService {
    // Map of username -> list of connected client response objects
    private clients: Map<string, Response[]> = new Map();
    // Map of username -> polling interval timer
    private timers: Map<string, NodeJS.Timeout> = new Map();
    // Map of username -> ID of the most recent event seen (deduplication)
    private lastEventIds: Map<string, string> = new Map();

    /**
     * Registers a new SSE client for a specific GitHub user.
     */
    addClient(username: string, res: Response) {
        const key = username.toLowerCase();

        // 1. Initialize client list and polling if this is the first listener for this user
        if (!this.clients.has(key)) {
            this.clients.set(key, []);
            this.startPolling(key);
        }

        // 2. Add the new response object to the list of active clients
        const userClients = this.clients.get(key)!;
        userClients.push(res);

        // 3. Send initial connection confirmation
        // "data: " prefix is required by SSE spec
        res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

        // 4. Handle client disconnection (tab close, network error)
        res.on('close', () => {
            console.log(`SSE client disconnected for ${key}`);
            this.removeClient(key, res);
        });
    }

    /**
     * Removes a client and stops polling if no clients remain for a user.
     */
    removeClient(key: string, res: Response) {
        const userClients = this.clients.get(key);
        if (!userClients) return;

        const index = userClients.indexOf(res);
        if (index !== -1) {
            userClients.splice(index, 1);
        }

        // If no more clients are listening to this user, stop the background poller
        // to save resources and API quota.
        if (userClients.length === 0) {
            console.log(`No listeners left for ${key}, stopping polling.`);
            this.stopPolling(key);
            this.clients.delete(key);
            this.lastEventIds.delete(key);
        }
    }

    private startPolling(username: string) {
        if (this.timers.has(username)) return;

        console.log(`Starting polling for ${username}`);

        // Initial fetch to set the "latest seen" baseline.
        // We only want to alert on *new* events that happen after connection.
        githubService.getEvents(username).then(events => {
            if (events.length > 0) {
                this.lastEventIds.set(username, events[0].id);
            }
        }).catch(err => console.error(`Failed initial fetch for ${username}`, err));

        const timer = setInterval(async () => {
            try {
                const events = await githubService.getEvents(username);
                if (!events || events.length === 0) return;

                const lastId = this.lastEventIds.get(username);
                const newEvents = [];

                // GitHub returns events sorted by Date DESC (newest first).
                // Iterate through them until we hit the 'lastId' we saw.
                for (const event of events) {
                    if (event.id === lastId) break;
                    newEvents.push(event);
                }

                if (newEvents.length > 0) {
                    console.log(`Found ${newEvents.length} new events for ${username}`);

                    // Update baseline to the very newest event
                    this.lastEventIds.set(username, newEvents[0].id);

                    // Broadcast to all active clients for this username
                    const payload = JSON.stringify({ type: 'NEW_ACTIVITY', data: newEvents });
                    const clients = this.clients.get(username) || [];

                    // Send to all connected streams
                    clients.forEach(client => {
                        // Check if connection is still writable
                        if (!client.writableEnded) {
                            client.write(`data: ${payload}\n\n`);
                        }
                    });
                }
            } catch (error) {
                console.error(`Polling error for ${username}:`, error);
                // In production, might want to stop polling after N consecutive errors
            }
        }, POLL_INTERVAL);

        this.timers.set(username, timer);
    }

    private stopPolling(username: string) {
        const timer = this.timers.get(username);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(username);
        }
    }
}

export const sseService = new SseService();
