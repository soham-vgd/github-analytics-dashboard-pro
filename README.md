# GitHub Analytics Dashboard

A production-grade, fullstack application to visualize GitHub user activity with live updates. Built as a senior engineering hiring assignment.

## 🚀 Live Features

- **Real-time Activity Stream**: Uses Server-Sent Events (SSE) to push new GitHub events to the client without page refreshes.
- **Deep Analytics**:
  - **Contribution Heatmap**: A custom-built, accessible 52-week grid (No heavy charting libraries).
  - **Language Breakdown**: Stacked visualization of top languages.
  - **Top Repositories**: Ranked by stars.
- **Robust Search**: Handles Users, Organizations, and error states (404, Rate Limits).
- **Performance**:
  - **Server-Side Aggregation**: Minimizes frontend network waterfall.
  - **In-Memory Caching**: 5-minute TTL to respect GitHub API limits.
  - **Optimistic UI**: Instant feedback with Skeleton loaders.

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict)
- **State/Fetching**: TanStack Query v5
- **Styling**: Tailwind CSS (Utility-first)
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js & Express
- **Language**: TypeScript (Strict)
- **Real-time**: Native Server-Sent Events (SSE)
- **Validation**: Zod (Env vars & API inputs)
- **Caching**: **Hybrid Strategy** (Redis Primary + In-Memory Fallback) for maximum resilience.

## 🏗 Architecture Highlights

### 1. Robust Hybrid Caching

The application implements a "Tiered" caching strategy to ensure **Zero Downtime**:

- **Primary**: Distributed Redis Key-Value Store (shared across instances).
- **Fallback**: Local LRU-style Memory Cache (if Redis is unreachable).
- **Result**: The dashboard works immediately after `npm run dev` even without a local Redis server, but automatically upgrades to production-grade persistence once Redis is connected.

### 2. Live Updates (SSE)

Instead of heavy WebSockets, we use **Server-Sent Events** (HTTP/1.1) to push updates.

- **Polling Loop**: The backend polls specific GitHub APIs (Events) every 30 seconds (configurable) for connected users.
- **Efficiency**: Only _new_ events are pushed to the client. Using a backend poller allows us to serve thousands of clients while only making 1 request to GitHub per monitored user.

See [DECISIONS.md](./DECISIONS.md) for a detailed breakdown of architectural choices, trade-offs, and alternatives considered.

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token (PAT)

### 1. Backend Setup

```bash
cd server
npm install

# Create environment file
cp .env.example .env
```

**Important:** Open `.env` and add your `GITHUB_TOKEN`. The app _requires_ this for API access.

```bash
# Run in development mode
npm run dev
```

Server runs on `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:3000`.

## 🧪 Testing

This project includes a [TESTING.md](./TESTING.md) guide specifically for verifying the **Live Activity (SSE)** feature.

## 📦 Deployment (Ready)

- **Frontend**: Optimized for Vercel (Edge/Serverless friendly).
- **Backend**: optimized for Railway/Fly.io (Dockerfile ready structure).

## 🔒 Security & Code Quality

- **Rate Limiting**: Backend handles 403s gracefully and uses caching to prevent abuse.
- **Type Safety**: Shared interfaces and strict TS config.
- **Environment**: Zod validation ensures the app doesn't start with missing configs.
- **Error Handling**: Centralized formatting for consistent API responses.
