// API Configuration
const API_BASE_URL = window.location.origin;

// Form Elements
const form = document.getElementById('enquiryForm');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const submitBtnLoader = document.getElementById('submitBtnLoader');
const alertContainer = document.getElementById('alertContainer');

// Show Alert
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Scroll to alert
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-dismiss success alerts after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Validate Services Selection
function validateServices() {
    const checkboxes = form.querySelectorAll('input[name="services"]:checked');
    if (checkboxes.length === 0) {
        showAlert('Please select at least one service', 'error');
        return false;
    }
    return true;
}

// Collect Form Data
function collectFormData() {
    const formData = new FormData(form);
    
    // Collect selected services
    const services = [];
    form.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
        services.push(checkbox.value);
    });
    
    // Build the data object according to API schema
    const data = {
        basicInfo: {
            fullName: formData.get('fullName'),
            jobTitle: formData.get('jobTitle') || '',
            organization: formData.get('organization'),
            industry: formData.get('industry'),
            organizationSize: formData.get('organizationSize'),
            organizationType: formData.get('organizationType')
        },
        contactInfo: {
            email: formData.get('email'),
            phone: formData.get('phone'),
            province: formData.get('province'),
            city: formData.get('city'),
            address: formData.get('address') || ''
        },
        serviceRequirements: {
            services: services,
            projectDetails: formData.get('projectDetails'),
            budgetRange: formData.get('budgetRange') || '',
            timeline: formData.get('timeline') || ''
        },
        additionalInfo: {
            currentChallenges: formData.get('currentChallenges') || '',
            expectedOutcomes: formData.get('expectedOutcomes') || '',
            referralSource: formData.get('referralSource') || '',
            marketingConsent: formData.get('marketingConsent') === 'on'
        }
    };
    
    return data;
}

// Submit Form
async function submitForm(e) {
    e.preventDefault();
    
    // Validate services selection
    if (!validateServices()) {
        return;
    }
    
    // Disable submit button and show loader
    submitBtn.disabled = true;
    submitBtnText.style.display = 'none';
    submitBtnLoader.style.display = 'block';
    
    try {
        const data = collectFormData();
        
        // Submit to API
        const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Redirect to success page with reference number
            window.location.href = `success.html?ref=${result.referenceNumber}`;
        } else {
            // Show error message
            const errorMessage = result.message || 'An error occurred while submitting your enquiry';
            const errors = result.errors || [];
            
            if (errors.length > 0) {
                const errorList = errors.map(err => err.msg || err.message).join(', ');
                showAlert(`Validation errors: ${errorList}`, 'error');
            } else {
                showAlert(errorMessage, 'error');
            }
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button and hide loader
        submitBtn.disabled = false;
        submitBtnText.style.display = 'block';
        submitBtnLoader.style.display = 'none';
    }
}

// Attach Event Listeners
if (form) {
    form.addEventListener('submit', submitForm);
    
    // Phone number validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Remove non-numeric characters
            e.target.value = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });
    }
    
    // Real-time validation for required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', () => {
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--error-color)';
            } else {
                field.style.borderColor = 'var(--border-color)';
            }
        });
        
        field.addEventListener('input', () => {
            if (field.value.trim()) {
                field.style.borderColor = 'var(--border-color)';
            }
        });
    });
}

// Email validation
const emailInput = document.getElementById('email');
if (emailInput) {
    emailInput.addEventListener('blur', () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailPattern.test(emailInput.value)) {
            emailInput.style.borderColor = 'var(--error-color)';
            showAlert('Please enter a valid email address', 'error');
        } else {
            emailInput.style.borderColor = 'var(--border-color)';
        }
    });
}
