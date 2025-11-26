// Función para abrir el modal de iniciar sesión
function openLoginModal() {
    const modal = document.getElementById('modal-login');
    if (modal) {
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
    }
}

// Event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
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
});

