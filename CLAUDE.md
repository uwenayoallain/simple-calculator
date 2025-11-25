# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Simple Inline Calculator is a React-based web application providing a Spotlight-style calculator with keyboard-first workflow, live calculation results, and themeable UI. Built with React 19, TypeScript, and Vite with the React Compiler enabled.

## Development Commands

**Package Manager:** `pnpm` (required, lockfile present)

- `pnpm install` — Install dependencies
- `pnpm dev` — Start Vite dev server with HMR (default port 5173)
- `pnpm build` — Type-check and build for production
- `pnpm lint` — Run ESLint across the project
- `pnpm preview` — Serve the production build locally
- `pnpm test` — Run Vitest test suite once
- `pnpm test:watch` — Run Vitest in watch mode

**Note:** Avoid running `pnpm build` when dev server is running to prevent port conflicts.

## Architecture

### Core Components

**QuickCalc** (`src/components/QuickCalc.tsx`)
- Main calculator component with input handling, result display, and theme switcher
- Keyboard shortcuts: Enter to copy result, Escape to clear or close modal, `?` to toggle help
- Manages theme persistence via localStorage with key `qc-theme` (dark/light mode)
- URL query parameters: `?q=expression` for shareable calculator state
- Uses React Compiler optimizations and GSAP for animations
- Integrated with @vercel/analytics for usage tracking

**Expression Evaluator** (`src/lib/calc.ts`)
- Safe math expression parser using shunting-yard algorithm
- No eval() usage—custom tokenizer, RPN converter, and evaluator
- Operators: `+`, `-`, `*`, `/`, `^` (power), `%` (postfix percent)
- Functions: sqrt, cbrt, sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, abs, ln, log, log2, exp, floor, ceil, round, deg, rad
- Constants: pi, tau, e, phi
- Supports unary minus, implicit multiplication (e.g., `2pi`), and `of` keyword (e.g., `45% of 120`)
- Throws errors on invalid expressions, domain errors, or unknown identifiers

**Theme System** (`src/index.css` and `src/components/QuickCalc.tsx`)
- Three-way theme toggle: system preference (default) → dark → light → system
- Theme preference persisted to localStorage as `qc-theme` ('system', 'dark', or 'light')
- System preference automatically detects and follows OS color scheme
- Each theme defines CSS custom properties in `src/index.css` (--bg-primary, --bg-elevated, --text-primary, --accent, etc.)
- Applied via `[data-theme="dark"]` and `[data-theme="light"]` attribute on root element
- Note: `src/themes.ts` contains legacy theme definitions not currently used

### Styling

- Global styles: `src/index.css` (theme variables, resets, base styles)
- Component styles: `src/quickcalc.css` (calculator-specific styles)
- CSS custom properties define theme colors, applied dynamically via data attributes
- Uses modern CSS (backdrop-filter, gradient text with background-clip)
- Responsive layout with mobile-first approach
- GSAP for entrance animations and modal transitions

### Build Configuration

- **Vite:** Uses `rolldown-vite@7.2.7` as main dependency with `7.1.14` override in pnpm config
- **React Compiler:** Enabled via babel-plugin-react-compiler for automatic memoization
- **TypeScript:** Strict mode with `noUnusedLocals` and `noUnusedParameters`, separate configs for app (`tsconfig.app.json`) and node (`tsconfig.node.json`)

## Coding Standards

- **Language:** TypeScript with React 19
- **Style:** 2-space indentation, single quotes, no semicolons (match existing code)
- **Components:** PascalCase, functional components with hooks
- **Hooks:** useX naming pattern
- **Utilities:** camelCase, named exports
- **Linting:** ESLint with react-hooks and react-refresh plugins (run before commits)

## Key Behaviors

1. **Expression Parsing:** Input starting with `=` triggers calculation mode (optional prefix)
2. **Error Handling:** Invalid expressions show no error while typing (only shows result when valid)
3. **Result Formatting:** Numbers formatted with locale grouping, up to 10 decimals, exponential notation for very large/small values
4. **Copy Flow:** Press Enter when result is visible to copy to clipboard (shows "Copied!" toast)
5. **Help Modal:** Press `?` to open Quick Reference guide showing all functions and constants
6. **Shareable State:** URL query parameter `?q=expression` allows sharing calculator state
7. **Theme Toggle:** Three-way cycle button (system → dark → light) with automatic system preference detection

## Special Notes

- React Compiler impacts Vite dev & build performance (intentional tradeoff)
- Testing: Vitest configured with `pnpm test` and `pnpm test:watch` commands
- GSAP used for timeline animations (page entrance, modal transitions)
- Analytics integrated via @vercel/analytics for usage tracking
- All static assets in `public/` are publicly served
- Vite environment variables must be prefixed with `VITE_`

## Conventions from AGENTS.md

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep PRs small and focused with clear descriptions
- Do not change package manager or add dependencies without discussion
- Update this file when adding new commands or restructuring directories
