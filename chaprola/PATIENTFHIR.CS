// PATIENTFHIR — Fetch a single Patient record, pipe-delimited
// Params:
//   PARAM.user_id — caller's sub (demo-user for anonymous). Gates access.
//   PARAM.id      — the Patient.id to export.
//
// Output: a single pipe-delimited row with the fields needed to
// reconstruct a FHIR Patient resource client-side. Field order:
//   id | name_use | family | given | gender | birthDate
//   | telecom_system | telecom_value | telecom_use
//   | addr_use | addr_type | addr_line | addr_city | addr_state
//   | addr_postalCode | addr_country
// The frontend assembles FHIR JSON from these fields. If the patient
// is not owned by the caller, output "ERROR|not_found_or_not_authorized".

OPEN PRIMARY "PATIENTS"

QUERY PATIENTS INTO mine WHERE user_id EQ PARAM.user_id AND id EQ PARAM.id

IF ZERO mine.RECORDCOUNT GOTO 900

LET rec = 1
READ mine rec

PRINT mine.id + "|" + mine.name_0_use + "|" + mine.name_0_family + "|" + mine.name_0_given_0 + "|" + mine.gender + "|" + mine.birthDate + "|" + mine.telecom_0_system + "|" + mine.telecom_0_value + "|" + mine.telecom_0_use + "|" + mine.address_0_use + "|" + mine.address_0_type + "|" + mine.address_0_line_0 + "|" + mine.address_0_city + "|" + mine.address_0_state + "|" + mine.address_0_postalCode + "|" + mine.address_0_country
END

900 PRINT "ERROR|not_found_or_not_authorized"
