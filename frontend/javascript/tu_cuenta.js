// Función para obtener la imagen de perfil según el género
function getProfileImage(genero) {
    const basePath = getBasePath();
    const imagePath = basePath === '' ? 'frontend/img/image_profile/' : '../img/image_profile/';
    
    switch(genero) {
        case 'M':
            return imagePath + 'Man.png';
        case 'F':
            return imagePath + 'Woman.png';
        case 'X':
        default:
            return imagePath + 'Not Gender.png';
    }
}

// Función para obtener el texto del rol
function getRolText(rol) {
    if (!rol || rol === null || rol === '') {
        return 'Sin rol definido';
    }
    switch(rol.toLowerCase()) {
        case 'admin':
            return 'Administrador';
        case 'consultor':
            return 'Consultor';
        default:
            return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
    }
}

// Función para obtener el texto del género
function getGeneroText(genero) {
    switch(genero) {
        case 'M':
            return 'Masculino';
        case 'F':
            return 'Femenino';
        case 'X':
        default:
            return 'Sin definir';
    }
}

// Función para cargar la información del usuario
async function loadUserInfo() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = getBasePath() === '' ? 'index.html' : '../index.html';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/auth/user/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar información del usuario');
        }
        
        const data = await response.json();
        const user = data.user;
        
        // Actualizar nombre completo
        const nombreCompleto = `${user.nombre} ${user.apellido}`;
        document.getElementById('nombre-completo').textContent = nombreCompleto;
        
        // Actualizar correo electrónico
        document.getElementById('correo-display').textContent = user.correo || '';
        
        // Actualizar rol
        const rolText = getRolText(user.rol);
        document.getElementById('rol-display').textContent = rolText;
        
        // Actualizar cargo
        const cargoText = user.cargo && user.cargo.trim() !== '' ? user.cargo : 'Sin cargo definido';
        document.getElementById('cargo-display').textContent = cargoText;
        
        // Actualizar género (sin etiqueta)
        const generoText = getGeneroText(user.genero || 'X');
        document.getElementById('genero-display').textContent = generoText;
        
        // Actualizar imagen de perfil
        const profileImage = document.getElementById('profile-image');
        profileImage.src = getProfileImage(user.genero || 'X');
        
        // Guardar datos del usuario para usar en los modales
        window.currentUser = user;
        
    } catch (error) {
        console.error('Error al cargar información del usuario:', error);
        showCuentaError('Error al cargar la información. Por favor, recarga la página.');
    }
}

// Función para mostrar errores
function showCuentaError(message) {
    const errorMessage = document.getElementById('error-message-cuenta');
    const successMessage = document.getElementById('success-message-cuenta');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

// Función para mostrar éxito
function showCuentaSuccess(message) {
    const errorMessage = document.getElementById('error-message-cuenta');
    const successMessage = document.getElementById('success-message-cuenta');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.classList.remove('hidden');
    }
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

// Función para limpiar mensajes
function clearCuentaMessages() {
    const errorMessage = document.getElementById('error-message-cuenta');
    const successMessage = document.getElementById('success-message-cuenta');
    if (errorMessage) errorMessage.classList.add('hidden');
    if (successMessage) successMessage.classList.add('hidden');
}

// Función para abrir modal de cambiar nombre
function openModalCambiarNombre() {
    const modal = document.getElementById('modal-cambiar-nombre');
    if (modal && window.currentUser) {
        // Llenar los campos con los valores actuales
        document.getElementById('nuevo-nombre').value = window.currentUser.nombre || '';
        document.getElementById('nuevo-apellido').value = window.currentUser.apellido || '';
        modal.showModal();
        document.body.classList.add('modal-open');
    }
}

// Función para cerrar modal de cambiar nombre
function closeModalCambiarNombre() {
    const modal = document.getElementById('modal-cambiar-nombre');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-cambiar-nombre').reset();
    }
}

// Función para abrir modal de cambiar contraseña
function openModalCambiarPassword() {
    const modal = document.getElementById('modal-cambiar-password');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        // Limpiar errores
        document.getElementById('error-password-actual').classList.add('hidden');
        document.getElementById('error-password-match').classList.add('hidden');
    }
}

// Función para cerrar modal de cambiar contraseña
function closeModalCambiarPassword() {
    const modal = document.getElementById('modal-cambiar-password');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-cambiar-password').reset();
        document.getElementById('error-password-actual').classList.add('hidden');
        document.getElementById('error-password-match').classList.add('hidden');
    }
}

// Función para actualizar nombre y apellido
async function updateNombreApellido() {
    const nuevoNombre = document.getElementById('nuevo-nombre').value.trim();
    const nuevoApellido = document.getElementById('nuevo-apellido').value.trim();
    
    if (!nuevoNombre || !nuevoApellido) {
        showCuentaError('Por favor, completa todos los campos');
        return;
    }
    
    const token = getAuthToken();
    if (!token) {
        showCuentaError('No estás autenticado. Por favor, inicia sesión.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/auth/update-profile/', {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nuevoNombre,
                apellido: nuevoApellido
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showCuentaSuccess('Nombre y apellido actualizados correctamente');
            closeModalCambiarNombre();
            // Recargar información del usuario
            await loadUserInfo();
        } else {
            showCuentaError(data.message || 'Error al actualizar el nombre');
        }
    } catch (error) {
        console.error('Error al actualizar nombre:', error);
        showCuentaError('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para cambiar contraseña
async function changePassword() {
    const passwordActual = document.getElementById('password-actual').value;
    const nuevaPassword = document.getElementById('nueva-password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;
    
    // Limpiar errores previos
    document.getElementById('error-password-actual').classList.add('hidden');
    document.getElementById('error-password-match').classList.add('hidden');
    
    if (!passwordActual || !nuevaPassword || !confirmarPassword) {
        showCuentaError('Por favor, completa todos los campos');
        return;
    }
    
    if (nuevaPassword.length < 6) {
        showCuentaError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (nuevaPassword !== confirmarPassword) {
        document.getElementById('error-password-match').classList.remove('hidden');
        return;
    }
    
    const token = getAuthToken();
    if (!token) {
        showCuentaError('No estás autenticado. Por favor, inicia sesión.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/auth/change-password/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: passwordActual,
                new_password: nuevaPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showCuentaSuccess('Contraseña actualizada correctamente');
            closeModalCambiarPassword();
        } else {
            if (data.message && data.message.toLowerCase().includes('incorrecta')) {
                document.getElementById('error-password-actual').classList.remove('hidden');
            } else {
                showCuentaError(data.message || 'Error al cambiar la contraseña');
            }
        }
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        showCuentaError('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Funciones para edición inline de cargo
function enableEditCargo() {
    const cargoDisplay = document.getElementById('cargo-display');
    const cargoInput = document.getElementById('cargo-input');
    const btnEdit = document.getElementById('btn-edit-cargo');
    const btnSave = document.getElementById('btn-save-cargo');
    const btnCancel = document.getElementById('btn-cancel-cargo');
    
    if (!cargoDisplay || !cargoInput) return;
    
    // Guardar valor original
    const originalValue = cargoDisplay.textContent === 'Sin cargo definido' ? '' : cargoDisplay.textContent;
    cargoInput.value = originalValue;
    
    // Mostrar input, ocultar display
    cargoDisplay.classList.add('hidden');
    cargoInput.classList.remove('hidden');
    
    // Mostrar botones de guardar/cancelar, ocultar editar
    btnEdit.classList.add('hidden');
    btnSave.classList.remove('hidden');
    btnCancel.classList.remove('hidden');
    
    // Enfocar el input
    cargoInput.focus();
    cargoInput.select();
}

function cancelEditCargo() {
    const cargoDisplay = document.getElementById('cargo-display');
    const cargoInput = document.getElementById('cargo-input');
    const btnEdit = document.getElementById('btn-edit-cargo');
    const btnSave = document.getElementById('btn-save-cargo');
    const btnCancel = document.getElementById('btn-cancel-cargo');
    
    if (!cargoDisplay || !cargoInput) return;
    
    // Ocultar input, mostrar display
    cargoInput.classList.add('hidden');
    cargoDisplay.classList.remove('hidden');
    
    // Mostrar botón editar, ocultar guardar/cancelar
    btnEdit.classList.remove('hidden');
    btnSave.classList.add('hidden');
    btnCancel.classList.add('hidden');
}

async function saveCargo() {
    const cargoInput = document.getElementById('cargo-input');
    const cargoDisplay = document.getElementById('cargo-display');
    const btnEdit = document.getElementById('btn-edit-cargo');
    const btnSave = document.getElementById('btn-save-cargo');
    const btnCancel = document.getElementById('btn-cancel-cargo');
    
    if (!cargoInput || !cargoDisplay) return;
    
    const nuevoCargo = cargoInput.value.trim();
    
    const token = getAuthToken();
    if (!token) {
        showCuentaError('No estás autenticado. Por favor, inicia sesión.');
        cancelEditCargo();
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/auth/update-profile/', {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cargo: nuevoCargo
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Actualizar display
            cargoDisplay.textContent = nuevoCargo || 'Sin cargo definido';
            
            // Ocultar input, mostrar display
            cargoInput.classList.add('hidden');
            cargoDisplay.classList.remove('hidden');
            
            // Mostrar botón editar, ocultar guardar/cancelar
            btnEdit.classList.remove('hidden');
            btnSave.classList.add('hidden');
            btnCancel.classList.add('hidden');
            
            // Actualizar datos del usuario
            if (window.currentUser) {
                window.currentUser.cargo = nuevoCargo || null;
            }
            
            showCuentaSuccess('Cargo actualizado correctamente');
        } else {
            showCuentaError(data.message || 'Error al actualizar el cargo');
        }
    } catch (error) {
        console.error('Error al actualizar cargo:', error);
        showCuentaError('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Funciones para edición inline de género
function enableEditGenero() {
    const generoDisplay = document.getElementById('genero-display');
    const generoInput = document.getElementById('genero-input');
    const btnEdit = document.getElementById('btn-edit-genero');
    const btnSave = document.getElementById('btn-save-genero');
    const btnCancel = document.getElementById('btn-cancel-genero');
    
    if (!generoDisplay || !generoInput) return;
    
    // Obtener valor actual del género
    const currentGenero = window.currentUser?.genero || 'X';
    generoInput.value = currentGenero;
    
    // Mostrar select, ocultar display
    generoDisplay.classList.add('hidden');
    generoInput.classList.remove('hidden');
    
    // Mostrar botones de guardar/cancelar, ocultar editar
    btnEdit.classList.add('hidden');
    btnSave.classList.remove('hidden');
    btnCancel.classList.remove('hidden');
}

function cancelEditGenero() {
    const generoDisplay = document.getElementById('genero-display');
    const generoInput = document.getElementById('genero-input');
    const btnEdit = document.getElementById('btn-edit-genero');
    const btnSave = document.getElementById('btn-save-genero');
    const btnCancel = document.getElementById('btn-cancel-genero');
    
    if (!generoDisplay || !generoInput) return;
    
    // Ocultar select, mostrar display
    generoInput.classList.add('hidden');
    generoDisplay.classList.remove('hidden');
    
    // Mostrar botón editar, ocultar guardar/cancelar
    btnEdit.classList.remove('hidden');
    btnSave.classList.add('hidden');
    btnCancel.classList.add('hidden');
}

async function saveGenero() {
    const generoInput = document.getElementById('genero-input');
    const generoDisplay = document.getElementById('genero-display');
    const btnEdit = document.getElementById('btn-edit-genero');
    const btnSave = document.getElementById('btn-save-genero');
    const btnCancel = document.getElementById('btn-cancel-genero');
    
    if (!generoInput || !generoDisplay) return;
    
    const nuevoGenero = generoInput.value;
    
    const token = getAuthToken();
    if (!token) {
        showCuentaError('No estás autenticado. Por favor, inicia sesión.');
        cancelEditGenero();
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/auth/update-profile/', {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                genero: nuevoGenero
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Actualizar display
            const generoText = getGeneroText(nuevoGenero);
            generoDisplay.textContent = generoText;
            
            // Actualizar imagen de perfil
            const profileImage = document.getElementById('profile-image');
            if (profileImage) {
                profileImage.src = getProfileImage(nuevoGenero);
            }
            
            // Ocultar select, mostrar display
            generoInput.classList.add('hidden');
            generoDisplay.classList.remove('hidden');
            
            // Mostrar botón editar, ocultar guardar/cancelar
            btnEdit.classList.remove('hidden');
            btnSave.classList.add('hidden');
            btnCancel.classList.add('hidden');
            
            // Actualizar datos del usuario
            if (window.currentUser) {
                window.currentUser.genero = nuevoGenero;
            }
            
            showCuentaSuccess('Género actualizado correctamente');
        } else {
            showCuentaError(data.message || 'Error al actualizar el género');
        }
    } catch (error) {
        console.error('Error al actualizar género:', error);
        showCuentaError('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!isAuthenticated()) {
        window.location.href = getBasePath() === '' ? 'index.html' : '../index.html';
        return;
    }
    
    // Cargar información del usuario
    loadUserInfo();
    
    // Botones para abrir modales
    const btnCambiarNombre = document.getElementById('btn-cambiar-nombre');
    const btnCambiarPassword = document.getElementById('btn-cambiar-password');
    
    if (btnCambiarNombre) {
        btnCambiarNombre.addEventListener('click', openModalCambiarNombre);
    }
    
    if (btnCambiarPassword) {
        btnCambiarPassword.addEventListener('click', openModalCambiarPassword);
    }
    
    // Botones para cerrar modales
    const closeModalNombreBtn = document.getElementById('close-modal-nombre-btn');
    const closeModalPasswordBtn = document.getElementById('close-modal-password-btn');
    
    if (closeModalNombreBtn) {
        closeModalNombreBtn.addEventListener('click', closeModalCambiarNombre);
    }
    
    if (closeModalPasswordBtn) {
        closeModalPasswordBtn.addEventListener('click', closeModalCambiarPassword);
    }
    
    // Cerrar modales al hacer clic fuera
    const modalNombre = document.getElementById('modal-cambiar-nombre');
    const modalPassword = document.getElementById('modal-cambiar-password');
    
    if (modalNombre) {
        modalNombre.addEventListener('click', function(e) {
            if (e.target === modalNombre) {
                closeModalCambiarNombre();
            }
        });
    }
    
    if (modalPassword) {
        modalPassword.addEventListener('click', function(e) {
            if (e.target === modalPassword) {
                closeModalCambiarPassword();
            }
        });
    }
    
    // Formularios
    const formCambiarNombre = document.getElementById('form-cambiar-nombre');
    const formCambiarPassword = document.getElementById('form-cambiar-password');
    
    if (formCambiarNombre) {
        formCambiarNombre.addEventListener('submit', function(e) {
            e.preventDefault();
            updateNombreApellido();
        });
    }
    
    if (formCambiarPassword) {
        formCambiarPassword.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
    
    // Event listeners para edición inline de cargo
    const btnEditCargo = document.getElementById('btn-edit-cargo');
    const btnSaveCargo = document.getElementById('btn-save-cargo');
    const btnCancelCargo = document.getElementById('btn-cancel-cargo');
    
    if (btnEditCargo) {
        btnEditCargo.addEventListener('click', enableEditCargo);
    }
    if (btnSaveCargo) {
        btnSaveCargo.addEventListener('click', saveCargo);
    }
    if (btnCancelCargo) {
        btnCancelCargo.addEventListener('click', cancelEditCargo);
    }
    
    // Event listeners para edición inline de género
    const btnEditGenero = document.getElementById('btn-edit-genero');
    const btnSaveGenero = document.getElementById('btn-save-genero');
    const btnCancelGenero = document.getElementById('btn-cancel-genero');
    
    if (btnEditGenero) {
        btnEditGenero.addEventListener('click', enableEditGenero);
    }
    if (btnSaveGenero) {
        btnSaveGenero.addEventListener('click', saveGenero);
    }
    if (btnCancelGenero) {
        btnCancelGenero.addEventListener('click', cancelEditGenero);
    }
    
    // Permitir guardar con Enter en el input de cargo
    const cargoInput = document.getElementById('cargo-input');
    if (cargoInput) {
        cargoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveCargo();
            } else if (e.key === 'Escape') {
                cancelEditCargo();
            }
        });
    }
});

