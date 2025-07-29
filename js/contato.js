// DOM Elements
const contactForm = document.getElementById('contact-form');
const workForm = document.getElementById('work-form');
const faqQuestions = document.querySelectorAll('.faq-question');

// Form Validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const showFormError = (element, message) => {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    // Remove existing error if any
    const existingError = element.nextElementSibling;
    if (existingError && existingError.classList.contains('error-message')) {
        existingError.remove();
    }
    
    element.insertAdjacentElement('afterend', errorElement);
    element.focus();
    element.setAttribute('aria-invalid', 'true');
};

const clearFormError = (element) => {
    element.setAttribute('aria-invalid', 'false');
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
};

// Form Submission
const handleContactSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Validate required fields
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFormError(field, 'Este campo é obrigatório');
            isValid = false;
        } else {
            clearFormError(field);
        }
    });
    
    // Validate email format
    const emailField = contactForm.querySelector('input[type="email"]');
    if (emailField.value.trim() && !validateEmail(emailField.value.trim())) {
        showFormError(emailField, 'Por favor, insira um e-mail válido');
        isValid = false;
    }
    
    if (isValid) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00f5ff, #39ff14);
                color: #000000;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
                z-index: 10000;
                font-family: 'Teko', sans-serif;
                font-weight: 600;
                letter-spacing: 1px;
                animation: slideInRight 0.3s ease-out;
            `;
            successDiv.textContent = 'Mensagem enviada com sucesso!';
            successDiv.setAttribute('role', 'alert');
            document.body.appendChild(successDiv);
            
            // Remove after 3 seconds
            setTimeout(() => {
                successDiv.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (document.body.contains(successDiv)) {
                        document.body.removeChild(successDiv);
                    }
                }, 300);
            }, 3000);
            
            // Reset form
            contactForm.reset();
        }, 2000);
    }
};

const handleWorkSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Validate required fields
    const requiredFields = workForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFormError(field, 'Este campo é obrigatório');
            isValid = false;
        } else {
            clearFormError(field);
        }
    });
    
    // Validate email format
    const emailField = workForm.querySelector('input[type="email"]');
    if (emailField.value.trim() && !validateEmail(emailField.value.trim())) {
        showFormError(emailField, 'Por favor, insira um e-mail válido');
        isValid = false;
    }
    
    // Validate URL format for portfolio
    const portfolioField = workForm.querySelector('input[type="url"]');
    if (portfolioField.value.trim() && !isValidUrl(portfolioField.value.trim())) {
        showFormError(portfolioField, 'Por favor, insira um link válido');
        isValid = false;
    }
    
    if (isValid) {
        const submitButton = workForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
        submitButton.disabled = true;
        
        // Simulate form submission (in a real app, this would be an AJAX call)
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00f5ff, #39ff14);
                color: #000000;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
                z-index: 10000;
                font-family: 'Teko', sans-serif;
                font-weight: 600;
                letter-spacing: 1px;
                animation: slideInRight 0.3s ease-out;
            `;
            successDiv.textContent = 'Candidatura enviada! Entraremos em contato.';
            successDiv.setAttribute('role', 'alert');
            document.body.appendChild(successDiv);
            
            // Remove after 3 seconds
            setTimeout(() => {
                successDiv.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (document.body.contains(successDiv)) {
                        document.body.removeChild(successDiv);
                    }
                }, 300);
            }, 3000);
            
            // Reset form
            workForm.reset();
        }, 2000);
    }
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

// FAQ Accordion
const toggleFaq = (question) => {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    const answer = document.getElementById(question.getAttribute('aria-controls'));
    
    // Toggle aria-expanded
    question.setAttribute('aria-expanded', !isExpanded);
    
    // Toggle answer visibility
    if (isExpanded) {
        answer.style.maxHeight = '0';
        question.querySelector('i').className = 'fas fa-chevron-down';
    } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.querySelector('i').className = 'fas fa-chevron-up';
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    if (workForm) {
        workForm.addEventListener('submit', handleWorkSubmit);
    }
    
    // FAQ Accordion
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => toggleFaq(question));
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFaq(question);
            }
        });
        
        // Initialize FAQ items
        const answer = document.getElementById(question.getAttribute('aria-controls'));
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease-out';
    });
    
    // Enhance form fields
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#4a90e2';
            input.style.boxShadow = '0 0 20px rgba(74, 144, 226, 0.3)';
        });
        
        input.addEventListener('blur', () => {
            input.style.borderColor = '#2a2a2a';
            input.style.boxShadow = 'none';
        });
    });
});

// Console welcome message
console.log(`
🐦‍⬛ BEM-VINDO AO RAVEN STUDIO! 🐦‍⬛

Está na página de contato. Aqui você pode nos enviar mensagens ou se candidatar para trabalhar conosco.

Para mais informações: contato@ravenstudio.com

🎨 Onde a arte encontra a tecnologia 🎨
`);