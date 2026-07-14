# Consent, Safety and Data Handling Note

Project: TunnelSight AI: Intelligent 3D Subsurface Mapping and Risk Prediction System

This text can be used in the proposal appendix, demo, upload page or future terms of use.

## Uploader Consent Wording

Before uploading any site image, video, point cloud, model, report or scan, the uploader should confirm:

> I confirm that I own this data or have permission from the lawful owner/operator to upload it for processing by GAMIS. I understand that mine images, scans, location information and geological data may be commercially sensitive. I confirm that the uploaded material does not contain personal information, confidential third-party information, restricted security details or data that I am not authorised to process.

Recommended checkbox label:

```text
I confirm that I own this site data or have permission to process it.
```

## Safety Disclaimer

GAMIS is a decision-support and inspection-assistance system. It must not be treated as a replacement for a qualified mining engineer, geotechnical engineer, safety officer or legally required inspection process.

Automated outputs, including hazard labels, risk markers, measurements, reconstructed models and recommendations, may be incomplete or incorrect. False negatives are especially dangerous in a mine-safety context because a missed hazard could lead to unsafe decisions. Any recommendation produced by the system must be reviewed by a competent human professional before field action.

## Data Protection Controls

| Area | Proposed control |
| --- | --- |
| Consent | Require uploader confirmation before processing site data |
| Personal data | Avoid collecting personal data unless strictly necessary |
| Site confidentiality | Treat mine images, scans, coordinates and production information as confidential |
| Transmission | Use HTTPS for uploads and downloads |
| Storage | Restrict access to uploaded project files and generated outputs |
| Retention | Define project-level retention and deletion settings |
| Auditability | Log processing events, user actions and report generation |
| Human review | Mark all AI outputs as preliminary until reviewed |
| Access control | Add role-based access for project owners, engineers, reviewers and administrators |

## Zimbabwe Compliance Position

The project should comply with Zimbabwe's Data Protection Act [Chapter 12:07] by limiting collection to necessary data, obtaining permission before processing sensitive project material, protecting uploaded records, and allowing deletion or correction where appropriate.

## Known Safety Risks

| Risk | Mitigation |
| --- | --- |
| Missed hazard | Human review, conservative reporting, field validation |
| False alarm | Confidence display, reviewer override, model retraining |
| Poor image quality | Upload quality checks and capture guidance |
| Sensitive mine data exposure | Authentication, access control and encrypted transport |
| Misuse as autonomous safety approval | Clear disclaimer and workflow requiring expert review |
