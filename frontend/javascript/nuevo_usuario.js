// Función para limpiar errores del formulario
function clearNuevoUsuarioErrors() {
    const errorMessage = document.getElementById('error-message-usuario');
    const successMessage = document.getElementById('success-message-usuario');
    const nombreError = document.getElementById('nombre-error');
    const apellidoError = document.getElementById('apellido-error');
    const correoError = document.getElementById('correo-error');
    const passwordError = document.getElementById('password-error-usuario');
    const confirmarPasswordError = document.getElementById('confirmar-password-error-usuario');
    const rolError = document.getElementById('rol-error');
    
    if (errorMessage) errorMessage.classList.add('hidden');
    if (successMessage) successMessage.classList.add('hidden');
    if (nombreError) nombreError.classList.add('hidden');
    if (apellidoError) apellidoError.classList.add('hidden');
    if (correoError) correoError.classList.add('hidden');
    if (passwordError) passwordError.classList.add('hidden');
    if (confirmarPasswordError) confirmarPasswordError.classList.add('hidden');
    if (rolError) rolError.classList.add('hidden');
}

// Función para mostrar errores
function showNuevoUsuarioError(message) {
    const errorMessage = document.getElementById('error-message-usuario');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
}

// Función para mostrar éxito
function showNuevoUsuarioSuccess(message) {
    const successMessage = document.getElementById('success-message-usuario');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.classList.remove('hidden');
    }
}

// Función para resetear el formulario
function resetNuevoUsuarioForm() {
    const form = document.getElementById('nuevo-usuario-form');
    if (form) {
        form.reset();
    }
}

// Función para validar el formulario
function validateNuevoUsuarioForm() {
    const nombre = document.getElementById('nombre-usuario').value.trim();
    const apellido = document.getElementById('apellido-usuario').value.trim();
    const correo = document.getElementById('correo-usuario').value.trim();
    const password = document.getElementById('password-usuario').value;
    const confirmarPassword = document.getElementById('confirmar-password-usuario').value;
    const rol = document.getElementById('rol-usuario').value;
    
    let isValid = true;
    
    // Validar nombre
    if (!nombre) {
        document.getElementById('nombre-error').classList.remove('hidden');
        isValid = false;
    }
    
    // Validar apellido
    if (!apellido) {
        document.getElementById('apellido-error').classList.remove('hidden');
        isValid = false;
    }
    
    // Validar correo
    if (!correo) {
        document.getElementById('correo-error').classList.remove('hidden');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        showNuevoUsuarioError('El correo electrónico no es válido');
        isValid = false;
    }
    
    // Validar contraseña
    if (!password) {
        document.getElementById('password-error-usuario').classList.remove('hidden');
        isValid = false;
    } else if (password.length < 6) {
        showNuevoUsuarioError('La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    // Validar confirmación de contraseña
    if (!confirmarPassword) {
        document.getElementById('confirmar-password-error-usuario').classList.remove('hidden');
        document.getElementById('confirmar-password-error-usuario').textContent = 'Por favor, confirme la contraseña';
        isValid = false;
    } else if (password !== confirmarPassword) {
        document.getElementById('confirmar-password-error-usuario').classList.remove('hidden');
        document.getElementById('confirmar-password-error-usuario').textContent = 'Las contraseñas no coinciden';
        isValid = false;
    }
    
    // Validar rol
    if (!rol) {
        document.getElementById('rol-error').classList.remove('hidden');
        isValid = false;
    }
    
    return isValid;
}

// Función para registrar el usuario
async function registrarUsuario() {
    // Limpiar errores previos
    clearNuevoUsuarioErrors();
    
    // Validar formulario
    if (!validateNuevoUsuarioForm()) {
        return;
    }
    
    const nombre = document.getElementById('nombre-usuario').value.trim();
    const apellido = document.getElementById('apellido-usuario').value.trim();
    const correo = document.getElementById('correo-usuario').value.trim();
    const password = document.getElementById('password-usuario').value;
    const rol = document.getElementById('rol-usuario').value;
    const genero = document.getElementById('genero-usuario').value || 'X';
    
    // Obtener token de autenticación
    const token = getAuthToken();
    if (!token) {
        showNuevoUsuarioError('No estás autenticado. Por favor, inicia sesión.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                password: password,
                rol: rol,
                genero: genero,
                user_name: correo.split('@')[0] // Generar user_name desde el correo
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Mostrar mensaje de éxito y permanecer en la misma página
            showNuevoUsuarioSuccess('El usuario fue registrado correctamente.');
            resetNuevoUsuarioForm();
        } else {
            const errorMsg = data.message || data.error || 'Error al registrar el usuario';
            showNuevoUsuarioError(errorMsg);
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        showNuevoUsuarioError('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Inicializar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar esta lógica en páginas que tengan el formulario de nuevo usuario
    const nuevoUsuarioForm = document.getElementById('nuevo-usuario-form');
    if (!nuevoUsuarioForm) {
        // Estamos en otra página (por ejemplo, index), no hacer nada
        return;
    }

    // Botón de registrar usuario
    const registrarBtn = document.getElementById('registrar-usuario-btn');
    if (registrarBtn) {
        registrarBtn.addEventListener('click', registrarUsuario);
    }
    
    // Verificar que el usuario sea administrador
    const isAuth = isAuthenticated();
    const rol = getUserRol();
    
    if (!isAuth || rol !== 'admin') {
        // Si no es admin, redirigir al inicio
        window.location.href = getBasePath() === '' ? 'index.html' : '../index.html';
    }
});
