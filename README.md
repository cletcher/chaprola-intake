# Chaprola Patient Intake - FHIR Demo

A demonstration application showcasing FHIR (Fast Healthcare Interoperability Resources) round-trip data handling using the Chaprola data platform.

## Live Demo

**URL:** https://chaprola.org/apps/chaprola-intake/intake/

## Features

- Patient intake form with personal, contact, and medical information
- Automatic conversion to FHIR Patient resource format
- Data storage via Chaprola's fixed-record database
- Real-time query and display of FHIR-formatted patient data
- Sample data loader for testing

## Architecture

### Frontend
- **HTML/CSS/JavaScript** - Single-page application with form handling
- **Deployed on:** Chaprola static app hosting
- **API Integration:** Direct calls to Chaprola API using site key

### Backend (Chaprola Platform)
- **Project:** `intake`
- **Data File:** `PATIENTS`
- **Format:** FHIR-flattened fixed-record structure
- **Storage:** Chaprola's S3-backed data storage

### Data Flow

1. User fills out patient intake form
2. JavaScript converts form data to flattened FHIR Patient resource
3. Data inserted via `/insert-record` API endpoint
4. Query retrieves most recent patient via `/query` endpoint
5. Flattened data reconstructed to FHIR JSON for display

## FHIR Field Mapping

The application maps HTML form fields to FHIR Patient resource fields:

- **Name:** `name[0].family`, `name[0].given[0]`
- **Demographics:** `gender`, `birthDate`
- **Telecom:** `telecom[0].system`, `telecom[0].value`
- **Address:** `address[0].line[0]`, `address[0].city`, `address[0].state`, `address[0].postalCode`

Medical information (allergies, medications, conditions) is stored as FHIR extensions for this demo.

## Security

- **Site Key:** Origin-locked to `https://chaprola.org/apps/chaprola-intake/*`
- **Allowed Endpoints:** `/query`, `/insert-record` only
- **Rate Limit:** 30 requests per second
- **Data:** Demo/sample patient data only - no real PHI

## Files

```
frontend/
├── index.html     # Patient intake form UI
├── styles.css     # Application styles
└── app.js         # Form handling and API integration
```

## API Credentials

- **Username:** `chaprola-intake`
- **Project:** `intake`
- **Site Key:** Embedded in `index.html` meta tag

## Development

To redeploy the frontend:

```bash
cd frontend
tar -czf ../app.tar.gz .
# Upload via Chaprola app deployment API
```

## Notes

- Field lengths are constrained by Chaprola's fixed-record format
- Names truncated to fit: family (7 chars), given (4 chars)
- Phone numbers limited to 12 characters
- Address fields have various size limits

## License

Demo application for Chaprola platform capabilities.
