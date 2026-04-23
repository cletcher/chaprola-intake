// PATIENTLIST — Patient roster for the caller
// Primary: PATIENTS (expected column: user_id varchar 40)
// Multi-user: scoped by PARAM.user_id. Each logged-in intake user sees
// only patients they submitted.
// Output: pipe-delimited for frontend FHIR reconstruction.

OPEN PRIMARY "PATIENTS"

QUERY PATIENTS INTO mine WHERE user_id EQ PARAM.user_id ORDER BY birthDate DESC

LET rec = 1

PRINT "ID|FAMILY|GIVEN|GENDER|BIRTHDATE|PHONE|CITY|STATE"

100 READ mine rec
    IF EOF END
    PRINT mine.id + "|" + mine.name_0_family + "|" + mine.name_0_given_0 + "|" + mine.gender + "|" + mine.birthDate + "|" + mine.telecom_0_value + "|" + mine.address_0_city + "|" + mine.address_0_state
    LET rec = rec + 1
    GOTO 100
