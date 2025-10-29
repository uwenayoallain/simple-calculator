# Repository Guidelines

## Project Structure & Module Organization
- `src/` — React + TypeScript source. Entry `src/main.tsx`; root component `src/App.tsx`. Global styles in `src/index.css`; co-locate component styles (e.g., `App.css`).
- `public/` — static assets served as-is.
- Root — `index.html`, `vite.config.ts`, `eslint.config.js`, `tsconfig.*`, `package.json`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies.
- `pnpm dev` — start Vite dev server with HMR.
- `pnpm build` — type-check and create production build in `dist/`.
- `pnpm preview` — serve the production build locally.
- `pnpm lint` — run ESLint across the project.

## Coding Style & Naming Conventions
- Language: TypeScript + React 19; 2-space indentation; single quotes; no semicolons. Match existing style in `src/`.
- Components: `PascalCase` in `.tsx`. Hooks: `useX` naming in `.ts(x)`. Utilities: `camelCase` in `.ts`.
- Prefer functional components and hooks. Default export for a single component file is OK; utilities should use named exports.
- Linting via `eslint.config.js` (includes react-hooks and refresh). Fix lint issues before committing.

## Testing Guidelines
- Tests are not configured yet. Recommended stack: `vitest` + `@testing-library/react`.
- Place tests next to code (`Button.test.tsx`) or under `src/__tests__/`.
- Suggested scripts to add when tests are introduced:
  - `test`: `vitest`
  - `test:watch`: `vitest --watch`

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- PRs should include: clear description, linked issues, screenshots/gifs for UI changes, and steps to validate (`pnpm dev`, `pnpm preview`). Keep PRs small and focused.

## Security & Configuration Tips
- Use Node 18+ and `pnpm` (lockfile present). Do not commit secrets—everything in `public/` is publicly served.
- Vite env vars must be prefixed `VITE_` (e.g., `VITE_API_URL`).

## Agent-Specific Notes
- Do not change the package manager or script names without discussion. Avoid adding dependencies unless necessary and documented. Update this file if you add new commands or restructure directories.

