# Technical Appendix - TunnelSight GAMIS

## A1. Architecture Diagram

```text
Capture Device / Existing Model
  - Phone camera
  - Drone camera
  - Existing GLB/mesh
  - Future point cloud or IFC/BIM source
        |
        v
Data Ingestion
  - Upload images/video/models
  - Validate permissions and file quality
  - Extract frames where needed
        |
        v
Pre-processing
  - Resize/normalise images
  - Clean frames
  - Prepare metadata
  - Store source files
        |
        v
3D Reconstruction or Model Import
  - Current: GLB import into PlayCanvas viewer
  - Planned: SfM/MVS reconstruction pipeline
  - Planned: point-cloud and mesh conversion
        |
        v
Inspection Workspace
  - 3D navigation
  - Markers
  - Selection and box selection
  - Measurement
  - Screenshots
  - Semantic tags
        |
        +---------------------------+
        |                           |
        v                           v
AI Hazard Detection           Manual Expert Review
  - Crack/water/loose rock      - Validate markers
  - Risk confidence             - Correct labels
  - Model outputs               - Add notes
        |                           |
        +-------------+-------------+
                      |
                      v
Risk Scoring and Recommendation
  - Severity ranking
  - Safety actions
  - Inspection priority
  - Human-reviewed guidance
                      |
                      v
Reports, API and Storage
  - Safety summary
  - Screenshot evidence
  - Annotation JSON
  - Project history
  - ZCHPC CCE / hosting
```

## A2. Implemented System Layer

Live demo: https://tunnelsight.applications.co.zw/

Implemented in the live 3D inspection workspace:

- Browser-based 3D model viewer.
- GLB tunnel model loading.
- Fallback scene if model loading fails or user chooses fallback.
- Loading state overlay and model status indicators.
- Risk markers with severity, risk score, and recommendation text.
- Marker selection and multi-selection.
- Box/lasso-style marker selection.
- Marker creation mode.
- Undo/redo for created markers.
- Basic point-to-point measurement.
- Screenshot export.
- Mode-aware input handling so editing tools do not trigger navigation.

## A3. Engineering Workstreams

Development workstreams for the complete TunnelSight AI system:

- Automated hazard detection model.
- 3D reconstruction from raw video/image capture.
- Mesh-surface picking for exact surface points.
- Semantic tagging of actual mesh regions as wall, floor, crown, entrance, etc.
- Backend/API and user authentication.
- Persistent database for projects, scans, tags, and reports.
- Safety recommendation model with expert-review workflow.
- Field validation with legally obtained mine or tunnel data.

## A4. Current Codebase Structure

```text
public_html/
  README.md
  LICENSE
  .env.example
  package.json
  package-lock.json
  index.source.html
  index.html
  src/
    main.js
    style.css
  models/
    positanos_tunnel.glb
    sample-tunnel.glb
    tunnel.glb
  docs/
    POTRAZ/
      formal submission files
    submission/
      PROJECTID_AI4I_Proposal_Development.md
      TECHNICAL_APPENDIX.md
      DATASET_STATEMENT.md
```

## A5. Programming Languages and Frameworks

Current:

- JavaScript.
- HTML/CSS.
- PlayCanvas.
- Vite.

Planned:

- Python for reconstruction and AI experiments.
- OpenCV or similar for image/video preprocessing.
- Open3D for point-cloud processing experiments.
- COLMAP or equivalent SfM/MVS tool for reconstruction experiments.
- PyTorch or TensorFlow for hazard model training after dataset preparation.
- Backend framework to be selected: Django, FastAPI, or Node/Express.

## A6. Data Model Proposal

### Project

```json
{
  "project_id": "string",
  "site_name": "string",
  "created_by": "user_id",
  "created_at": "datetime",
  "data_permission_confirmed": true
}
```

### Scan

```json
{
  "scan_id": "string",
  "project_id": "string",
  "source_type": "video|images|glb|point_cloud",
  "file_paths": [],
  "capture_date": "datetime",
  "processing_status": "uploaded|processing|ready|failed"
}
```

### Annotation / Marker

```json
{
  "marker_id": "string",
  "scan_id": "string",
  "position": [0, 0, 0],
  "semantic_tag": "wall|floor|crown|entrance|hazard|water|crack",
  "severity": "High|Medium|Warning|Info",
  "risk_score": 0,
  "source": "manual|ai|imported",
  "review_status": "unreviewed|accepted|rejected",
  "notes": "string"
}
```

### Measurement

```json
{
  "measurement_id": "string",
  "scan_id": "string",
  "start": [0, 0, 0],
  "end": [0, 0, 0],
  "distance_m": 0,
  "created_by": "user_id"
}
```

## A7. API Endpoint Plan

Planned endpoints:

```text
POST /api/projects
GET  /api/projects/:id
POST /api/scans
GET  /api/scans/:id/status
GET  /api/scans/:id/model
POST /api/scans/:id/annotations
GET  /api/scans/:id/annotations
POST /api/scans/:id/analyse
GET  /api/scans/:id/report
```

## A8. Testing Table

| Component | Test | Status |
|---|---|---|
| Web app build | `npm run build` | Passed |
| JavaScript syntax | `node --check src/main.js` | Passed |
| Production route | HTTPS returns 200 | Passed |
| GLB viewer | Loads model in browser | Implemented |
| Loading UI | Shows load/fallback/error states | Implemented |
| Marker creation | Place marker in marker mode | Implemented |
| Selection | Select and box-select markers | Implemented |
| Measurement | Two-click distance label | Basic implemented |
| Screenshot | Export PNG | Implemented |
| Hazard AI | Classifies hazards | MVP workstream |
| Reconstruction | Builds model from image/video | MVP workstream |

## A9. Engineering Constraints

- The live viewer uses GLB model assets for the browser inspection workspace.
- Selection currently prioritises markers and inspection objects; mesh-face selection is part of the advanced editor workstream.
- Measurement supports inspection points and will be extended to surface-aware measurement.
- Mesh semantics such as wall, entrance, floor and crown are handled through the semantic-tagging workstream.
- Hazard classification requires labelled validation data before performance metrics are reported.
- Backend persistence is specified through the API and data-model architecture.

## A10. Operational Governance

TunnelSight AI is designed as a professional inspection and decision-support workflow. Hazard markers, measurements and AI outputs are routed through expert review so that mining, geological and geotechnical judgement remains part of operational decision-making.
