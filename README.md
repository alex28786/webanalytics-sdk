# WebAnalytics SDK

Shim to translate legacy Adobe Analytics logic to AEP Web SDK XDM.

## Folder Structure

- `src/`: Source code for the shim.
  - `core/`: Core logic (tracker, etc.).
  - `legacy/`: Legacy support modules (s-code, rules, data-elements).
  - `xdm/`: XDM mapping logic.
  - `index.js`: Main entry point.
- `legacy/`: Contains the original legacy big .js file (reference implementation).
- `dist/`: Built artifacts.

## Features

### Data Elements & Rules
Data elements and rules are codified in `src/legacy/data-elements.js` and `src/legacy/rules.js`.

**Overrides**:
You can override internal data elements and rules at runtime by defining them in `window._satellite`.
- **Data Elements**: If `_satellite.getVar(name)` returns a value, it is used instead of the internal definition.
- **Rules**: If `_satellite.getVar(eventName)` returns a rule object, it is used instead of the internal rule.

### Media Module
Support for legacy Media module calls (`s.Media.open`, `s.Media.play`, etc.) is included. Video tracking checks are mapped to XDM media events where possible or stored in context data.

## Build

```bash
npm install
npm run build
```

## Testing

```bash
npm test
```
