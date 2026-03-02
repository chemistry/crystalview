# CrystalView

[![GitHub Build Status](https://github.com/chemistry/crystalview/workflows/CI/badge.svg)](https://github.com/chemistry/crystalview/actions?query=workflow%3ACI)
[![npm version](https://img.shields.io/npm/v/@chemistry/crystalview)](https://www.npmjs.com/package/@chemistry/crystalview)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Crystal structure visualization library for the browser. Renders 3D molecular and crystal structures on an HTML5 canvas.

![CrystalView](https://github.com/chemistry/crystalview/blob/master/crystalview.png?raw=true)

## Installation

```bash
npm install @chemistry/crystalview
```

## Usage

```typescript
import { Mol3DView } from '@chemistry/crystalview';
import '@chemistry/crystalview/crystalview.css';

const container = document.getElementById('viewer')!;

const viewer = new Mol3DView({ bgcolor: '#2b303b' });
viewer.append(container);
viewer.onInit();
viewer.load(structureData);
```

## Tech Stack

- TypeScript 5.9, ES2024 target, ESM
- Vitest for testing, 70%+ coverage
- ESLint 10 (flat config) + Prettier
- Native `tsc` build (no bundler)
- Node.js 22+

## Commands

| Command                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `npm run build`        | Build the library                                             |
| `npm run test`         | Run unit tests                                                |
| `npm run lint`         | Run ESLint                                                    |
| `npm run format:check` | Check Prettier formatting                                     |
| `npm run type-check`   | Run TypeScript type checking                                  |
| `npm run verify`       | Full verification (type-check + lint + format + test + build) |

## Showcase App

A Vite-based demo is available in `showcase/`:

```bash
cd showcase
npm install
npm run dev
```

## Release

```bash
git tag v3.0.1
git push --tags
```

The `release.yml` GitHub Action will publish to npm and create a GitHub Release automatically.

## License

This project is licensed under the MIT license, Copyright (c) 2025 Volodymyr Vreshch.
For more information see [LICENSE](https://github.com/chemistry/crystalview/blob/master/LICENSE).
