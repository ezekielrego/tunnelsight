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

## A2. What Is Already Built

Live demo: https://tunnelsight.applications.co.zw/

Implemented in the current prototype:

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

## A3. What Is Still Proposed

Not yet complete:

- Automated hazard detection model.
- 3D reconstruction from raw video/image capture.
- Mesh-surface picking for exact surface points.
- Semantic tagging of actual mesh regions as wall, floor, crown, entrance, etc.
- Backend/API and user authentication.
- Persistent database for projects, scans, tags, and reports.
- Validated safety recommendation model.
- Field validation with real mine data.

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
  assets/
    built JavaScript and CSS assets
  docs/
    submission/
      PROJECTID_AI4I_Proposal_Development.md
      TECHNICAL_APPENDIX.md
      DATASET_STATEMENT.md
      SUBMISSION_CHECKLIST.md
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
| Hazard AI | Classifies hazards | Planned |
| Reconstruction | Builds model from image/video | Planned |

## A9. Known Technical Limitations

- The current model is loaded from an existing GLB file; image/video-to-3D reconstruction is not yet implemented.
- Current selection operates on markers, not true mesh faces.
- Current measurement uses marker positions or a ground-plane point; exact mesh-surface measurement is planned.
- The system does not yet automatically know mesh semantics such as wall, entrance, floor, or crown.
- No validated AI hazard classifier is currently deployed.
- No backend database is currently connected.

## A10. Safety Disclaimer

The current prototype is not a certified safety system. All hazard markers, measurements, and future AI outputs must be reviewed by qualified mining, geological, or geotechnical professionals before any operational decision is made.

