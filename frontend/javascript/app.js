// Función para obtener la ruta base según la ubicación de la página
function getBasePath() {
    const path = window.location.pathname;
    // Si estamos en la raíz (index.html) o en frontend/pages/
    if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) {
        return '';
    } else if (path.includes('/frontend/pages/')) {
        return '../';
    } else if (path.includes('/pages/')) {
        return '../';
    }
    return '';
}

// Función para cargar componentes HTML
async function loadComponent(componentPath, targetElementId) {
    try {
        const basePath = getBasePath();
        // Ajustar ruta cuando estamos dentro de "frontend/pages"
        // y se pasa un path que empieza con "frontend/"
        let adjustedPath = componentPath;
        if (basePath === '../' && componentPath.startsWith('frontend/')) {
            // Ejemplo:
            //  - basePath: '../'
            //  - componentPath: 'frontend/components/header.html'
            //  -> '../components/header.html'
            adjustedPath = componentPath.replace(/^frontend\//, '');
        }
        const fullPath = basePath + adjustedPath;
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Error al cargar el componente: ${fullPath} - Status: ${response.status}`);
        }
        const html = await response.text();
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            // Limpiar el contenido previo
            targetElement.innerHTML = '';
            // Insertar el nuevo HTML
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
    
    // Botón de cerrar (X) en el modal
    const closeButton = document.querySelector('#modal-login button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            if (typeof closeLoginModal === 'function') {
                closeLoginModal();
            }
        });
    }

    // Cerrar modal al hacer clic fuera de él (en el backdrop)
    const modal = document.getElementById('modal-login');
    if (modal) {
        modal.addEventListener('click', function(e) {
            // Si el clic fue directamente en el dialog (backdrop), cerrar
            if (e.target === modal) {
                if (typeof closeLoginModal === 'function') {
                    closeLoginModal();
                }
            }
        });
    }
}

// Función para ajustar enlaces del footer según la ubicación
function adjustFooterLinks() {
    const footer = document.getElementById('footer-container');
    if (footer) {
        const links = footer.querySelectorAll('a[data-page]');
        links.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page) {
                const basePath = getBasePath();
                // Si estamos en la raíz, usar frontend/pages/
                // Si estamos en frontend/pages/, usar solo el nombre del archivo
                if (basePath === '') {
                    link.setAttribute('href', `frontend/pages/${page}.html`);
                } else {
                    link.setAttribute('href', `${page}.html`);
                }
            }
        });
    }
}

// Función para crear un botón de menú
function createMenuButton(text, iconPath, href = '', id = '') {
    const a = document.createElement('a');
    a.href = href;
    if (id) a.id = id;
    a.className = 'flex items-center gap-1 md:gap-2 text-blue-100 hover:text-blue-300 transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap';
    a.style.display = 'flex';
    a.style.visibility = 'visible';
    
    // Crear SVG usando un template temporal para parsear el HTML correctamente
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 flex-shrink-0">${iconPath}</svg>`;
    const svg = tempDiv.firstElementChild;
    
    const span = document.createElement('span');
    span.className = 'inline';
    span.textContent = text;
    
    a.appendChild(svg);
    a.appendChild(span);
    
    return a;
}

// Función para crear un item del sidebar
function createSidebarItem(text, iconPath, href = '', id = '') {
    const item = document.createElement('a');
    item.href = href;
    if (id) item.id = id;
    item.className = 'w-full flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-slate-700/50 hover:text-blue-300 transition-all duration-300 rounded-lg';
    
    // Crear SVG
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 flex-shrink-0">${iconPath}</svg>`;
    const svg = tempDiv.firstElementChild;
    
    const span = document.createElement('span');
    span.className = 'text-sm md:text-base';
    span.textContent = text;
    
    item.appendChild(svg);
    item.appendChild(span);
    
    return item;
}

// Función para abrir el sidebar
function openSidebar() {
    const sidebar = document.getElementById('sidebar-menu');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.classList.add('sidebar-open');
    }
}

// Función para cerrar el sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar-menu');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('sidebar-open');
    }
}

// Función para poblar el sidebar según el rol
function populateSidebar() {
    const sidebarItems = document.getElementById('sidebar-menu-items');
    if (!sidebarItems) return;
    
    // Limpiar items previos
    sidebarItems.innerHTML = '';
    
    const isAuth = isAuthenticated();
    const rol = getUserRol();
    
    if (isAuth && rol === 'admin') {
        const basePath = getBasePath();
        const nuevoUsuarioHref = basePath === '' ? 'frontend/pages/registro_usuario.html' : 'registro_usuario.html';
        sidebarItems.appendChild(createSidebarItem('Nuevo usuario', '<path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />', nuevoUsuarioHref));
        sidebarItems.appendChild(createSidebarItem('Nuevo registro', '<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />'));
        sidebarItems.appendChild(createSidebarItem('Nueva consulta', '<path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clip-rule="evenodd" /><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />'));
        const basePathSidebar = getBasePath();
        const tuCuentaHrefSidebar = basePathSidebar === '' ? 'frontend/pages/tu_cuenta.html' : 'tu_cuenta.html';
        sidebarItems.appendChild(createSidebarItem('Tu cuenta', '<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />', tuCuentaHrefSidebar));
        sidebarItems.appendChild(createSidebarItem('Cerrar Sesión', '<path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />', '#', 'sidebar-logout-btn'));
        
    } else if (isAuth && rol === 'consultor') {
        sidebarItems.appendChild(createSidebarItem('Nuevo registro', '<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />'));
        sidebarItems.appendChild(createSidebarItem('Nueva consulta', '<path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clip-rule="evenodd" /><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />'));
        const basePathSidebarConsultor = getBasePath();
        const tuCuentaHrefSidebarConsultor = basePathSidebarConsultor === '' ? 'frontend/pages/tu_cuenta.html' : 'tu_cuenta.html';
        sidebarItems.appendChild(createSidebarItem('Tu cuenta', '<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />', tuCuentaHrefSidebarConsultor));
        sidebarItems.appendChild(createSidebarItem('Cerrar Sesión', '<path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />', '#', 'sidebar-logout-btn'));
        
    } else {
        sidebarItems.appendChild(createSidebarItem('Iniciar Sesión', '<path fill-rule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z" clip-rule="evenodd" />', ''));
    }
    
    // Inicializar eventos del sidebar
    initializeSidebarEvents();
}

// Función para cargar el header según el rol del usuario
async function loadHeaderByRole() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) {
        console.error('No se encontró el contenedor del header');
        return;
    }
    
    // Cargar el header base (siempre el mismo)
    const loaded = await loadComponent('frontend/components/header.html', 'header-container');
    
    if (!loaded) {
        console.error('Error al cargar el header base');
        return;
    }
    
    // Esperar un momento para que el DOM se actualice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const isAuth = isAuthenticated();
    const rol = getUserRol();
    const userData = typeof getUserData === 'function' ? getUserData() : null;
    const userDisplayName = userData
        ? `${userData.nombre} ${userData.apellido}`.trim()
        : 'Tu cuenta';
    
    const leftMenu = document.getElementById('header-left-menu');
    const rightMenu = document.getElementById('header-right-menu');
    
    if (!leftMenu || !rightMenu) {
        console.error('No se encontraron los contenedores de menú');
        return;
    }
    
    // Limpiar los menús
    leftMenu.innerHTML = '';
    rightMenu.innerHTML = '';
    
    if (isAuth && rol === 'admin') {
        
        // Menú izquierdo - Admin
        const basePath = getBasePath();
        const nuevoUsuarioHref = basePath === '' ? 'frontend/pages/registro_usuario.html' : 'registro_usuario.html';
        leftMenu.appendChild(createMenuButton('Nuevo usuario', '<path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />', nuevoUsuarioHref));
        leftMenu.appendChild(createMenuButton('Nuevo registro', '<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />'));
        leftMenu.appendChild(createMenuButton('Nueva consulta', '<path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clip-rule="evenodd" /><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />'));
        
        // Menú derecho - Admin
        const tuCuentaHref = basePath === '' ? 'frontend/pages/tu_cuenta.html' : 'tu_cuenta.html';
        rightMenu.appendChild(createMenuButton(userDisplayName, '<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />', tuCuentaHref));
        rightMenu.appendChild(createMenuButton('Cerrar Sesión', '<path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />', '#', 'logout-btn'));
        
    } else if (isAuth && rol === 'consultor') {
        // Menú izquierdo - Consultor
        leftMenu.appendChild(createMenuButton('Nuevo registro', '<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />'));
        leftMenu.appendChild(createMenuButton('Nueva consulta', '<path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clip-rule="evenodd" /><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />'));
        
        // Menú derecho - Consultor
        const basePathConsultor = getBasePath();
        const tuCuentaHrefConsultor = basePathConsultor === '' ? 'frontend/pages/tu_cuenta.html' : 'tu_cuenta.html';
        rightMenu.appendChild(createMenuButton(userDisplayName, '<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />', tuCuentaHrefConsultor));
        rightMenu.appendChild(createMenuButton('Cerrar Sesión', '<path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />', '#', 'logout-btn'));
        
    } else {
        // Menú derecho - Sin sesión
        rightMenu.appendChild(createMenuButton('Iniciar Sesión', '<path fill-rule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z" clip-rule="evenodd" />', ''));
    }
    
    // Inicializar eventos del header después de configurarlo
    initializeHeaderEvents();
    
    // Poblar el sidebar con los mismos items
    populateSidebar();
}

// Función para inicializar eventos del sidebar
function initializeSidebarEvents() {
    // Botón de cerrar sidebar
    const closeBtn = document.getElementById('close-sidebar-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }
    
    // Overlay para cerrar al hacer clic fuera
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Botón de "Iniciar Sesión" en el sidebar sin sesión
    const loginButton = document.querySelector('#sidebar-menu-items a[href=""]');
    if (loginButton && loginButton.textContent.includes('Iniciar Sesión')) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            closeSidebar();
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            }
        });
    }
    
    // Botón de "Cerrar Sesión" en el sidebar
    const logoutButton = document.getElementById('sidebar-logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
            
            // Abrir modal de confirmación
            if (typeof openLogoutModal === 'function') {
                openLogoutModal();
            } else {
                // Fallback: usar confirm nativo
                if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    if (typeof logout === 'function') {
                        logout();
                    } else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_data');
                        localStorage.removeItem('user_rol');
                        window.location.reload();
                    }
                }
            }
        });
    }
}

// Función para inicializar eventos del header (botones de cerrar sesión, etc.)
function initializeHeaderEvents() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) {
        console.error('No se encontró el contenedor del header');
        return;
    }
    
    const header = headerContainer.querySelector('header');
    if (!header) {
        console.error('No se encontró el elemento <header>');
        return;
    }
    
    // Botón hamburguesa para abrir el sidebar (solo en móviles)
    const openSidebarBtn = header.querySelector('#open-sidebar-btn');
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof openSidebar === 'function') {
                openSidebar();
            }
        });
    }
    
    // Botón de "Iniciar Sesión" en el header sin sesión
    const loginButton = header.querySelector('a[href=""]');
    if (loginButton && (loginButton.textContent.includes('Iniciar Sesión') || loginButton.textContent.includes('Iniciar'))) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            }
        });
    }
    
    // Buscar el botón de "Cerrar Sesión" por ID (ahora se crea dinámicamente)
    const logoutButton = document.getElementById('logout-btn');
    
    if (logoutButton) {
        // Asegurar visibilidad
        logoutButton.style.display = 'flex';
        logoutButton.style.visibility = 'visible';
        logoutButton.style.opacity = '1';
        
        // Remover listeners previos si existen
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
        
        // Asegurar que tenga el ID y visibilidad
        newLogoutButton.id = 'logout-btn';
        newLogoutButton.style.display = 'flex';
        newLogoutButton.style.visibility = 'visible';
        newLogoutButton.style.opacity = '1';
        
        newLogoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Abrir modal de confirmación
            if (typeof openLogoutModal === 'function') {
                openLogoutModal();
            } else {
                // Fallback: usar confirm nativo si el modal no está disponible
                if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    if (typeof logout === 'function') {
                        logout();
                    } else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_data');
                        localStorage.removeItem('user_rol');
                        window.location.reload();
                    }
                }
            }
        });
    }
}

// Cargar componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar header según el rol del usuario
    await loadHeaderByRole();
    
    // Cargar sidebar (directamente en el body)
    const basePath = getBasePath();
    try {
        let sidebarPath = basePath + 'frontend/components/sidebar_menu.html';
        // Si estamos en "frontend/pages", ajustar la ruta al componente
        if (basePath === '../') {
            sidebarPath = basePath + 'components/sidebar_menu.html';
        }
        const sidebarResponse = await fetch(sidebarPath);
        if (sidebarResponse.ok) {
            const sidebarHtml = await sidebarResponse.text();
            document.body.insertAdjacentHTML('beforeend', sidebarHtml);
            // Esperar un momento para que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));
            // Poblar el sidebar después de cargarlo
            populateSidebar();
        }
    } catch (error) {
        console.error('Error al cargar el sidebar:', error);
    }
    
    // Cargar footer
    await loadComponent('frontend/components/footer.html', 'footer-container');
    
    // Ajustar enlaces del footer
    adjustFooterLinks();
    
    // Cargar modales (ambos en el mismo contenedor)
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        const basePath = getBasePath();
        try {
            // Cargar modal de login
            let loginPath = basePath + 'frontend/components/modal_login.html';
            let logoutPath = basePath + 'frontend/components/modal_logout.html';
            // Si estamos en "frontend/pages", ajustar rutas a los componentes
            if (basePath === '../') {
                loginPath = basePath + 'components/modal_login.html';
                logoutPath = basePath + 'components/modal_logout.html';
            }
            const loginResponse = await fetch(loginPath);
            const loginModal = await loginResponse.text();
            
            // Cargar modal de logout
            const logoutResponse = await fetch(logoutPath);
            const logoutModal = await logoutResponse.text();
            
            // Insertar ambos modales
            modalContainer.innerHTML = loginModal + logoutModal;
        } catch (error) {
            console.error('Error al cargar modales:', error);
        }
    }
    
    // Esperar un momento para que los modales se carguen
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Inicializar modales después de cargar los componentes
    initializeModals();
    
    // Inicializar el modal de login específicamente
    if (typeof initializeLoginModal === 'function') {
        initializeLoginModal();
    }
    
    // Inicializar el modal de logout
    if (typeof initializeLogoutModal === 'function') {
        initializeLogoutModal();
    }
    
});

