/**
 * Contact Form Handler
 * 
 * Handles contact form submission, validation, and character counter.
 */

(function() {
    'use strict';
    
    // Message character limit
    const MESSAGE_MAX_LENGTH = 200;
    const messageInput = document.getElementById('message');
    const messageCounter = document.getElementById('messageCounter');
    const alertContainer = document.getElementById('alertContainer');
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return; // Exit if not on contact page
    
    // Update character counter
    function updateMessageCounter() {
        if (!messageInput || !messageCounter) return;
        const currentLength = messageInput.value.length;
        messageCounter.textContent = `${currentLength}/${MESSAGE_MAX_LENGTH}`;
        
        // Update counter color based on length
        messageCounter.classList.remove('warning', 'error');
        if (currentLength > MESSAGE_MAX_LENGTH * 0.9) {
            messageCounter.classList.add('error');
        } else if (currentLength > MESSAGE_MAX_LENGTH * 0.75) {
            messageCounter.classList.add('warning');
        }
    }
    
    // Add event listener for real-time updates
    if (messageInput) {
        messageInput.addEventListener('input', updateMessageCounter);
        messageInput.addEventListener('paste', function(event) {
            setTimeout(() => {
                if (messageInput.value.length > MESSAGE_MAX_LENGTH) {
                    messageInput.value = messageInput.value.substring(0, MESSAGE_MAX_LENGTH);
                    showAlert('warning', 'Message was truncated to 200 characters.');
                }
                updateMessageCounter();
            }, 10);
        });
        // Initialize counter on page load
        updateMessageCounter();
    }
    
    // Check for success parameter in URL (for backward compatibility)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showAlert('success', 'Thank you for your message! We will get back to you soon.');
        // Clear the success parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Track form submission success in Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                'event_category': 'Conversion',
                'event_label': 'Contact Form Submission',
                'method': 'contact_form',
                'form_name': 'contact_form',
                'value': 1
            });
        }
        
        // Reset form
        contactForm.reset();
    }
    
    // Track form load time for spam detection
    const formLoadTime = Date.now();
    const MIN_FORM_TIME = 3000; // Minimum 3 seconds on page before submission
    
    // Contact form submission handler with enhanced spam protection
    contactForm.addEventListener('submit', function(event) {
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
        const company = document.getElementById('company').value.trim();
        const newsletter = document.getElementById('newsletter') ? document.getElementById('newsletter').checked : false;
        const message = document.getElementById('message').value.trim();
        
        // Clear previous alerts
        alertContainer.replaceChildren();
        
        // Time-based spam protection - prevent instant submissions
        const timeOnPage = Date.now() - formLoadTime;
        if (timeOnPage < MIN_FORM_TIME) {
            event.preventDefault();
            showAlert('danger', 'Please take your time filling out the form. Spam protection requires a minimum time on page.');
            return false;
        }
        
        // Validate form data
        if (!firstName || !lastName || !phone || !email || !company || !message) {
            event.preventDefault();
            showAlert('danger', 'Please fill in all required fields.');
            return false;
        }
        
        // Enhanced email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            event.preventDefault();
            showAlert('danger', 'Please enter a valid email address.');
            document.getElementById('email').focus();
            return false;
        }
        
        // Validate message character limit
        if (message.length > MESSAGE_MAX_LENGTH) {
            event.preventDefault();
            showAlert('danger', `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters. Please shorten your message.`);
            document.getElementById('message').focus();
            return false;
        }
        
        // Validate message minimum length
        if (message.length < 10) {
            event.preventDefault();
            showAlert('danger', 'Please provide a more detailed message (minimum 10 characters).');
            document.getElementById('message').focus();
            return false;
        }
        
        // Validate phone number
        if (!phone || phone.length < 8) {
            event.preventDefault();
            showAlert('danger', 'Please enter a valid phone number.');
            document.getElementById('phone').focus();
            return false;
        }
        
        // Prevent default form submission
        event.preventDefault();
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const loadingText = document.getElementById('loadingText');
        submitText.classList.add('d-none');
        loadingText.classList.remove('d-none');
        submitBtn.disabled = true;
        
        // Determine backend URL
        const isDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.protocol === 'file:';
        const backendUrl = isDevelopment 
            ? 'http://localhost:3000' 
            : 'https://bloom-n-events-co-website-production.up.railway.app';
        const apiUrl = `${backendUrl}/api/contact`;
        
        // Prepare form data
        const formData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            company: company,
            newsletter: newsletter,
            message: message
        };
        
        // Submit to backend API
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Success - show success message
                showAlert('success', data.message || 'Thank you for your message! We will get back to you soon.');
                
                // Reset form
                contactForm.reset();
                if (typeof updateMessageCounter === 'function') {
                    updateMessageCounter();
                }
                
                // Track form submission success in Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        'event_category': 'Conversion',
                        'event_label': 'Contact Form Submission',
                        'method': 'contact_form',
                        'form_name': 'contact_form',
                        'value': 1
                    });
                }
            } else {
                throw new Error(data.error || 'An error occurred');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showAlert('danger', error.message || 'An error occurred while submitting your form. Please try again later or contact us directly.');
        })
        .finally(() => {
            // Reset button state
            submitText.classList.remove('d-none');
            loadingText.classList.add('d-none');
            submitBtn.disabled = false;
        });
    });
    
    // Helper function to show alert
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        
        const icon = document.createElement('i');
        icon.className = type === 'success' 
            ? 'bi bi-check-circle-fill me-2' 
            : type === 'warning'
            ? 'bi bi-exclamation-triangle-fill me-2'
            : 'bi bi-exclamation-triangle-fill me-2';
        
        const strong = document.createElement('strong');
        strong.textContent = type === 'success' ? 'Thank you! ' : type === 'warning' ? 'Note: ' : 'Error! ';
        
        const messageText = document.createTextNode(message);
        
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-close';
        closeBtn.setAttribute('data-bs-dismiss', 'alert');
        closeBtn.setAttribute('aria-label', 'Close');
        
        alertDiv.appendChild(icon);
        alertDiv.appendChild(strong);
        alertDiv.appendChild(messageText);
        alertDiv.appendChild(closeBtn);
        
        alertContainer.replaceChildren(alertDiv);
        
        // Auto-dismiss success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    }
})();
