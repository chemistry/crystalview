# CrystalView
[![GitHub Build Status](https://github.com/chemistry/crystalview/workflows/CI/badge.svg)](https://github.com/chemistry/crystalview/actions?query=workflow%3ACI)
[![License: MIT](https://img.shields.io/badge/License-MIT-gren.svg)](https://opensource.org/licenses/MIT)

Simple Crystal Viewer - v1

## How to use
```javascript
import { Mol3DView }  from '@chemistry/crystalview';
import structure from './1000004';

$(() => {
    let viewer = new Mol3DView({
        bgcolor: "#2b303b"
    });
    var element = document.getElementById('app');
    viewer.append(element);
    viewer.onInit();

    try {
        viewer.load(structure);
    } catch(e) {
    }
});
```

## Quick start:
  * Run unit tests: `npm run test`
  * Start TDD flow: `npm run tdd`
  * Run linter verification: `npm run lint`
  * Run linter verification & fix: `npm run lintfix`
  * Build project: `npm run build`

## Release
```bash
git tag v1.0.0
git push --tags
```

## License
  This project is licensed under the MIT license, Copyright (c) 2020 Volodymyr Vreshch.
  For more information see [LICENSE.md](https://github.com/chemistry/crystalview/blob/master/LICENSE).
