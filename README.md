# TunnelSight AI: Intelligent 3D Subsurface Mapping and Risk Prediction System

TunnelSight is an early-stage web prototype for AI-assisted underground mine and tunnel inspection. The current build demonstrates an interactive 3D viewer, risk markers, marker editing, selection tools, screenshot capture, loading states, and basic point-to-point measurement.

Live demo: https://tunnelsight.applications.co.zw/

## Current Prototype Status

Working:

- Web-based 3D tunnel viewer using PlayCanvas.
- GLB model loading with fallback scene.
- Loading, ready, error, and fallback UI states.
- Seeded risk markers with severity, risk score, and recommendations.
- Marker selection, multi-selection, and box/lasso-style selection.
- Marker creation mode.
- Undo/redo for created markers.
- Basic point-to-point measurement in the viewer.
- Screenshot export.

Partially implemented:

- Semantic tagging foundation through marker metadata.
- Risk visualisation through manually seeded/placed markers.
- Measurement uses marker points or a ground-plane pick point, not yet full mesh-surface picking.

Planned:

- Real mesh picking and semantic surface tagging.
- Automated hazard detection model.
- 3D reconstruction pipeline from images/video.
- Risk scoring model validation.
- Human-reviewed strategy recommendation module.
- Backend/API, authentication, project storage, and dataset management.

## Tech Stack

- JavaScript
- Vite
- PlayCanvas
- HTML/CSS

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production site is served from this directory:

```text
/home/tunnelsight.applications.co.zw/public_html
```

## Important Safety Note

This prototype is a decision-support tool only. It is not validated for autonomous mine-safety decisions and must not replace inspection by qualified mining, geological, or geotechnical professionals.
