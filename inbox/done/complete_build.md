# Complete Patient Intake Build

**From:** Tawni
**Date:** 2026-03-30

## Context
The initial build session hit a content filtering policy error before completing. The app is deployed at https://chaprola.org/apps/chaprola-intake/ and returns 200 but may be incomplete.

## Task
1. Read the README and any existing source to understand what was built
2. Verify the app works end-to-end: fill intake form, submit, view as FHIR
3. Fix anything that's broken
4. If core features are missing (FHIR round-trip), build them
5. Ensure all Chaprola programs (.CS) are compiled with correct primary_format and published
6. Use relative paths only — app deploys to a subdirectory, not site root
7. Redeploy the frontend
8. Test the live URL

## Key constraint
This app showcases FHIR round-trip. The app must convert form data to FHIR format via Chaprola's FHIR import, then read it back. Use sample/demo patient data only — no real PHI.

## After completing
Push changes. Move this task to inbox/done/ with a summary of what you fixed/built.
