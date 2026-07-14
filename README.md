# TunnelSight AI: Intelligent 3D Subsurface Mapping and Risk Prediction System

TunnelSight AI is a 3D subsurface mapping, inspection and risk-prediction system for underground mining, tunnels and related infrastructure. It combines an interactive browser-based 3D workspace with spatial measurement, risk markers, inspection evidence capture and an AI architecture for hazard detection, reconstruction and safety intelligence.

Live system: https://tunnelsight.applications.co.zw/

Formal POTRAZ / Development Track package:

```text
docs/POTRAZ/
```

## System Capability Areas

- 3D tunnel and subsurface model visualisation.
- Smooth viewer navigation for engineering inspection.
- Risk-marker placement, selection and review.
- Point-to-point spatial measurement.
- Screenshot and visual evidence capture.
- Loading, fallback and operational UI states.
- AI hazard-detection architecture for cracks, water ingress, loose rock and unsupported zones.
- 3D reconstruction workflow design for images, video, meshes and point-cloud inputs.
- Dataset, compliance, asset-register and technical architecture documentation.

## Technology Stack

- JavaScript.
- Vite.
- PlayCanvas.
- HTML/CSS.
- GLB model assets.
- Planned AI/reconstruction stack: Python, OpenCV, Open3D, COLMAP/SfM-MVS tooling and a lightweight hazard-classification model.

## Repository Structure

```text
src/
  app/
    application orchestration and event wiring
  config/
    model paths, mode labels, panel content and inspection seed data
  controls/
    camera orbit, pan, zoom and animated framing controls
  scene/
    PlayCanvas app bootstrap, grid, model loading, fallback scene and framing
  tools/
    marker, selection, measurement and screenshot tools
  ui/
    DOM references and UI state rendering
  utils/
    shared formatters
  styles/
    base, overlay, panel, toolbar and responsive styles
  main.js
  style.css
models/
  tunnel and sample GLB assets
docs/
  POTRAZ/
  submission/
index.source.html
package.json
package-lock.json
```

## Development Track Position

TunnelSight AI is submitted as a Development Track product with a live 3D inspection workspace and a documented architecture for the complete AI-assisted mining intelligence workflow: capture, reconstruction, visual inspection, hazard detection, risk scoring, reporting and expert review.
