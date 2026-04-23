// Configuration
const API_BASE = 'https://api.chaprola.org';
const USERNAME = 'chaprola-intake';
const PROJECT = 'intake';
const DEMO_USER_ID = 'demo-user';

// Get site key from page (will be injected after deployment)
let SITE_KEY = null;

// State
let currentPatientId = null;

function currentUserId() {
    const u = window.chaprolaAuth && window.chaprolaAuth.getUser();
    return (u && u.sub) || DEMO_USER_ID;
}

function isLoggedIn() {
    return !!(window.chaprolaAuth && window.chaprolaAuth.getUser());
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSiteKey();
});

function setupEventListeners() {
    document.getElementById('intake-form').addEventListener('submit', handleSubmit);
    document.getElementById('load-sample').addEventListener('click', loadSampleData);
    document.getElementById('back-to-form').addEventListener('click', showFormView);
    document.getElementById('new-patient').addEventListener('click', showFormView);
}

function loadSiteKey() {
    // Site key will be embedded in a meta tag after we create it
    const metaKey = document.querySelector('meta[name="chaprola-site-key"]');
    if (metaKey) {
        SITE_KEY = metaKey.content;
    }
}

function loadSampleData() {
    document.getElementById('firstName').value = 'John';
    document.getElementById('lastName').value = 'Doe';
    document.getElementById('dateOfBirth').value = '1985-06-15';
    document.getElementById('gender').value = 'male';
    document.getElementById('phone').value = '555-123-4567';
    document.getElementById('email').value = 'john.doe@example.com';
    document.getElementById('address').value = '123 Main Street';
    document.getElementById('city').value = 'Springfield';
    document.getElementById('state').value = 'IL';
    document.getElementById('zipCode').value = '62701';
    document.getElementById('allergies').value = 'Penicillin';
    document.getElementById('medications').value = 'Lisinopril 10mg daily';
    document.getElementById('conditions').value = 'Hypertension';

    showMessage('Sample data loaded', 'info');
}

async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Collect form data
        const formData = collectFormData();

        // Convert to FHIR Patient resource
        const fhirPatient = convertToFHIR(formData);

        showMessage('Submitting to Chaprola...', 'info');

        // Import FHIR data into Chaprola
        await importFHIRData(fhirPatient);

        showMessage('Patient data saved successfully!', 'success');

        // Wait a moment then show FHIR view
        setTimeout(() => {
            loadAndShowFHIR();
        }, 1000);

    } catch (error) {
        console.error('Submission error:', error);
        showMessage('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Intake';
    }
}

function collectFormData() {
    return {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        allergies: document.getElementById('allergies').value,
        medications: document.getElementById('medications').value,
        conditions: document.getElementById('conditions').value
    };
}

function convertToFHIR(formData) {
    // Generate a unique ID for this patient
    currentPatientId = 'pt-' + Date.now();

    // Create flattened record for Chaprola's fixed-record format
    const record = {
        resourceType: 'Patient',
        id: currentPatientId,
        active: 'true',
        user_id: currentUserId(),
        name_0_use: 'official',
        name_0_family: formData.lastName.substring(0, 7),
        name_0_given_0: formData.firstName.substring(0, 4),
        gender: formData.gender.substring(0, 7),
        birthDate: formData.dateOfBirth
    };

    // Add phone if provided
    if (formData.phone) {
        record.telecom_0_system = 'phone';
        record.telecom_0_value = formData.phone.substring(0, 12);
        record.telecom_0_use = 'mobile';
    }

    // Add address if provided
    if (formData.address || formData.city || formData.state || formData.zipCode) {
        record.address_0_use = 'home';
        record.address_0_type = 'physical';
        record.address_0_line_0 = (formData.address || '').substring(0, 11);
        record.address_0_city = (formData.city || '').substring(0, 9);
        record.address_0_state = (formData.state || '').substring(0, 2);
        record.address_0_postalCode = (formData.zipCode || '').substring(0, 5);
        record.address_0_country = 'US';
    }

    return record;
}

async function importFHIRData(fhirRecord) {
    // Site keys authorize by origin + endpoint allowlist. The correct
    // header name for site-key auth on the Chaprola API is Authorization:
    // Bearer <site_...>. The previous "X-Site-Key" header was rejected by
    // the API Gateway's CORS preflight, producing the "CORS blocks all
    // API calls" pattern Vogel reported. Aligning with expenses + inventory.
    const headers = {
        'Content-Type': 'application/json'
    };
    if (SITE_KEY) {
        headers['Authorization'] = 'Bearer ' + SITE_KEY;
    }

    const response = await fetch(`${API_BASE}/insert-record`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            userid: USERNAME,
            project: PROJECT,
            file: 'PATIENTS',
            record: fhirRecord
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Failed to insert patient record');
    }

    return response.json();
}

function reconstructFHIR(flatData) {
    const fhir = {
        resourceType: flatData.resourceType.trim(),
        id: flatData.id.trim(),
        active: flatData.active.trim() === 'true'
    };

    // Reconstruct name
    if (flatData.name_0_family) {
        fhir.name = [{
            use: flatData.name_0_use.trim(),
            family: flatData.name_0_family.trim(),
            given: [flatData.name_0_given_0.trim()]
        }];
    }

    // Add gender and birthDate
    if (flatData.gender) {
        fhir.gender = flatData.gender.trim();
    }
    if (flatData.birthDate) {
        fhir.birthDate = flatData.birthDate.trim();
    }

    // Reconstruct telecom
    if (flatData.telecom_0_system && flatData.telecom_0_value) {
        fhir.telecom = [{
            system: flatData.telecom_0_system.trim(),
            value: flatData.telecom_0_value.trim(),
            use: flatData.telecom_0_use.trim()
        }];
    }

    // Reconstruct address
    if (flatData.address_0_city || flatData.address_0_state) {
        fhir.address = [{
            use: flatData.address_0_use.trim(),
            type: flatData.address_0_type.trim(),
            line: flatData.address_0_line_0 ? [flatData.address_0_line_0.trim()] : [],
            city: flatData.address_0_city.trim(),
            state: flatData.address_0_state.trim(),
            postalCode: flatData.address_0_postalCode.trim(),
            country: flatData.address_0_country.trim()
        }];
    }

    return fhir;
}

async function loadAndShowFHIR() {
    try {
        showMessage('Loading FHIR data from Chaprola...', 'info');

        // Query the data back from Chaprola. See importFHIRData for the
        // Authorization: Bearer <site_...> header rationale (was X-Site-Key,
        // which the CORS preflight rejected).
        const headers = {
            'Content-Type': 'application/json'
        };

        if (SITE_KEY) {
            headers['Authorization'] = 'Bearer ' + SITE_KEY;
        }

        const response = await fetch(`${API_BASE}/query`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                userid: USERNAME,
                project: PROJECT,
                file: 'PATIENTS',
                where: [{ field: 'user_id', op: 'eq', value: currentUserId() }],
                limit: 1,
                order_by: [{field: 'id', dir: 'desc'}]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to query patient data');
        }

        const result = await response.json();

        if (result.results && result.results.length > 0) {
            // Display the FHIR data
            const patientData = result.results[0];

            // Reconstruct FHIR format from flattened structure for display
            const fhirDisplay = reconstructFHIR(patientData);

            document.getElementById('fhir-json').textContent = JSON.stringify(fhirDisplay, null, 2);
            showFHIRView();
        } else {
            throw new Error('No patient data found');
        }

    } catch (error) {
        console.error('Load FHIR error:', error);
        showMessage('Error loading FHIR data: ' + error.message, 'error');
    }
}

function showFormView() {
    document.getElementById('form-view').classList.add('active');
    document.getElementById('fhir-view').classList.remove('active');

    // Reset form
    document.getElementById('intake-form').reset();
    hideMessage();
}

function showFHIRView() {
    document.getElementById('form-view').classList.remove('active');
    document.getElementById('fhir-view').classList.add('active');
}

function showMessage(text, type) {
    const messageEl = document.getElementById('form-message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} visible`;
}

function hideMessage() {
    const messageEl = document.getElementById('form-message');
    messageEl.className = 'message';
}
