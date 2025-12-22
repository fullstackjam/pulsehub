# Project Context

## Purpose
PulseHub is a frontend-only dashboard that aggregates real-time hot topics from major Chinese platforms in one view and highlights cross-platform overlap.

## Tech Stack
- React 18 + TypeScript with Vite
- Tailwind CSS for styling and animations in `src/index.css`
- Node.js 18+ toolchain with npm scripts for dev/build/lint
- Dockerfile and Helm chart for container/Kubernetes deployments; static-hosting friendly (Vercel/Netlify/etc.)

## Project Conventions

### Code Style
- ESLint config: `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `plugin:react-hooks/recommended`; `@typescript-eslint/no-unused-vars` warns (ignores `_` args); `no-explicit-any` allowed.
- TypeScript compiler is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `moduleResolution: bundler`, `jsx: react-jsx`).
- React function components with hooks; prefer inline Tailwind utility classes; theme handled via `ThemeContext`.
- `react-hooks/exhaustive-deps` is disabled; drag/drop and refresh handlers are intentionally not memoized.

### Architecture Patterns
- Pure SPA: all data fetched client-side from https://60s.viki.moe via `ApiService` using fetch with AbortController timeout (9s) and exponential retry helper.
- `ApiService` centralizes endpoint mapping, URL templates, hot-score normalization, and aggregated-topic generation across platforms.
- `App` owns platform state and bulk refresh; `Dashboard` handles layout, drag-and-drop ordering, per-card refresh; `PlatformCard` renders topics; theme toggle via context provider.
- No backend/proxy services; deploy as static assets or container/K8s via provided Dockerfile/Helm chart.

### Testing Strategy
- No automated tests currently. Run `npm run lint` and `npm run build` before PRs/releases.
- Manual checks: `npm run dev`, verify per-platform fetch/refresh, drag-and-drop ordering, theme toggle, and aggregated topics when overlaps exist.

### Git Workflow
- Default branch: `main`; develop on short-lived feature branches (e.g., `feature/<name>`).
- Use PRs for review; keep commits focused; rebase/squash as needed.
- Run lint/build locally before merging; avoid force-pushing shared branches.

## Domain Context
- Platforms: Weibo, Douyin, Bilibili, Zhihu, Baidu Hot Search, Toutiao via 60s API; also an "Aggregated Hot Topics" list when a title appears on 2+ platforms.
- Each topic includes title, rank, derived hot score (fallback when source omits it), and search URL template per platform.
- UI emphasizes glassmorphism, gradients, responsive grid, animations, drag-and-drop ordering, per-card refresh, and light/dark theme toggle.

## Important Constraints
- Frontend-only: all API calls originate from the user's browser/IP; no server secrets or proxy available.
- Handle upstream latency/failure gracefully: fetch timeout ~9s, up to 2 retries with exponential backoff on retryable errors, per-card error messaging.
- CORS must stay enabled on upstream; avoid adding dependencies that require server-side work.
- Aggregated view only renders when overlapping topics exist across multiple platforms.

## External Dependencies
- 60s hot topics API at `https://60s.viki.moe` (endpoints: `/v2/weibo`, `/v2/douyin`, `/v2/bili`, `/v2/zhihu`, `/v2/baidu/hot`, `/v2/toutiao`); requests use User-Agent `PulseHub/1.0.0`.
- Static hosting providers (Vercel/Netlify/GitHub Pages/Cloudflare Pages) or Docker/Kubernetes via Helm chart for production delivery.
- Browser Fetch API and Intl formatters (DateTimeFormat, RelativeTimeFormat) for timestamp display.
