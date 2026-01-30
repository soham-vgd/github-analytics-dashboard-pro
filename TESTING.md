# How to Test Server-Sent Events (SSE) Live Updates

Since GitHub API doesn't push public events instantly via SSE natively, our backend simulates this by polling the GitHub Events API for specific users.

To verify the live update functionality in your local environment, follow these steps:

## Prerequisites

1. Ensure the backend and frontend are running.
2. Have a GitHub account ready.
3. Ensure your `server/.env` has a valid `GITHUB_TOKEN`.

## Manual Test Steps

1. **Dashboard Navigation**
   - Open the application at [http://localhost:3000](http://localhost:3000).
   - Search for a popular, high-activity user like `torvalds` or `vercel` OR use your own username (easier to control).
   - Wait for the dashboard to load.
   - Verify the "Activity Stream" widget shows "LIVE" with a pulsing green indicator.

2. **Trigger an Event**
   - Go to GitHub.com in a separate tab.
   - Log in to the account you are currently viewing on the dashboard.
   - Perform a "Public" event. The easiest one is to **Star a Repository**.
     - Go to any public repository (e.g., `facebook/react`).
     - Click the **Star** button.

3. **Verify Update**
   - Switch back to your Dashboard tab immediately.
   - Within 30 seconds (the polling interval), you should see a new event appear at the top of the Activity Stream:
     - Icon: Star (Yellow)
     - Text: "Starred facebook/react"
     - Date: "Just now" (or timestamp)

4. **Alternative Method (Curl/Terminal)**
   If you cannot perform an action on the user you are watching, you can simulate an event push if you had access to the backend's internal logic, but since this is black-box testing the dashboard:
   - Pick a very active organization like `vercel` or `microsoft`.
   - Watch the stream.
   - You will likely see real commits or issue updates appearing naturally every few minutes.

## Technical Details

- **Protocol**: HTTP/1.1 (or HTTP/2 in production) Server-Sent Events.
- **Endpoint**: `/api/activity/stream/:login`
- **Logic**: The backend polls GitHub every 30 seconds. It compares the `id` of the latest event with the last seen `id`. If new events are found, it sends a JSON payload with `type: "NEW_ACTIVITY"`.
