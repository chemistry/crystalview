# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@chemistry/crystalview** — Crystal structure 3D visualization library. Renders crystal unit cells, atoms, bonds, and polyhedra on HTML5 canvas.

**Repository:** `chemistry/crystalview`
**Default Branch:** `master`
**Package:** Single npm library

## Development Commands

```bash
npm install              # Install dependencies
npm run build            # Build library (tsc + copy CSS)
npm test                 # Run Vitest unit tests
npm run type-check       # TypeScript checking
npm run lint             # ESLint
npm run format:check     # Prettier check
npm run verify           # Full pipeline: type-check + lint + build + test
```

## Architecture

```
src/
├── camera/              # Camera projection and controls
├── molecule3d/          # 3D molecular model (atoms, bonds, cells)
├── painter/             # Canvas 2D rendering engine
├── ui/                  # UI controls and overlays
├── crystal-view.ts      # Main CrystalView component
├── crystal-view.css     # Component styles
└── index.ts             # Public API exports
```

### Key Patterns

- **HTML5 Canvas 2D** rendering (no WebGL dependency)
- **Camera system** with rotation, zoom, and projection
- **Painter abstraction** for drawing primitives (spheres, cylinders, polygons)
- ES2024 target, ESNext modules, bundler moduleResolution

### Key Dependencies

- `@chemistry/elements` — Atomic radii and colors
- `@chemistry/math` — Vector/matrix operations
- `@chemistry/space-groups` — Symmetry operations

## Testing

- **Framework:** Vitest with jsdom environment
- **Pattern:** `*.test.ts` colocated with source

## Publishing

Published to npm as `@chemistry/crystalview`. **Never run `npm publish` manually** — tag `v*` and push to trigger the release pipeline.

## Standards

See [root CLAUDE.md](../../CLAUDE.md) for tech standards and [showcase CLAUDE.md](../CLAUDE.md) for portfolio workflow rules.
