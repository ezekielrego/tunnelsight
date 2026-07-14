# Dataset Statement - TunnelSight GAMIS

This document separates current prototype data, synthetic/demo data, planned public data, and data still required for validation.

## D1. Dataset Register

| Dataset name | Source | Data type | Volume | Labels | Rights/status | Processing | Limitations |
|---|---|---|---:|---|---|---|---|
| TunnelSight demo GLB set | Local prototype assets | GLB meshes | 3 model files | None in source model; manual risk markers added in app | Internal prototype/demo use; verify model provenance before public dataset release | Imported into PlayCanvas viewer | Not confirmed as real mine data; no ground-truth hazards |
| Seeded prototype risk markers | Created by development team | Marker/annotation JSON in app code | 3 seeded markers | High, Medium, Warning | Team-created synthetic annotation data | Rendered as 3D markers and labels | Demonstration only; not field validated |
| Custom user markers | Created in current viewer | Manual marker annotations | Runtime only in current prototype | Warning default; editable in future | User-generated; future consent required | Created in browser | Not currently persisted to backend |
| Controlled mine/tunnel capture dataset | To be collected | Images/video/point cloud/mesh | TBD | Cracks, water ingress, loose rock, unsupported roof, safe zone | Must be captured with site permission | Frame extraction, cleaning, annotation | Not yet available |
| Synthetic tunnel hazard dataset | Planned | Rendered images/meshes | TBD | Simulated cracks, seepage, rockfall zones | Team-generated or generated with licensed tools | Synthetic rendering and labels | May not represent real geological variation |
| Public third-party mining/geology data | To be evaluated | Images/point clouds/metadata | TBD | Depends on dataset | Licence must be verified before use | Normalisation and relabelling | May not match Zimbabwe underground mine conditions |

## D2. Real Mine Data

No real confidential mine dataset is currently included in this repository. Any future real mine images, scans, coordinates, or production information must be uploaded only with permission from the owner/operator and must be protected as confidential operational data.

## D3. Synthetic and Simulated Data

The current risk markers are synthetic demonstration annotations. They are used to show the inspection workflow, viewer state, marker selection, risk scoring display, and reporting logic. They must not be treated as validated hazard detections.

## D4. Data Still Required

For a validated AI model, the project requires:

- Controlled images or videos of underground mine/tunnel surfaces.
- Expert-labelled examples of cracks, loose rock, water ingress, unsupported roof/crown, entrance/exit zones, and safe zones.
- Negative examples with no visible hazard.
- Lighting and capture-condition variation.
- Validation set separate from training data.

## D5. Annotation Plan

Initial annotation categories:

- Crack.
- Loose rock.
- Water ingress.
- Unsupported roof/crown.
- Wall deformation.
- Floor/invert damage.
- Entrance/exit.
- Safe zone.
- Unknown/needs expert review.

Annotation fields:

```json
{
  "label": "crack",
  "severity": "High|Medium|Warning",
  "confidence": 0.0,
  "source": "manual|ai",
  "review_status": "unreviewed|accepted|rejected",
  "reviewer_role": "mining_engineer|geologist|safety_officer"
}
```

## D6. Data Governance

The project will apply:

- Uploader consent confirmation.
- Ownership/permission declaration.
- No public release of confidential mine scans.
- Anonymisation/removal of unnecessary location details where possible.
- Encrypted storage in future backend.
- Data retention and deletion policy before pilot deployment.

## D7. Dataset Limitations

- Current prototype data is demonstration-only.
- No validated field dataset is included yet.
- AI model performance cannot be claimed until labelled validation data is available.
- False negatives are high-risk and must be specifically measured before operational use.

