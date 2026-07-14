# COVER PAGE

**Project Title:** TunnelSight AI: Intelligent 3D Subsurface Mapping and Risk Prediction System  
**Track Name:** Development Track  
**Team Name:** 3D-Labs  
**Lead Innovator:** Ezekiel Rego  
**Project ID:** [Insert Project ID]  
**Demo URL:** https://tunnelsight.applications.co.zw/  
**Repository URL:** https://github.com/ezekielrego/tunnelsight  
**Date:** July 2026

---

# SECTION 1: PROBLEM DEFINITION AND STRATEGIC ALIGNMENT

## 1.1 Problem Statement

Zimbabwe's mining sector faces persistent safety, efficiency, and planning challenges because many operators have limited access to real-time geological and spatial intelligence. Small-to-medium scale miners often depend on manual inspections, outdated maps, isolated photographs, and expert judgement under hazardous conditions.

This creates operational risks including:

- Poor visibility of tunnel geometry and structural change.
- Delayed identification of cracks, unstable zones, water ingress, and unsupported roof/crown areas.
- Limited ability to measure, mark, and communicate risk locations in a shared 3D environment.
- Weak data records for safety review, planning, and regulatory reporting.
- Increased exposure of workers to unsafe underground inspections.

## 1.2 Target Users

- Small-to-medium scale miners.
- Mining engineers, surveyors, and geologists.
- Mine safety officers and inspectors.
- Mining companies seeking digital inspection and operational optimisation.
- Regulatory bodies that require structured safety evidence.

## 1.3 Proposed Solution

TunnelSight AI: Intelligent 3D Subsurface Mapping and Risk Prediction System is a Development Track product for 3D underground inspection, subsurface mapping and risk visualisation. The system is designed to let users capture or upload tunnel data, view a reconstructed 3D environment, mark hazards, measure spatial features, and receive AI-assisted safety insights.

The submitted implementation demonstrates the core 3D inspection workspace: model loading, risk markers, marker creation, selection tools, measurement, screenshots, and operational status handling. The complete product architecture extends this workspace into an AI-assisted mining intelligence workflow covering image/video capture, 3D reconstruction, hazard classification, risk prediction, reporting and expert-reviewed recommendations.

## 1.4 Strategic Alignment

The solution aligns with Zimbabwe's National AI Strategy and industrial digitalisation goals by:

- Applying AI to mining safety and industrial productivity.
- Supporting data-driven decision-making in resource extraction.
- Reducing worker exposure to hazardous inspection conditions.
- Building local AI capability for high-value industrial use cases.
- Supporting future integration with national mining safety systems.

## 1.5 Product Scope

TunnelSight AI is submitted as a Development Track system with a live inspection interface and a defined implementation path for the full AI workflow. The product objective is to convert captured tunnel data into a structured 3D inspection environment where hazards can be identified, measured, prioritised and reported. During the challenge period, the system will be advanced through controlled testing, dataset preparation, reconstruction experiments and AI model evaluation.

---

# SECTION 2: TECHNICAL DESIGN AND PRODUCT LOGIC

## 2.1 System Architecture Overview

```text
Phone / Camera / Drone / Existing 3D Scan
        |
        v
Image, Video, GLB, Point Cloud or Mesh Upload
        |
        v
Pre-processing and Quality Checks
        |
        v
3D Reconstruction / Model Import Layer
        |
        v
3D Viewer and Inspection Workspace
        |
        +--> Manual Markers, Measurement, Semantic Tags
        |
        +--> AI Hazard Detection Model
        |
        +--> Risk Scoring and Recommendation Engine
        |
        v
Dashboard, Reports, Screenshots and API Outputs
        |
        v
Local / Cloud Storage and ZCHPC CCE Deployment
```

Core components:

1. Data capture layer: camera, phone, drone, sensor, or existing scan/model.
2. Pre-processing layer: frame extraction, quality checks, image resizing, and metadata validation.
3. 3D layer: imported GLB/mesh support, photogrammetry/SfM workflow, point-cloud processing and model conversion.
4. AI layer: hazard detection, risk scoring, and human-reviewed recommendation logic.
5. Application layer: browser-based 3D viewer and inspection dashboard.
6. Storage/sync layer: project files, model outputs, annotations, reports, and audit records.

## 2.2 Development Implementation

The live implementation at https://tunnelsight.applications.co.zw/ includes:

- PlayCanvas-based 3D tunnel viewer.
- GLB model loading from `/models/positanos_tunnel.glb`.
- Loading, ready, fallback, and error states.
- Fallback synthetic tunnel scene.
- Seeded risk markers with severity, risk score, and recommendation text.
- Marker selection and multi-selection.
- Box/lasso-style marker selection.
- Marker creation mode.
- Undo/redo for created markers.
- Screenshot export.
- Basic point-to-point measurement in the scene.
- Mode-based input control so selection, marking, and measurement do not behave as camera navigation.

## 2.3 AI Models and Methods

### 3D Reconstruction

Implementation method:

- Structure-from-Motion (SfM) and Multi-View Stereo for image/video-based reconstruction.
- Candidate tools: COLMAP, OpenMVG/OpenMVS, Open3D, or equivalent reproducible pipeline.
- Output: dense point clouds, meshes, GLB/XKT-compatible visual models.

### Hazard Detection

Implementation method:

- Baseline: manual labels and rule-based visual checks for cracks, water ingress, loose rock, unsupported zones, and unsafe openings.
- AI candidate: lightweight CNN/object detection model trained and evaluated after labelled project data is prepared.
- Candidate families to test: YOLO-family detector or EfficientNet-style classifier, subject to dataset fit and compute availability.

### Risk Prediction

Implementation method:

- Baseline: rule-based risk scoring using hazard class, severity, proximity, and confidence.
- AI candidate: gradient boosting or lightweight neural network after sufficient labelled cases exist.

### Strategy Recommendation

Implementation method:

- Human-reviewed rule engine supported by model outputs.
- Outputs may include inspection priority, reinforcement recommendation, exclusion zone warning, and follow-up capture guidance.

## 2.4 AI Justification and Baseline Comparison

| Function | Simple baseline | AI value |
|---|---|---|
| Crack detection | Manual inspection or fixed threshold | Learns variations in shape, lighting, scale, and texture |
| Water ingress detection | Manual visual review | Identifies visual patterns across many frames or scans |
| Hazard classification | Static checklist | Combines visual and spatial indicators |
| Risk prioritisation | Manual severity ranking | Ranks multiple hazards consistently across mapped conditions |
| Strategy support | Fixed templates | Adapts suggested actions to detected hazard type and location |

Some system functions correctly remain non-AI, including authentication, file upload, map navigation, 3D viewing, and standard safety rules.

## 2.5 Data Pipeline

Data sources:

- Project model assets: local GLB tunnel assets used for the live inspection workspace.
- Controlled capture data: to be collected during challenge testing.
- Synthetic/simulated tunnel data: for early hazard examples and UI testing.
- Public datasets: to be used only when licence and relevance are verified.
- Expert-labelled samples: required for validated hazard detection.

Processing steps:

1. Upload or ingest images, videos, GLB files, point clouds, or meshes.
2. Extract frames and validate quality.
3. Reconstruct or import 3D model.
4. Store annotations, measurements, and semantic tags.
5. Run hazard detection or rule-based baseline.
6. Generate risk markers and a review report.

## 2.6 Edge and Performance Constraints

Initial targets:

- Browser viewer should load controlled GLB test models under normal broadband conditions.
- Hazard inference target: less than 200 MB model size for edge deployment after quantisation.
- RAM target for edge inference: 256 MB to 1 GB depending on model class.
- Offline-capable workflow: local data capture and local inference where possible, with later sync.
- Inference latency target: under 100 ms per image for lightweight hazard classification on suitable hardware.

## 2.7 User Interaction Plan

The target workflow is:

1. User uploads tunnel images/video or an existing 3D model.
2. System creates or loads a 3D model.
3. User navigates the tunnel viewer.
4. User marks, measures, tags, and reviews risk points.
5. AI module proposes hazard classifications and risk scores.
6. Qualified human reviewer validates outputs.
7. System exports screenshot, report, and structured inspection data.

---

# SECTION 3: DELIVERABLES AND CCE IMPLEMENTATION ROADMAP

## 3.1 Development Phases

### Phase 1: Prototype Consolidation (Weeks 1-4)

- Stabilise current 3D viewer.
- Improve mesh picking and semantic tagging.
- Add project/session storage.
- Prepare controlled test data.

### Phase 2: MVP Development (Weeks 5-8)

- Implement image/video upload.
- Build repeatable reconstruction/import workflow.
- Train or test first hazard classifier on small labelled samples or synthetic data.
- Connect hazard outputs to 3D risk markers.

### Phase 3: Testing and Optimisation (Weeks 9-12)

- Validate hazard detection on controlled test data.
- Measure false positives and false negatives.
- Optimise model and viewer performance.
- Package deployment for ZCHPC CCE or equivalent environment.
- Produce demonstration report and technical documentation.

## 3.2 Development Workstreams and Challenge Deliverables

| Workstream | Development deliverable | Success measure |
|---|---|---|
| 3D inspection workspace | Stabilised viewer with navigation, model loading, selection, measurement and screenshot capture | User can inspect a tunnel model and capture evidence from the browser |
| Model import and reconstruction | Controlled model upload/import path and reconstruction experiment workflow | Test footage or model assets can be converted into viewable inspection geometry |
| Risk visualisation | Manual and AI-output marker layers with severity, score and recommendation metadata | Risk points are visible, selectable and reportable in the 3D workspace |
| Semantic tagging | Wall, floor, crown, entrance and hazard tags linked to markers or model regions | Inspection notes can distinguish tunnel surfaces and risk categories |
| Hazard classification | First classifier or rule-based baseline for cracks, loose rock, water ingress and unsupported zones | Model/baseline outputs can be compared against labelled examples |
| Recommendation logic | Human-reviewed safety recommendation module | Report includes conservative inspection priorities and follow-up actions |
| Backend/API | Upload, status, annotation and report endpoints | Processing workflow can be integrated beyond the browser interface |

## 3.3 Key Deliverables

- Functional 3D inspection workspace.
- Technical architecture documentation.
- Dataset statement and data governance note.
- Initial model/reconstruction experiment documentation.
- Demo URL and screen-recorded walkthrough.
- Git repository with dependency files.
- Test and validation summary.
- Safety and compliance note.

## 3.4 CCE Implementation Plan

The project will be prepared to run in the ZCHPC CCE or equivalent Linux/container environment.

Expected requirements:

- CPU: 4-8 vCPU for web/API and preprocessing.
- GPU: CUDA-compatible GPU for model training or reconstruction experiments.
- RAM: 16-32 GB for reconstruction experiments; lower for frontend serving.
- Storage: 20-100 GB initial project storage, depending on scan volume.
- OS/container: Ubuntu-compatible environment or Docker container.

Example commands:

```bash
npm install
npm run build
```

Planned AI pipeline commands:

```bash
python preprocess.py --input sample_data/raw --output sample_data/processed
python train_hazard_model.py --config configs/hazard_baseline.yaml
python infer_hazards.py --input sample_data/test --output outputs/hazards.json
```

---

# SECTION 4: COMPLIANCE AND RISK MITIGATION

## 4.1 Legal and Data Compliance

The system will comply with the Zimbabwe Data Protection Act [Chapter 12:07] by:

- Collecting only data required for mining inspection workflows.
- Avoiding personal data collection where possible.
- Requiring uploader confirmation that they own or have permission to process the site data.
- Protecting mine location, geological, and production information as confidential operational data.
- Supporting future data retention and deletion controls.

## 4.2 Ethical Safeguards

- The system is decision-support only.
- AI outputs are designed for qualified mining, geological, or geotechnical review.
- AI outputs will include confidence, uncertainty, and human review requirements.
- False negatives will be treated as high-risk because missing a hazard can cause injury or death.
- Recommendations will remain conservative and safety-first.

## 4.3 Technical Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Poor lighting or image quality | Capture guidance, quality checks, repeat capture prompts |
| Incomplete reconstruction | Controlled capture protocol and fallback manual model import |
| Model inaccuracies | Expert-labelled test data, validation metrics, retraining |
| False negatives | Conservative thresholds and mandatory human review |
| Hardware limitations | Model quantisation and edge/cloud split |
| Confidential mine data exposure | Access control, encryption, consent, retention policy |

## 4.4 Cybersecurity

Planned controls:

- Secure API endpoints.
- HTTPS transmission.
- Role-based access control.
- Encrypted storage for uploaded data.
- Audit logs for uploads, analysis, and report generation.
- No secrets committed to the repository.

## 4.5 Testing and Validation Strategy

| Component | Test | Evidence/status |
|---|---|---|
| Web viewer | Loads GLB tunnel model | Passed in live system |
| Loading states | Loading/ready/fallback/error UI | Implemented |
| Marker tools | Create/select/undo/redo markers | Implemented |
| Measurement | Two-click point measurement | Basic implementation |
| Screenshot | Export viewport PNG | Implemented |
| Hazard model | Detect labelled hazards | Evaluation protocol defined for MVP workstream |
| Reconstruction | Produce model from images/video | Pipeline design and toolchain defined for challenge implementation |
| API/backend | Upload/status/results | Endpoint plan defined for integration phase |

AI validation metrics to report when available:

- Precision.
- Recall.
- F1 score.
- Confusion matrix.
- False-positive and false-negative examples.
- Processing time per scan.
- Reconstruction completeness.

---

# SECTION 5: SUSTAINABILITY AND FUTURE ADOPTION

## 5.1 Business Model

Potential operating models:

- Per-scan safety report fee.
- Monthly subscription for mining cooperatives or companies.
- Enterprise licence for larger mining operators.
- Government/regulator pilot for safety monitoring.
- Custom integration and training services.

## 5.2 Cost Structure

Major cost drivers:

- Cloud or CCE compute for reconstruction and model training.
- Storage for project scans, images, meshes, and reports.
- Field data collection and annotation.
- Expert geotechnical/mining review.
- Support, onboarding, and model retraining.

Indicative operating estimates:

- Controlled scan storage: 0.5-5 GB per project depending on video/image volume.
- Prototype web hosting: low-cost VPS or shared hosting.
- AI training: GPU sessions during model development.
- Human annotation: dependent on labelled hazard categories and expert availability.

## 5.3 Scaling Strategy

- Start with controlled tunnel inspection and assisted risk marking.
- Validate AI hazard detection against labelled project data.
- Integrate with mine reporting workflows.
- Expand to regional mining markets.
- Add support for IFC/BIM, point clouds, drone capture, and IoT sensors.

## 5.4 Team Capability and Partner Needs

Current capability:

- Web-based 3D system development.
- Frontend 3D interaction and inspection UI.
- Early product design and deployment.

Required partner support:

- Mining/geotechnical adviser for hazard definitions and validation.
- AI/computer-vision support for model training and evaluation.
- Data partner for legally obtained mining images/scans.
- DevOps support for CCE/container deployment if required.

## 5.5 Long-Term Vision

TunnelSight GAMIS aims to become a national-scale mining safety intelligence platform combining:

- 3D mine visualisation.
- Time-based tunnel monitoring.
- AI hazard detection.
- Expert-reviewed recommendations.
- Structured safety reports.
- Integration with regulatory and company safety systems.

---

# APPENDIX SUMMARY

Formal submission files are provided in the dedicated POTRAZ package folder:

- `docs/POTRAZ/`
