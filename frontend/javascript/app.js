// Función para cargar componentes HTML
async function loadComponent(componentPath, targetElementId) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Error al cargar el componente: ${componentPath}`);
        }
        const html = await response.text();
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement.innerHTML = html;
            return true;
        } else {
            console.error(`No se encontró el elemento con ID: ${targetElementId}`);
            return false;
        }
    } catch (error) {
        console.error(`Error al cargar componente ${componentPath}:`, error);
        return false;
    }
}

// Inicializar modales después de cargar componentes
function initializeModals() {
    // Botón de "Iniciar Sesión" en el header
    const loginButton = document.querySelector('a[href=""]');
    if (loginButton && loginButton.textContent.includes('Iniciar Sesión')) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            }
        });
    }
}

// Cargar componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar header sin sesión
    await loadComponent('frontend/components/header_without_session.html', 'header-container');
    
    // Cargar footer
    await loadComponent('frontend/components/footer.html', 'footer-container');
    
    // Inicializar modales después de cargar los componentes
    initializeModals();
});

