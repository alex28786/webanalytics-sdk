# Adobe Analytics Shim Project Documentation

## Overview
This project maps legacy Adobe Analytics (AppMeasurement) logic and `pageData` layers to the Adobe Experience Platform (AEP) Web SDK XDM format. It serves as a bridge (shim) to allow legacy data collection to function with modern AEP infrastructure, specifically fixing CJA compliance verification.

## Architecture
- **Type**: JavaScript IIFE (Immediately Invoked Function Expression)
- **Target**: Browser (Adobe Launch/Tags) & Node.js (Unit Testing)
- **Bundler**: Rollup
- **Testing**: Vitest + happy-dom

## Key Components
- **Global Objects**: `window.s` (AppMeasurement stub), `window.pageDataTracker` (Logic).
- **Core modules**:
  - `tracker.js`: Main tracking logic (`trackPageLoad`, `trackEvent`).
  - `mapper.js`: **CRITICAL**. Maps `s` variables to XDM.
    - **CJA FIX**: `productListItems` MUST be at XDM root (`xdm.productListItems`), NOT inside `commerce`.
- **Legacy Support**:
  - `s-code.js`: Emulates `AppMeasurement.js`.
  - `plugins.js`: Ports `s.apl`, `s.getValOnce`, etc.

## Data Flow
1. **Init**: `index.js` initializes `window.s` and `window.pageDataTracker`.
2. **Collect**: Legacy code calls `s.t()` or `s.tl()`, or usage of `pageDataTracker`.
3. **Map**: `s_mapIntoXdm(s)` converts legacy vars (`eVar`, `prop`, `events`) into XDM.
4. **Send**: (External) `alloy("sendEvent", { xdm })` is called with the mapped result.

## Development
- `npm install`: Install dependencies.
- `npm run build`: Generate `dist/shim.min.js`.
- `npm test`: Run unit tests.
