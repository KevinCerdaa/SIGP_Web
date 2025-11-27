// Configuración de la API
const API_BASE_URL = 'http://localhost:8000/api';

// Función para realizar login
async function login(correo, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: correo,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Guardar token y datos del usuario en localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            localStorage.setItem('user_rol', data.rol);
            
            // Retornar éxito
            return {
                success: true,
                message: data.message,
                user: data.user,
                rol: data.rol
            };
        } else {
            // Retornar error
            return {
                success: false,
                message: data.message || 'Error al iniciar sesión'
            };
        }
    } catch (error) {
        console.error('Error en login:', error);
        return {
            success: false,
            message: 'Error de conexión con el servidor'
        };
    }
}

// Función para cerrar sesión
async function logout() {
    try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
            await fetch(`${API_BASE_URL}/auth/logout/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                }
            });
        }
        
        // Limpiar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_rol');
        
        // Recargar la página para actualizar el header
        window.location.reload();
    } catch (error) {
        console.error('Error en logout:', error);
        // Aún así limpiar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_rol');
        window.location.reload();
    }
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem('auth_token') !== null;
}

// Función para obtener el rol del usuario
function getUserRol() {
    return localStorage.getItem('user_rol');
}

// Función para obtener los datos del usuario
function getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Función para obtener el token de autenticación
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// Función para hacer peticiones autenticadas
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    
    return fetch(url, {
        ...options,
        headers
    });
}


