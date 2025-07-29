// Adicionar essas variáveis no início do arquivo
const showRegisterLink = document.getElementById('show-register');
const registerModal = document.getElementById('register-modal');
const registerClose = document.getElementById('register-close');
const registerForm = document.getElementById('register-form');

// Adicionar esses event listeners no final do DOMContentLoaded
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterModal();
    });
}

if (registerClose) {
    registerClose.addEventListener('click', hideRegisterModal);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
}

// Adicionar essas funções ao arquivo
const showRegisterModal = () => {
    registerModal.classList.add('show');
    registerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('register-name').focus();
};

const hideRegisterModal = () => {
    registerModal.classList.remove('show');
    registerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
};

const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Simple validation
    if (!name || !email || !password || !confirmPassword) {
        showError(document.createElement('div'), 'Por favor, preencha todos os campos.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(document.createElement('div'), 'Por favor, digite um e-mail válido.');
        return;
    }
    
    if (password.length < 6) {
        showError(document.createElement('div'), 'A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(document.createElement('div'), 'As senhas não coincidem.');
        return;
    }
    
    // Simulate registration process
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CRIANDO CONTA...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        hideRegisterModal();
        showSuccess('Conta criada com sucesso! Faça login para continuar.');
        submitButton.innerHTML = originalHTML;
        submitButton.disabled = false;
        registerForm.reset();
    }, 2000);
};

// Atualizar o event listener para fechar modais com Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (forgotModal.classList.contains('show')) {
            hideForgotModal();
        }
        if (registerModal.classList.contains('show')) {
            hideRegisterModal();
        }
    }
});

// Atualizar o event listener para fechar modais ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === forgotModal) {
        hideForgotModal();
    }
    if (e.target === registerModal) {
        hideRegisterModal();
    }
});


// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.querySelector('.toggle-password');
const forgotPasswordLink = document.querySelector('.forgot-password');
const forgotModal = document.getElementById('forgot-modal');
const forgotClose = document.getElementById('forgot-close');
const forgotForm = document.getElementById('forgot-form');
const forgotEmail = document.getElementById('forgot-email');

// Utility Functions
const showError = (element, message) => {
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
        errorElement.classList.add('show-error');
        element.classList.add('input-error');
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show-error';
        errorDiv.textContent = message;
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
        element.classList.add('input-error');
    }
};

const hideError = (element) => {
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.classList.remove('show-error');
        element.classList.remove('input-error');
    }
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const showSuccess = (message) => {
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
        font-family: 'Bebas Neue', cursive;
        font-weight: 600;
        letter-spacing: 1px;
        animation: slideInRight 0.3s ease-out;
    `;
    successDiv.textContent = message;
    successDiv.setAttribute('role', 'alert');
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
};

// Loading Screen
const hideLoadingScreen = () => {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
};

// Toggle Password Visibility
const togglePasswordVisibility = () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
};

// Form Validation
const validateLoginForm = (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Validate Email
    if (!emailInput.value.trim()) {
        showError(emailInput, 'Por favor, digite seu e-mail');
        isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
        showError(emailInput, 'Por favor, digite um e-mail válido');
        isValid = false;
    } else {
        hideError(emailInput);
    }
    
    // Validate Password
    if (!passwordInput.value.trim()) {
        showError(passwordInput, 'Por favor, digite sua senha');
        isValid = false;
    } else if (passwordInput.value.trim().length < 6) {
        showError(passwordInput, 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    } else {
        hideError(passwordInput);
    }
    
    if (isValid) {
        // Simulate login process
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalHTML = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENTRANDO...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            showSuccess('Login realizado com sucesso!');
            submitButton.innerHTML = originalHTML;
            submitButton.disabled = false;
            
            // Redirect to dashboard or home page
            // window.location.href = '/dashboard.html';
        }, 2000);
    }
};

// Forgot Password
const showForgotModal = (e) => {
    e.preventDefault();
    forgotModal.classList.add('show');
    forgotModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    forgotEmail.focus();
};

const hideForgotModal = () => {
    forgotModal.classList.remove('show');
    forgotModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
};

const handleForgotSubmit = (e) => {
    e.preventDefault();
    
    if (!forgotEmail.value.trim()) {
        showError(forgotEmail, 'Por favor, digite seu e-mail');
        return;
    } else if (!isValidEmail(forgotEmail.value.trim())) {
        showError(forgotEmail, 'Por favor, digite um e-mail válido');
        return;
    } else {
        hideError(forgotEmail);
    }
    
    // Simulate password reset process
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        hideForgotModal();
        showSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        submitButton.innerHTML = originalHTML;
        submitButton.disabled = false;
        forgotForm.reset();
    }, 2000);
};

// Google Login
const handleGoogleLogin = () => {
    // This would be replaced with actual Google Sign-In API implementation
    showSuccess('Redirecionando para login com Google...');
    
    // Example of Google Sign-In implementation
    /*
    google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleCredentialResponse
    });
    
    google.accounts.id.prompt();
    */
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    hideLoadingScreen();
    
    // Login Form
    if (loginForm) loginForm.addEventListener('submit', validateLoginForm);
    
    // Toggle Password
    if (togglePassword) togglePassword.addEventListener('click', togglePasswordVisibility);
    
    // Forgot Password
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', showForgotModal);
    if (forgotClose) forgotClose.addEventListener('click', hideForgotModal);
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotSubmit);
    
    // Google Login
    const googleLoginBtn = document.querySelector('.google-login-button');
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleLogin);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === forgotModal) {
            hideForgotModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && forgotModal.classList.contains('show')) {
            hideForgotModal();
        }
    });
});

// Google Sign-In callback (would be used with actual implementation)
function handleCredentialResponse(response) {
    // Handle the Google Sign-In response here
    console.log('Google Sign-In response:', response);
    // You would typically send the credential to your backend for verification
    // and then handle the user session
    
    showSuccess('Login com Google realizado com sucesso!');
    // window.location.href = '/dashboard.html';
}

// Console welcome message
console.log(`
🐦‍⬛ BEM-VINDO AO RAVEN STUDIO - LOGIN 🐦‍⬛

Esta página foi criada com tecnologia de ponta e design inovador.
Transformamos pele em arte desde 2016.

Para mais informações: contato@ravenstudio.com

🎨 Onde a arte encontra a tecnologia 🎨
`);