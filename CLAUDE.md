# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Simple Inline Calculator is a React-based web application providing a Spotlight-style calculator with keyboard-first workflow, live calculation results, and themeable UI. Built with React 19, TypeScript, and Vite with the React Compiler enabled.

## Development Commands

**Package Manager:** `pnpm` (required, lockfile present)

- `pnpm install` — Install dependencies
- `pnpm dev` — Start Vite dev server with HMR (default port 5173)
- `pnpm lint` — Run ESLint across the project
- `pnpm preview` — Serve the production build locally

**Note:** DO NOT run `pnpm build` as a dev server is always running and will conflict.

## Architecture

### Core Components

**QuickCalc** (`src/components/QuickCalc.tsx`)
- Main calculator component with input handling, result display, and theme picker
- Handles keyboard shortcuts: Enter to copy result, Escape to clear or close picker
- Manages theme persistence via localStorage with key `qc-theme`
- Uses React Compiler optimizations (useMemo for expensive computations)

**Expression Evaluator** (`src/lib/calc.ts`)
- Safe math expression parser using shunting-yard algorithm
- No eval() usage—custom tokenizer, RPN converter, and evaluator
- Supports: operators (+, -, *, /, ^), functions (sqrt, sin, cos, tan, abs, ln, log, floor, ceil, round), constants (pi, e), unary minus, postfix percent
- Throws errors on invalid expressions, domain errors, or unknown identifiers

**Theme System** (`src/themes.ts`)
- 17 pre-defined themes (Dracula, Tokyo Night, Nord, Solarized, etc.)
- Each theme defines 8 CSS custom properties + layered gradient background
- `getThemeById()` safely retrieves theme by ID with fallback to first theme

### Styling

- Global styles: `src/quickcalc.css`
- CSS custom properties injected via inline styles in QuickCalc component
- Uses modern CSS (backdrop-filter, gradient text with background-clip)
- Responsive layout with mobile-first approach

### Build Configuration

- **Vite:** Uses `rolldown-vite@7.1.14` (overridden in pnpm config)
- **React Compiler:** Enabled via babel-plugin-react-compiler for automatic memoization
- **TypeScript:** Strict mode, separate configs for app (`tsconfig.app.json`) and node (`tsconfig.node.json`)

## Coding Standards

- **Language:** TypeScript with React 19
- **Style:** 2-space indentation, single quotes, no semicolons (match existing code)
- **Components:** PascalCase, functional components with hooks
- **Hooks:** useX naming pattern
- **Utilities:** camelCase, named exports
- **Linting:** ESLint with react-hooks and react-refresh plugins (run before commits)

## Key Behaviors

1. **Expression Parsing:** Input starting with `=` triggers calculation mode
2. **Error Handling:** Invalid expressions show no error while typing (only shows result when valid)
3. **Result Formatting:** Numbers formatted with locale grouping, up to 10 decimals, exponential notation for very large/small values
4. **Copy Flow:** Press Enter when result is visible to copy to clipboard (shows "Copied!" toast)
5. **Theme Picker:** Overlay with backdrop blur, Escape closes, scroll-lock when open

## Special Notes

- React Compiler impacts Vite dev & build performance (intentional tradeoff)
- No testing framework configured yet (recommended: vitest + @testing-library/react)
- All static assets in `public/` are publicly served
- Vite environment variables must be prefixed with `VITE_`

## Conventions from AGENTS.md

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep PRs small and focused with clear descriptions
- Do not change package manager or add dependencies without discussion
- Update this file when adding new commands or restructuring directories
