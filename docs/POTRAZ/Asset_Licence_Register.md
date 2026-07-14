# Asset and Licence Register

Project: TunnelSight AI: Intelligent 3D Subsurface Mapping and Risk Prediction System

Date: 2026-07-14

This register should be updated before final submission if new datasets, models, plugins, APIs, images, videos, or libraries are added.

| Asset | Source or owner | Licence/status | Intended use | Notes |
| --- | --- | --- | --- | --- |
| Application source code | Project team | Proprietary unless a separate open-source licence is selected | Core product and MVP development | Repository includes an all-rights-reserved licence notice. |
| TunnelSight web system | Project team | Proprietary unless otherwise stated | Live 3D viewer, markers, measurement, selection, screenshots and UI workflow | Hosted at `https://tunnelsight.applications.co.zw/`. |
| PlayCanvas engine | Third party | Open-source licence to be confirmed from upstream before final submission | Browser-based 3D rendering and interaction | Used by the current frontend system. |
| Vite | Third party | Open-source licence to be confirmed from upstream before final submission | Frontend build tooling | Used for local development and production builds. |
| GLB model assets | Project/demo assets | Ownership and licence to be confirmed before final submission | 3D tunnel/mining visualization | Confidential or unlicensed model assets are excluded from public release. |
| Runtime risk markers | Project team | Synthetic/demo data | Demonstrates marker overlays and safety-report workflow | These are not validated mine-safety detections. |
| User-created marker data | User/uploader | Permission required from uploader/site owner | Future field annotations and review notes | Add consent checkbox before accepting real site data. |
| Controlled mine images/videos | To be captured by team or partner | Written permission required | Future reconstruction and hazard testing | Must separate real site data from demo/synthetic data. |
| Synthetic tunnel imagery | Project team or generated assets | Generation/tool terms to be recorded | Model prototyping and UI testing | Must be disclosed as synthetic. |
| Public mining/geology datasets | To be selected | Dataset licence must permit intended use | Baseline training/testing where appropriate | Do not list a dataset in the proposal until it is actually chosen and checked. |
| COLMAP | Third party | Open-source licence to be confirmed from upstream before final submission | Structure-from-Motion reconstruction testing | Reconstruction workstream dependency. |
| Open3D | Third party | Open-source licence to be confirmed from upstream before final submission | Point-cloud and mesh processing | 3D processing workstream dependency. |
| Future hazard model weights | Project team or selected base model | Licence/status to be recorded before use | Crack, loose rock, water, unsupported roof or related hazard classification | No trained validated hazard model is currently claimed. |
| Map/location APIs | Not currently required | Provider terms required if added | Future GIS/location context | Avoid exposing sensitive mine locations without permission. |

## Submission Notes

- Do not claim ownership of third-party libraries, models, datasets or images.
- Do not include real mine images, scans, coordinates or production information unless the team has written permission.
- Keep generated, simulated and real-world data clearly separated in the repository and in the proposal.
- Before final PDF submission, replace "to be confirmed" entries with checked licence names and links where applicable.
