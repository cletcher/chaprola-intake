// PATIENTFHIR — Reconstruct a single Patient resource as FHIR JSON
// Params:
//   PARAM.user_id — caller's sub (demo-user for anonymous). Gates access.
//   PARAM.id      — the Patient.id to export.
//
// Output: a FHIR-compliant JSON object for this patient, or 404 if the
// patient is not owned by the caller. The frontend parses the JSON
// directly (no custom reconstruction layer needed).

OPEN PRIMARY "PATIENTS"

QUERY PATIENTS INTO mine WHERE user_id EQ PARAM.user_id AND id EQ PARAM.id

IF ZERO mine.RECORDCOUNT GOTO 900

READ mine 1

PRINT "{"
PRINT "  \"resourceType\": \"Patient\","
PRINT "  \"id\": \"" + mine.id + "\","
PRINT "  \"active\": true,"
PRINT "  \"name\": [{"
PRINT "    \"use\": \"" + mine.name_0_use + "\","
PRINT "    \"family\": \"" + mine.name_0_family + "\","
PRINT "    \"given\": [\"" + mine.name_0_given_0 + "\"]"
PRINT "  }],"
PRINT "  \"gender\": \"" + mine.gender + "\","
PRINT "  \"birthDate\": \"" + mine.birthDate + "\","
PRINT "  \"telecom\": [{"
PRINT "    \"system\": \"" + mine.telecom_0_system + "\","
PRINT "    \"value\": \"" + mine.telecom_0_value + "\","
PRINT "    \"use\": \"" + mine.telecom_0_use + "\""
PRINT "  }],"
PRINT "  \"address\": [{"
PRINT "    \"use\": \"" + mine.address_0_use + "\","
PRINT "    \"type\": \"" + mine.address_0_type + "\","
PRINT "    \"line\": [\"" + mine.address_0_line_0 + "\"],"
PRINT "    \"city\": \"" + mine.address_0_city + "\","
PRINT "    \"state\": \"" + mine.address_0_state + "\","
PRINT "    \"postalCode\": \"" + mine.address_0_postalCode + "\","
PRINT "    \"country\": \"" + mine.address_0_country + "\""
PRINT "  }]"
PRINT "}"
END

900 PRINT "{\"error\": \"Patient not found or not authorized\"}"
