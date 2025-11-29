// Función para abrir el modal de iniciar sesión
function openLoginModal() {
    const modal = document.getElementById('modal-login');
    if (modal) {
        // Limpiar errores y campos
        clearLoginErrors();
        resetLoginForm();
        modal.showModal();
        // Bloquear scroll del body
        document.body.classList.add('modal-open');
    }
}

// Función para cerrar el modal de iniciar sesión
function closeLoginModal() {
    const modal = document.getElementById('modal-login');
    if (modal) {
        modal.close();
        // Permitir scroll del body nuevamente
        document.body.classList.remove('modal-open');
        // Limpiar errores y campos
        clearLoginErrors();
        resetLoginForm();
    }
}

// Función para limpiar errores del formulario
function clearLoginErrors() {
    const errorMessage = document.getElementById('error-message');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    
    if (errorMessage) errorMessage.classList.add('hidden');
    if (emailError) emailError.classList.add('hidden');
    if (passwordError) passwordError.classList.add('hidden');
}

// Función para mostrar errores
function showLoginError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
}

// Función para resetear el formulario
function resetLoginForm() {
    const form = document.getElementById('login-form');
    if (form) {
        form.reset();
    }
}

// Función para manejar el envío del formulario de login
async function handleLoginSubmit(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Limpiar errores previos
    clearLoginErrors();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const submitBtn = document.getElementById('login-submit-btn');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validación básica
    let hasErrors = false;
    
    if (!email) {
        if (emailError) emailError.classList.remove('hidden');
        hasErrors = true;
    }
    
    if (!password) {
        if (passwordError) passwordError.classList.remove('hidden');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showLoginError('Por favor, ingrese un correo electrónico válido');
        return;
    }
    
    // Deshabilitar botón durante la petición
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';
    }
    
    try {
        // Llamar a la función de login
        const result = await login(email, password);
        
        if (result.success) {
            // Login exitoso
            closeLoginModal();
            
            // Actualizar el header según el rol sin recargar toda la página
            if (typeof loadHeaderByRole === 'function') {
                await loadHeaderByRole();
            } else {
                // Si la función no está disponible, recargar la página
                window.location.reload();
            }
            
            // Actualizar la vista del mapa si la función está disponible
            if (typeof toggleMapView === 'function') {
                toggleMapView();
            } else {
                // Si no está disponible, recargar la página
                window.location.reload();
            }
        } else {
            // Mostrar error
            showLoginError(result.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showLoginError('Error de conexión con el servidor');
    } finally {
        // Rehabilitar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    }
}

// Función para inicializar el modal de login
function initializeLoginModal() {
    // Botón de cerrar (X) en el modal
    const closeButton = document.querySelector('#modal-login button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeLoginModal();
        });
    }

    // Cerrar modal al hacer clic fuera de él (en el backdrop)
    const modal = document.getElementById('modal-login');
    if (modal) {
        modal.addEventListener('click', function(e) {
            // Si el clic fue directamente en el dialog (backdrop), cerrar
            if (e.target === modal) {
                closeLoginModal();
            }
        });
    }
    
    // Manejar envío del formulario
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Remover listeners previos
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        newForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // También configurar el botón de submit directamente
    const submitBtn = document.getElementById('login-submit-btn');
    if (submitBtn) {
        // Remover listeners previos
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        
        newSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleLoginSubmit(e);
        });
    }
}

// Función para abrir el modal de logout
function openLogoutModal() {
    const modal = document.getElementById('modal-logout');
    if (modal) {
        modal.showModal();
        // Bloquear scroll del body
        document.body.classList.add('modal-open');
    }
}

// Función para cerrar el modal de logout
function closeLogoutModal() {
    const modal = document.getElementById('modal-logout');
    if (modal) {
        modal.close();
        // Permitir scroll del body nuevamente
        document.body.classList.remove('modal-open');
    }
}

// Función para inicializar el modal de logout
function initializeLogoutModal() {
    // Botón de cerrar (X) en el modal
    const closeButton = document.getElementById('close-logout-modal');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeLogoutModal();
        });
    }

    // Cerrar modal al hacer clic fuera de él (en el backdrop)
    const modal = document.getElementById('modal-logout');
    if (modal) {
        modal.addEventListener('click', function(e) {
            // Si el clic fue directamente en el dialog (backdrop), cerrar
            if (e.target === modal) {
                closeLogoutModal();
            }
        });
    }
    
    // Botón de confirmar logout
    const confirmBtn = document.getElementById('confirm-logout-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeLogoutModal();
            
            if (typeof logout === 'function') {
                await logout();
            } else {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('user_rol');
                window.location.reload();
            }
        });
    }
    
    // Botón de cancelar
    const cancelBtn = document.getElementById('cancel-logout-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeLogoutModal();
        });
    }
}

// Event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que el modal se cargue
    setTimeout(() => {
        initializeLoginModal();
    }, 200);
});

