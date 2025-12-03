// Función para habilitar/deshabilitar el botón según la selección
function updateContinuarButton() {
    const tipoSelect = document.getElementById('tipo-registro-select');
    const continuarBtn = document.getElementById('btn-continuar-registro');
    
    if (tipoSelect && continuarBtn) {
        if (tipoSelect.value && tipoSelect.value !== '') {
            continuarBtn.disabled = false;
        } else {
            continuarBtn.disabled = true;
        }
    }
}

// Función para abrir el modal de pandillas
function openModalPandillas() {
    const modal = document.getElementById('modal-nueva-pandilla');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        // Cargar datos necesarios para los selectores
        loadZonasForPandilla();
        loadDireccionesForPandilla();
        loadDelitosForPandilla();
        loadFaltasForPandilla();
        loadPandillasForRivalidades();
        loadRedesSocialesForPandilla();
    }
}

// Función para cerrar el modal de pandillas
function closeModalPandillas() {
    const modal = document.getElementById('modal-nueva-pandilla');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nueva-pandilla').reset();
        // Limpiar mensajes
        document.getElementById('error-message-pandilla').classList.add('hidden');
        document.getElementById('success-message-pandilla').classList.add('hidden');
    }
}

// Función para cargar zonas en el selector
async function loadZonasForPandilla() {
    try {
        const response = await fetch('http://localhost:8000/api/zones/');
        if (!response.ok) throw new Error('Error al cargar zonas');
        const zones = await response.json();
        
        const zonaSelect = document.getElementById('zona-pandilla');
        if (!zonaSelect) return;
        
        zonaSelect.innerHTML = '<option value="" disabled selected>Selecciona una zona</option>';
        zones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.id;
            option.textContent = zone.nombre;
            zonaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar zonas:', error);
        const zonaSelect = document.getElementById('zona-pandilla');
        if (zonaSelect) {
            zonaSelect.innerHTML = '<option value="" disabled>Error al cargar zonas</option>';
        }
    }
}

// Función para cargar direcciones en el selector
async function loadDireccionesForPandilla() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const direccionSelect = document.getElementById('direccion-pandilla');
            if (direccionSelect) {
                direccionSelect.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar direcciones</option>';
            }
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/direcciones/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar direcciones');
        const data = await response.json();
        
        const direccionSelect = document.getElementById('direccion-pandilla');
        if (!direccionSelect) return;
        
        direccionSelect.innerHTML = '<option value="" disabled selected>Selecciona una dirección</option>';
        
        if (data.success && data.direcciones && data.direcciones.length > 0) {
            data.direcciones.forEach(direccion => {
                const option = document.createElement('option');
                option.value = direccion.id_direccion;
                const direccionText = `${direccion.calle}${direccion.numero ? ' ' + direccion.numero : ''}${direccion.colonia ? ', ' + direccion.colonia : ''}`;
                option.textContent = direccionText;
                direccionSelect.appendChild(option);
            });
        } else {
            direccionSelect.innerHTML = '<option value="" disabled selected>No hay direcciones disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
        const direccionSelect = document.getElementById('direccion-pandilla');
        if (direccionSelect) {
            direccionSelect.innerHTML = '<option value="" disabled selected>Error al cargar direcciones</option>';
        }
    }
}

// Función para cargar delitos en el contenedor con checkboxes
async function loadDelitosForPandilla() {
    try {
        const response = await fetch('http://localhost:8000/api/crimes/');
        if (!response.ok) throw new Error('Error al cargar delitos');
        const crimes = await response.json();
        
        const delitosContainer = document.getElementById('delitos-pandilla-container');
        if (!delitosContainer) return;
        
        delitosContainer.innerHTML = '';
        if (crimes.length === 0) {
            delitosContainer.innerHTML = '<p class="text-slate-500 text-sm">No hay delitos disponibles</p>';
            return;
        }
        
        crimes.forEach(crime => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
            label.innerHTML = `
                <input type="checkbox" name="delitos" value="${crime.id}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${crime.nombre}</span>
            `;
            delitosContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar delitos:', error);
        const delitosContainer = document.getElementById('delitos-pandilla-container');
        if (delitosContainer) {
            delitosContainer.innerHTML = '<p class="text-red-500 text-sm">Error al cargar delitos</p>';
        }
    }
}

// Función para cargar faltas en el contenedor con checkboxes
async function loadFaltasForPandilla() {
    try {
        // TODO: Crear endpoint para faltas
        // Por ahora dejamos un placeholder
        const faltasContainer = document.getElementById('faltas-pandilla-container');
        if (faltasContainer) {
            faltasContainer.innerHTML = '<p class="text-slate-500 text-sm">No disponible aún</p>';
        }
    } catch (error) {
        console.error('Error al cargar faltas:', error);
        const faltasContainer = document.getElementById('faltas-pandilla-container');
        if (faltasContainer) {
            faltasContainer.innerHTML = '<p class="text-red-500 text-sm">Error al cargar faltas</p>';
        }
    }
}

// Función para cargar pandillas para rivalidades con checkboxes
async function loadPandillasForRivalidades() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const rivalidadesContainer = document.getElementById('rivalidades-pandilla-container');
            if (rivalidadesContainer) {
                rivalidadesContainer.innerHTML = '<p class="text-slate-500 text-sm">Inicia sesión para cargar pandillas</p>';
            }
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();
        
        const rivalidadesContainer = document.getElementById('rivalidades-pandilla-container');
        if (!rivalidadesContainer) return;
        
        rivalidadesContainer.innerHTML = '';
        if (!data.success || !data.pandillas || data.pandillas.length === 0) {
            rivalidadesContainer.innerHTML = '<p class="text-slate-500 text-sm">No hay pandillas disponibles</p>';
            return;
        }
        
        data.pandillas.forEach(pandilla => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
            label.innerHTML = `
                <input type="checkbox" name="rivalidades" value="${pandilla.id_pandilla}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${pandilla.nombre}</span>
            `;
            rivalidadesContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
        const rivalidadesContainer = document.getElementById('rivalidades-pandilla-container');
        if (rivalidadesContainer) {
            rivalidadesContainer.innerHTML = '<p class="text-red-500 text-sm">Error al cargar pandillas</p>';
        }
    }
}

// Función para cargar redes sociales con checkboxes
async function loadRedesSocialesForPandilla() {
    try {
        // TODO: Crear endpoint para redes sociales
        // Por ahora dejamos un placeholder
        const redesContainer = document.getElementById('redes-sociales-pandilla-container');
        if (redesContainer) {
            redesContainer.innerHTML = '<p class="text-slate-500 text-sm">No disponible aún</p>';
        }
    } catch (error) {
        console.error('Error al cargar redes sociales:', error);
        const redesContainer = document.getElementById('redes-sociales-pandilla-container');
        if (redesContainer) {
            redesContainer.innerHTML = '<p class="text-red-500 text-sm">Error al cargar redes sociales</p>';
        }
    }
}

// Función para abrir el modal de nueva dirección
function openModalNuevaDireccion() {
    const modal = document.getElementById('modal-nueva-direccion');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
    }
}

// Función para cerrar el modal de nueva dirección
function closeModalNuevaDireccion() {
    const modal = document.getElementById('modal-nueva-direccion');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nueva-direccion').reset();
        // Limpiar mensajes
        document.getElementById('error-message-direccion').classList.add('hidden');
        document.getElementById('success-message-direccion').classList.add('hidden');
    }
}

// Función para mostrar/ocultar búsqueda automática
function toggleBusquedaAutomatica() {
    const busquedaContainer = document.getElementById('busqueda-automatica-container');
    const camposDireccion = document.getElementById('campos-direccion');
    const camposColoniaCp = document.getElementById('campos-colonia-cp');
    const camposCoordenadas = document.getElementById('campos-coordenadas');
    const btnObtenerCoordenadas = document.getElementById('btn-obtener-coordenadas');
    
    if (!busquedaContainer || !camposDireccion || !camposColoniaCp || !camposCoordenadas) return;
    
    // Si está oculto, mostrar búsqueda y ocultar campos
    if (busquedaContainer.classList.contains('hidden')) {
        busquedaContainer.classList.remove('hidden');
        camposDireccion.classList.add('hidden');
        camposColoniaCp.classList.add('hidden');
        camposCoordenadas.classList.add('hidden');
        
        // Actualizar texto del botón (buscar el span dentro del botón)
        const spanBtn = btnObtenerCoordenadas.querySelector('span');
        if (spanBtn) {
            spanBtn.textContent = 'Ingresar datos manualmente';
        }
        btnObtenerCoordenadas.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
        btnObtenerCoordenadas.classList.add('bg-slate-500', 'hover:bg-slate-600');
        
        // Enfocar el input de búsqueda
        const inputBuscar = document.getElementById('input-direccion-buscar');
        if (inputBuscar) {
            setTimeout(() => inputBuscar.focus(), 100);
        }
    } else {
        // Si está visible, ocultar búsqueda y mostrar campos
        busquedaContainer.classList.add('hidden');
        camposDireccion.classList.remove('hidden');
        camposColoniaCp.classList.remove('hidden');
        camposCoordenadas.classList.remove('hidden');
        
        // Actualizar texto del botón (buscar el span dentro del botón)
        const spanBtn = btnObtenerCoordenadas.querySelector('span');
        if (spanBtn) {
            spanBtn.textContent = 'Buscar dirección automáticamente';
        }
        btnObtenerCoordenadas.classList.remove('bg-slate-500', 'hover:bg-slate-600');
        btnObtenerCoordenadas.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
        
        // Limpiar input de búsqueda y mensaje
        const inputBuscar = document.getElementById('input-direccion-buscar');
        const mensajeBusqueda = document.getElementById('mensaje-busqueda');
        if (inputBuscar) inputBuscar.value = '';
        if (mensajeBusqueda) {
            mensajeBusqueda.classList.add('hidden');
            mensajeBusqueda.textContent = '';
        }
    }
}

// Función para buscar dirección
function buscarDireccionAutomatica() {
    // Verificar si Google Maps está disponible
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
        const mensaje = document.getElementById('mensaje-busqueda');
        if (mensaje) {
            mensaje.textContent = 'Google Maps no está disponible. Ingresa los datos manualmente.';
            mensaje.className = 'mt-2 text-sm text-red-500';
            mensaje.classList.remove('hidden');
        }
        return;
    }
    
    const inputBuscar = document.getElementById('input-direccion-buscar');
    const mensajeBusqueda = document.getElementById('mensaje-busqueda');
    
    if (!inputBuscar || !mensajeBusqueda) return;
    
    const direccion = inputBuscar.value.trim();
    if (!direccion) {
        mensajeBusqueda.textContent = 'Por favor, ingresa una dirección';
        mensajeBusqueda.className = 'mt-2 text-sm text-red-500';
        mensajeBusqueda.classList.remove('hidden');
        return;
    }
    
    mensajeBusqueda.textContent = 'Buscando...';
    mensajeBusqueda.className = 'mt-2 text-sm text-blue-400';
    mensajeBusqueda.classList.remove('hidden');
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: direccion }, function(results, status) {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            // Llenar coordenadas
            const latInput = document.getElementById('latitud-direccion');
            const lngInput = document.getElementById('longitud-direccion');
            if (latInput) latInput.value = location.lat();
            if (lngInput) lngInput.value = location.lng();
            
            // Llenar campos de dirección
            const addressComponents = results[0].address_components;
            addressComponents.forEach(component => {
                if (component.types.includes('street_number')) {
                    const numInput = document.getElementById('numero-direccion');
                    if (numInput) numInput.value = component.long_name;
                } else if (component.types.includes('route')) {
                    const calleInput = document.getElementById('calle-direccion');
                    if (calleInput) calleInput.value = component.long_name;
                } else if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
                    const coloniaInput = document.getElementById('colonia-direccion');
                    if (coloniaInput) coloniaInput.value = component.long_name;
                } else if (component.types.includes('postal_code')) {
                    const cpInput = document.getElementById('codigo-postal-direccion');
                    if (cpInput) cpInput.value = component.long_name;
                }
            });
            
            // Ocultar búsqueda y mostrar campos llenados
            const busquedaContainer = document.getElementById('busqueda-automatica-container');
            const camposDireccion = document.getElementById('campos-direccion');
            const camposColoniaCp = document.getElementById('campos-colonia-cp');
            const camposCoordenadas = document.getElementById('campos-coordenadas');
            const btnObtenerCoordenadas = document.getElementById('btn-obtener-coordenadas');
            
            busquedaContainer.classList.add('hidden');
            camposDireccion.classList.remove('hidden');
            camposColoniaCp.classList.remove('hidden');
            camposCoordenadas.classList.remove('hidden');
            
            // Actualizar texto del botón (buscar el span dentro del botón)
            const spanBtn = btnObtenerCoordenadas.querySelector('span');
            if (spanBtn) {
                spanBtn.textContent = 'Buscar dirección automáticamente';
            }
            btnObtenerCoordenadas.classList.remove('bg-slate-500', 'hover:bg-slate-600');
            btnObtenerCoordenadas.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
            
            // Mostrar mensaje de éxito
            const successMsg = document.getElementById('success-message-direccion');
            if (successMsg) {
                successMsg.textContent = 'Dirección encontrada y campos llenados correctamente';
                successMsg.classList.remove('hidden');
                setTimeout(() => {
                    successMsg.classList.add('hidden');
                }, 3000);
            }
        } else {
            mensajeBusqueda.textContent = 'Ingresa los datos manualmente. Ubicación no encontrada.';
            mensajeBusqueda.className = 'mt-2 text-sm text-red-500';
        }
    });
}

// Función para validar y enviar el formulario de dirección
async function submitNuevaDireccionForm(e) {
    e.preventDefault();
    
    const calle = document.getElementById('calle-direccion').value.trim();
    const latitud = document.getElementById('latitud-direccion').value;
    const longitud = document.getElementById('longitud-direccion').value;
    
    // Limpiar mensajes previos
    document.getElementById('error-message-direccion').classList.add('hidden');
    document.getElementById('success-message-direccion').classList.add('hidden');
    document.getElementById('calle-direccion-error').classList.add('hidden');
    document.getElementById('latitud-direccion-error').classList.add('hidden');
    document.getElementById('longitud-direccion-error').classList.add('hidden');
    
    // Validaciones básicas
    let isValid = true;
    
    if (!calle) {
        document.getElementById('calle-direccion-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!latitud || isNaN(parseFloat(latitud))) {
        document.getElementById('latitud-direccion-error').classList.remove('hidden');
        document.getElementById('latitud-direccion-error').textContent = 'La latitud es requerida y debe ser un número válido';
        isValid = false;
    } else if (parseFloat(latitud) < -90 || parseFloat(latitud) > 90) {
        document.getElementById('latitud-direccion-error').classList.remove('hidden');
        document.getElementById('latitud-direccion-error').textContent = 'La latitud debe estar entre -90 y 90';
        isValid = false;
    }
    
    if (!longitud || isNaN(parseFloat(longitud))) {
        document.getElementById('longitud-direccion-error').classList.remove('hidden');
        document.getElementById('longitud-direccion-error').textContent = 'La longitud es requerida y debe ser un número válido';
        isValid = false;
    } else if (parseFloat(longitud) < -180 || parseFloat(longitud) > 180) {
        document.getElementById('longitud-direccion-error').classList.remove('hidden');
        document.getElementById('longitud-direccion-error').textContent = 'La longitud debe estar entre -180 y 180';
        isValid = false;
    }
    
    if (!isValid) {
        document.getElementById('error-message-direccion').textContent = 'Por favor, completa todos los campos requeridos correctamente';
        document.getElementById('error-message-direccion').classList.remove('hidden');
        return;
    }
    
    // Recopilar datos del formulario
    const formData = {
        calle: calle,
        numero: document.getElementById('numero-direccion').value.trim() || null,
        colonia: document.getElementById('colonia-direccion').value.trim() || null,
        codigo_postal: document.getElementById('codigo-postal-direccion').value.trim() || null,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud)
    };
    
    console.log('Datos a enviar:', formData);
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-direccion').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-direccion').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/direcciones/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-direccion').textContent = data.message || 'Dirección registrada correctamente';
            document.getElementById('success-message-direccion').classList.remove('hidden');
            
            // Limpiar formulario después de 2 segundos
            setTimeout(() => {
                document.getElementById('form-nueva-direccion').reset();
                closeModalNuevaDireccion();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar la dirección';
            document.getElementById('error-message-direccion').textContent = errorMsg;
            document.getElementById('error-message-direccion').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar dirección:', error);
        document.getElementById('error-message-direccion').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-direccion').classList.remove('hidden');
    }
}

// Función para manejar el clic en el botón continuar
function handleContinuar() {
    const tipoSelect = document.getElementById('tipo-registro-select');
    if (!tipoSelect || !tipoSelect.value) {
        return;
    }
    
    const tipoRegistro = tipoSelect.value;
    console.log('Tipo de registro seleccionado:', tipoRegistro);
    
    // Abrir el modal correspondiente según el tipo seleccionado
    switch(tipoRegistro) {
        case 'pandillas':
            openModalPandillas();
            break;
        case 'integrantes':
            openModalIntegrantes();
            break;
        case 'eventos':
            openModalEventos();
            break;
        case 'delitos':
            openModalDelitos();
            break;
        case 'faltas':
            openModalFaltas();
            break;
        case 'direcciones':
            openModalNuevaDireccion();
            break;
        case 'rivalidades':
            openModalRivalidades();
            break;
        case 'redes-sociales':
            openModalRedesSociales();
            break;
            // TODO: Abrir modal de redes sociales
            alert('Modal de redes sociales próximamente');
            break;
        default:
            alert('Tipo de registro no reconocido');
    }
}

// ==================== FUNCIONES PARA INTEGRANTES ====================

// Función para abrir el modal de integrantes
function openModalIntegrantes() {
    const modal = document.getElementById('modal-nuevo-integrante');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        // Cargar datos necesarios para los selectores
        loadPandillasForIntegrante();
        loadDireccionesForIntegrante();
        // Limpiar preview de imágenes
        document.getElementById('imagenes-preview-container').innerHTML = '';
    }
}

// Función para cerrar el modal de integrantes
function closeModalIntegrantes() {
    const modal = document.getElementById('modal-nuevo-integrante');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nuevo-integrante').reset();
        // Limpiar preview de imágenes
        document.getElementById('imagenes-preview-container').innerHTML = '';
        // Limpiar mensajes
        document.getElementById('error-message-integrante').classList.add('hidden');
        document.getElementById('success-message-integrante').classList.add('hidden');
    }
}

// Función para cargar pandillas en el selector
async function loadPandillasForIntegrante() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const pandillaSelect = document.getElementById('pandilla-integrante');
            if (pandillaSelect) {
                pandillaSelect.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar pandillas</option>';
            }
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();
        
        const pandillaSelect = document.getElementById('pandilla-integrante');
        if (!pandillaSelect) return;
        
        pandillaSelect.innerHTML = '<option value="" disabled selected>Selecciona una pandilla</option>';
        
        if (data.success && data.pandillas && data.pandillas.length > 0) {
            data.pandillas.forEach(pandilla => {
                const option = document.createElement('option');
                option.value = pandilla.id_pandilla;
                option.textContent = pandilla.nombre;
                pandillaSelect.appendChild(option);
            });
        } else {
            pandillaSelect.innerHTML = '<option value="" disabled>No hay pandillas disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
        const pandillaSelect = document.getElementById('pandilla-integrante');
        if (pandillaSelect) {
            pandillaSelect.innerHTML = '<option value="" disabled>Error al cargar pandillas</option>';
        }
    }
}

// Función para cargar direcciones en el selector
async function loadDireccionesForIntegrante() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const direccionSelect = document.getElementById('direccion-integrante');
            if (direccionSelect) {
                direccionSelect.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar direcciones</option>';
            }
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/direcciones/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar direcciones');
        const data = await response.json();
        
        const direccionSelect = document.getElementById('direccion-integrante');
        if (!direccionSelect) return;
        
        direccionSelect.innerHTML = '<option value="" disabled selected>Selecciona una dirección</option>';
        
        if (data.success && data.direcciones && data.direcciones.length > 0) {
            data.direcciones.forEach(direccion => {
                const option = document.createElement('option');
                option.value = direccion.id_direccion;
                option.textContent = `${direccion.calle} ${direccion.numero || ''}, ${direccion.colonia || ''}`.trim();
                direccionSelect.appendChild(option);
            });
        } else {
            direccionSelect.innerHTML = '<option value="" disabled>No hay direcciones disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
        const direccionSelect = document.getElementById('direccion-integrante');
        if (direccionSelect) {
            direccionSelect.innerHTML = '<option value="" disabled>Error al cargar direcciones</option>';
        }
    }
}

// Función para previsualizar imágenes seleccionadas
function previewImagenesIntegrante() {
    const input = document.getElementById('imagenes-integrante');
    const previewContainer = document.getElementById('imagenes-preview-container');
    
    if (!input || !previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'relative aspect-square w-full group';
                div.dataset.index = index;
                div.innerHTML = `
                    <div class="w-full h-full rounded-lg overflow-hidden border-2 border-slate-400 hover:border-blue-400 transition-all duration-300">
                        <img src="${e.target.result}" alt="Preview ${index + 1}" class="w-full h-full object-cover">
                    </div>
                    <button type="button" class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg" data-index="${index}" title="Eliminar imagen">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                `;
                previewContainer.appendChild(div);
                
                // Agregar event listener al botón de eliminar
                const removeBtn = div.querySelector('button[data-index]');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        const indexToRemove = parseInt(this.getAttribute('data-index'));
                        removeImagenPreview(indexToRemove);
                    });
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

// Función para remover imagen del preview
function removeImagenPreview(index) {
    const input = document.getElementById('imagenes-integrante');
    if (!input) return;
    
    // Crear un nuevo FileList sin la imagen eliminada
    const dt = new DataTransfer();
    const files = Array.from(input.files);
    
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    // Actualizar el input con los archivos restantes
    input.files = dt.files;
    
    // Recrear el preview
    previewImagenesIntegrante();
}



// Función para validar y enviar el formulario de integrante
async function submitIntegranteForm(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-integrante').value.trim();
    const pandilla = document.getElementById('pandilla-integrante').value;
    
    // Limpiar mensajes previos
    document.getElementById('error-message-integrante').classList.add('hidden');
    document.getElementById('success-message-integrante').classList.add('hidden');
    document.getElementById('nombre-integrante-error').classList.add('hidden');
    document.getElementById('pandilla-integrante-error').classList.add('hidden');
    
    // Validaciones básicas
    let isValid = true;
    
    if (!nombre) {
        document.getElementById('nombre-integrante-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!pandilla) {
        document.getElementById('pandilla-integrante-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!isValid) {
        document.getElementById('error-message-integrante').textContent = 'Por favor, completa todos los campos requeridos';
        document.getElementById('error-message-integrante').classList.remove('hidden');
        return;
    }
    
    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido_paterno', document.getElementById('apellido-paterno-integrante').value.trim() || '');
    formData.append('apellido_materno', document.getElementById('apellido-materno-integrante').value.trim() || '');
    formData.append('alias', document.getElementById('alias-integrante').value.trim() || '');
    formData.append('fecha_nacimiento', document.getElementById('fecha-nacimiento-integrante').value || '');
    formData.append('id_pandilla', parseInt(pandilla));
    
    const direccion = document.getElementById('direccion-integrante').value;
    if (direccion) {
        formData.append('id_direccion', parseInt(direccion));
    }
    
    // Agregar imágenes
    const imagenesInput = document.getElementById('imagenes-integrante');
    if (imagenesInput && imagenesInput.files && imagenesInput.files.length > 0) {
        Array.from(imagenesInput.files).forEach((file, index) => {
            formData.append(`imagenes`, file);
        });
    }
    
    console.log('Datos a enviar:', {
        nombre,
        pandilla,
        imagenes: imagenesInput?.files?.length || 0
    });
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-integrante').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-integrante').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/integrantes/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`
                // No incluir Content-Type para que el navegador establezca el boundary para FormData
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-integrante').textContent = 'Integrante registrado correctamente';
            document.getElementById('success-message-integrante').classList.remove('hidden');
            
            // Limpiar formulario
            document.getElementById('form-nuevo-integrante').reset();
            document.getElementById('imagenes-preview-container').innerHTML = '';
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                closeModalIntegrantes();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar el integrante';
            document.getElementById('error-message-integrante').textContent = errorMsg;
            document.getElementById('error-message-integrante').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar integrante:', error);
        document.getElementById('error-message-integrante').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-integrante').classList.remove('hidden');
    }
}

// ==================== FIN FUNCIONES PARA INTEGRANTES ====================

// Función para validar y enviar el formulario de pandilla
async function submitPandillaForm(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-pandilla').value.trim();
    const peligrosidad = document.getElementById('peligrosidad-pandilla').value;
    const zona = document.getElementById('zona-pandilla').value;
    
    // Limpiar mensajes previos
    document.getElementById('error-message-pandilla').classList.add('hidden');
    document.getElementById('success-message-pandilla').classList.add('hidden');
    document.getElementById('nombre-pandilla-error').classList.add('hidden');
    document.getElementById('peligrosidad-pandilla-error').classList.add('hidden');
    document.getElementById('zona-pandilla-error').classList.add('hidden');
    
    // Validaciones básicas
    let isValid = true;
    
    if (!nombre) {
        document.getElementById('nombre-pandilla-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!peligrosidad) {
        document.getElementById('peligrosidad-pandilla-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!zona) {
        document.getElementById('zona-pandilla-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!isValid) {
        document.getElementById('error-message-pandilla').textContent = 'Por favor, completa todos los campos requeridos';
        document.getElementById('error-message-pandilla').classList.remove('hidden');
        return;
    }
    
    // Convertir valor numérico a string de peligrosidad
    let peligrosidadString = 'Alto'; // Por defecto
    if (peligrosidad === '1') {
        peligrosidadString = 'Bajo';
    } else if (peligrosidad === '2') {
        peligrosidadString = 'Medio';
    } else if (peligrosidad === '3') {
        peligrosidadString = 'Alto';
    }
    
    // Recopilar datos del formulario
    const formData = {
        nombre: nombre,
        descripcion: document.getElementById('descripcion-pandilla').value.trim() || null,
        lider: document.getElementById('lider-pandilla').value.trim() || null,
        numero_integrantes: document.getElementById('numero-integrantes-pandilla').value ? parseInt(document.getElementById('numero-integrantes-pandilla').value) : null,
        edades_aproximadas: document.getElementById('edades-aproximadas-pandilla').value ? parseFloat(document.getElementById('edades-aproximadas-pandilla').value) : null,
        horario_reunion: document.getElementById('horario-reunion-pandilla').value.trim() || null,
        peligrosidad: peligrosidadString, // Enviar como string: "Bajo", "Medio", "Alto"
        id_zona: parseInt(zona),
        id_direccion: document.getElementById('direccion-pandilla').value ? parseInt(document.getElementById('direccion-pandilla').value) : null,
        delitos: Array.from(document.querySelectorAll('input[name="delitos"]:checked')).map(cb => parseInt(cb.value)),
        faltas: Array.from(document.querySelectorAll('input[name="faltas"]:checked')).map(cb => parseInt(cb.value)),
        rivalidades: Array.from(document.querySelectorAll('input[name="rivalidades"]:checked')).map(cb => parseInt(cb.value)),
        redes_sociales: Array.from(document.querySelectorAll('input[name="redes_sociales"]:checked')).map(cb => parseInt(cb.value))
    };
    
    console.log('Datos a enviar:', formData);
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-pandilla').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-pandilla').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/pandillas/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-pandilla').textContent = data.message || 'Pandilla registrada correctamente';
            document.getElementById('success-message-pandilla').classList.remove('hidden');
            
            // Recargar marcadores del mapa si la función está disponible
            if (typeof window.reloadMapMarkers === 'function') {
                setTimeout(() => {
                    window.reloadMapMarkers();
                }, 500);
            }
            
            // Limpiar formulario después de 2 segundos
            setTimeout(() => {
                document.getElementById('form-nueva-pandilla').reset();
                closeModalPandillas();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar la pandilla';
            document.getElementById('error-message-pandilla').textContent = errorMsg;
            document.getElementById('error-message-pandilla').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar pandilla:', error);
        document.getElementById('error-message-pandilla').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-pandilla').classList.remove('hidden');
    }
}

// ==================== FUNCIONES PARA NUEVA DIRECCIÓN DENTRO DE MODALES ====================

// Función para mostrar/ocultar formulario de nueva dirección en modal de pandillas
function toggleFormNuevaDireccionPandilla() {
    const form = document.getElementById('form-nueva-direccion-pandilla');
    if (form) {
        form.classList.toggle('hidden');
    }
}

// Función para cerrar formulario de nueva dirección en modal de pandillas
function cerrarFormNuevaDireccionPandilla() {
    const form = document.getElementById('form-nueva-direccion-pandilla');
    if (form) {
        form.classList.add('hidden');
        // Limpiar campos
        document.getElementById('nueva-calle-pandilla').value = '';
        document.getElementById('nueva-numero-pandilla').value = '';
        document.getElementById('nueva-colonia-pandilla').value = '';
        document.getElementById('nueva-cp-pandilla').value = '';
        document.getElementById('nueva-latitud-pandilla').value = '';
        document.getElementById('nueva-longitud-pandilla').value = '';
        const mensaje = document.getElementById('mensaje-direccion-pandilla');
        if (mensaje) {
            mensaje.classList.add('hidden');
            mensaje.textContent = '';
        }
    }
}

// Función para guardar nueva dirección desde modal de pandillas
async function guardarNuevaDireccionPandilla() {
    const calle = document.getElementById('nueva-calle-pandilla').value.trim();
    const numero = document.getElementById('nueva-numero-pandilla').value.trim();
    const colonia = document.getElementById('nueva-colonia-pandilla').value.trim();
    const codigoPostal = document.getElementById('nueva-cp-pandilla').value.trim();
    const latitud = document.getElementById('nueva-latitud-pandilla').value;
    const longitud = document.getElementById('nueva-longitud-pandilla').value;
    const mensaje = document.getElementById('mensaje-direccion-pandilla');
    
    // Validaciones
    if (!calle || !latitud || !longitud) {
        if (mensaje) {
            mensaje.textContent = 'Calle, latitud y longitud son requeridos';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
        return;
    }
    
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        if (mensaje) {
            mensaje.textContent = 'No estás autenticado';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/direcciones/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                calle: calle,
                numero: numero || null,
                colonia: colonia || null,
                codigo_postal: codigoPostal || null,
                latitud: parseFloat(latitud),
                longitud: parseFloat(longitud)
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Cerrar el formulario
            cerrarFormNuevaDireccionPandilla();
            
            // Recargar direcciones y seleccionar la nueva
            await loadDireccionesForPandilla();
            const direccionSelect = document.getElementById('direccion-pandilla');
            if (direccionSelect && data.direccion && data.direccion.id_direccion) {
                direccionSelect.value = data.direccion.id_direccion;
            }
        } else {
            if (mensaje) {
                mensaje.textContent = data.message || 'Error al crear la dirección';
                mensaje.className = 'mt-2 text-xs text-red-500';
                mensaje.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error al crear dirección:', error);
        if (mensaje) {
            mensaje.textContent = 'Error de conexión. Por favor, intenta nuevamente.';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
    }
}

// Función para mostrar/ocultar formulario de nueva dirección en modal de integrantes
function toggleFormNuevaDireccionIntegrante() {
    const form = document.getElementById('form-nueva-direccion-integrante');
    if (form) {
        form.classList.toggle('hidden');
    }
}

// Función para cerrar formulario de nueva dirección en modal de integrantes
function cerrarFormNuevaDireccionIntegrante() {
    const form = document.getElementById('form-nueva-direccion-integrante');
    if (form) {
        form.classList.add('hidden');
        // Limpiar campos
        document.getElementById('nueva-calle-integrante').value = '';
        document.getElementById('nueva-numero-integrante').value = '';
        document.getElementById('nueva-colonia-integrante').value = '';
        document.getElementById('nueva-cp-integrante').value = '';
        document.getElementById('nueva-latitud-integrante').value = '';
        document.getElementById('nueva-longitud-integrante').value = '';
        const mensaje = document.getElementById('mensaje-direccion-integrante');
        if (mensaje) {
            mensaje.classList.add('hidden');
            mensaje.textContent = '';
        }
    }
}

// Función para guardar nueva dirección desde modal de integrantes
async function guardarNuevaDireccionIntegrante() {
    const calle = document.getElementById('nueva-calle-integrante').value.trim();
    const numero = document.getElementById('nueva-numero-integrante').value.trim();
    const colonia = document.getElementById('nueva-colonia-integrante').value.trim();
    const codigoPostal = document.getElementById('nueva-cp-integrante').value.trim();
    const latitud = document.getElementById('nueva-latitud-integrante').value;
    const longitud = document.getElementById('nueva-longitud-integrante').value;
    const mensaje = document.getElementById('mensaje-direccion-integrante');
    
    // Validaciones
    if (!calle || !latitud || !longitud) {
        if (mensaje) {
            mensaje.textContent = 'Calle, latitud y longitud son requeridos';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
        return;
    }
    
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        if (mensaje) {
            mensaje.textContent = 'No estás autenticado';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/direcciones/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                calle: calle,
                numero: numero || null,
                colonia: colonia || null,
                codigo_postal: codigoPostal || null,
                latitud: parseFloat(latitud),
                longitud: parseFloat(longitud)
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Cerrar el formulario
            cerrarFormNuevaDireccionIntegrante();
            
            // Recargar direcciones y seleccionar la nueva
            await loadDireccionesForIntegrante();
            const direccionSelect = document.getElementById('direccion-integrante');
            if (direccionSelect && data.direccion && data.direccion.id_direccion) {
                direccionSelect.value = data.direccion.id_direccion;
            }
        } else {
            if (mensaje) {
                mensaje.textContent = data.message || 'Error al crear la dirección';
                mensaje.className = 'mt-2 text-xs text-red-500';
                mensaje.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error al crear dirección:', error);
        if (mensaje) {
            mensaje.textContent = 'Error de conexión. Por favor, intenta nuevamente.';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
    }
}

// ==================== FUNCIONES PARA EVENTOS ====================

// Función para abrir el modal de eventos
function openModalEventos() {
    const modal = document.getElementById('modal-nuevo-evento');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        // Cargar datos necesarios para los selectores
        loadPandillasForEvento();
        loadDireccionesForEvento();
        // Inicializar selector de integrantes sin pandilla (mostrará mensaje)
        const integranteSelect = document.getElementById('integrante-evento');
        if (integranteSelect) {
            integranteSelect.innerHTML = '<option value="" disabled selected>Selecciona una pandilla primero</option>';
        }
        // Ocultar contenedor de delito/falta inicialmente
        document.getElementById('delito-falta-container').classList.add('hidden');
    }
}

// Función para cerrar el modal de eventos
function closeModalEventos() {
    const modal = document.getElementById('modal-nuevo-evento');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nuevo-evento').reset();
        // Ocultar contenedor de delito/falta
        document.getElementById('delito-falta-container').classList.add('hidden');
        // Limpiar mensajes
        document.getElementById('error-message-evento').classList.add('hidden');
        document.getElementById('success-message-evento').classList.add('hidden');
        // Cerrar formulario de nueva dirección si está abierto
        cerrarFormNuevaDireccionEvento();
    }
}

// Función para cargar pandillas en el selector
async function loadPandillasForEvento() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const pandillaSelect = document.getElementById('pandilla-evento');
            if (pandillaSelect) {
                pandillaSelect.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar pandillas</option>';
            }
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();
        
        const pandillaSelect = document.getElementById('pandilla-evento');
        if (!pandillaSelect) return;
        
        pandillaSelect.innerHTML = '<option value="" disabled selected>Selecciona una pandilla (opcional)</option>';
        
        if (data.success && data.pandillas && data.pandillas.length > 0) {
            data.pandillas.forEach(pandilla => {
                const option = document.createElement('option');
                option.value = pandilla.id_pandilla;
                option.textContent = pandilla.nombre;
                pandillaSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
    }
}

// Función para cargar integrantes en el selector (filtrados por pandilla si se selecciona una)
async function loadIntegrantesForEvento(idPandilla = null) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const integranteSelect = document.getElementById('integrante-evento');
            if (integranteSelect) {
                integranteSelect.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar integrantes</option>';
            }
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/integrantes/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar integrantes');
        const data = await response.json();
        
        const integranteSelect = document.getElementById('integrante-evento');
        if (!integranteSelect) return;
        
        // Filtrar integrantes por pandilla si se proporciona
        let integrantesFiltrados = data.success && data.integrantes ? data.integrantes : [];
        if (idPandilla) {
            integrantesFiltrados = integrantesFiltrados.filter(integrante => 
                integrante.id_pandilla && integrante.id_pandilla === parseInt(idPandilla)
            );
        }
        
        integranteSelect.innerHTML = '<option value="" disabled selected>Selecciona un integrante (opcional)</option>';
        
        if (integrantesFiltrados.length > 0) {
            integrantesFiltrados.forEach(integrante => {
                const option = document.createElement('option');
                option.value = integrante.id_integrante;
                // Construir nombre completo
                let nombreCompleto = integrante.nombre;
                if (integrante.apellido_paterno) {
                    nombreCompleto += ` ${integrante.apellido_paterno}`;
                }
                if (integrante.apellido_materno) {
                    nombreCompleto += ` ${integrante.apellido_materno}`;
                }
                if (integrante.alias) {
                    nombreCompleto += ` (${integrante.alias})`;
                }
                option.textContent = nombreCompleto;
                integranteSelect.appendChild(option);
            });
        } else {
            if (idPandilla) {
                integranteSelect.innerHTML = '<option value="" disabled selected>No hay integrantes en esta pandilla</option>';
            } else {
                integranteSelect.innerHTML = '<option value="" disabled selected>Selecciona una pandilla primero</option>';
            }
        }
    } catch (error) {
        console.error('Error al cargar integrantes:', error);
        const integranteSelect = document.getElementById('integrante-evento');
        if (integranteSelect) {
            integranteSelect.innerHTML = '<option value="" disabled selected>Error al cargar integrantes</option>';
        }
    }
}

// Función para manejar cambio de pandilla en eventos
function handlePandillaEventoChange() {
    const pandillaSelect = document.getElementById('pandilla-evento');
    const integranteSelect = document.getElementById('integrante-evento');
    
    if (!pandillaSelect || !integranteSelect) return;
    
    const idPandilla = pandillaSelect.value;
    
    // Limpiar selección de integrante
    integranteSelect.value = '';
    
    // Cargar integrantes filtrados por pandilla
    if (idPandilla) {
        loadIntegrantesForEvento(idPandilla);
    } else {
        // Si no hay pandilla seleccionada, mostrar mensaje
        integranteSelect.innerHTML = '<option value="" disabled selected>Selecciona una pandilla primero</option>';
    }
}

// Función para cargar direcciones en el selector
async function loadDireccionesForEvento() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const direccionSelect = document.getElementById('direccion-evento');
            if (direccionSelect) {
                direccionSelect.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar direcciones</option>';
            }
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/direcciones/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar direcciones');
        const data = await response.json();
        
        const direccionSelect = document.getElementById('direccion-evento');
        if (!direccionSelect) return;
        
        direccionSelect.innerHTML = '<option value="" disabled selected>Selecciona una dirección (opcional)</option>';
        
        if (data.success && data.direcciones && data.direcciones.length > 0) {
            data.direcciones.forEach(direccion => {
                const option = document.createElement('option');
                option.value = direccion.id_direccion;
                option.textContent = `${direccion.calle} ${direccion.numero || ''}, ${direccion.colonia || ''}`.trim();
                direccionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
    }
}

// Función para manejar cambio de tipo de evento
function handleTipoEventoChange() {
    const tipoSelect = document.getElementById('tipo-evento');
    const delitoFaltaContainer = document.getElementById('delito-falta-container');
    const delitoFaltaLabel = document.getElementById('delito-falta-label');
    const delitoFaltaSelect = document.getElementById('delito-falta-select');
    
    if (!tipoSelect || !delitoFaltaContainer) return;
    
    const tipo = tipoSelect.value;
    
    if (tipo === 'delito') {
        delitoFaltaContainer.classList.remove('hidden');
        delitoFaltaLabel.textContent = 'Delito:';
        loadDelitosForEvento();
    } else if (tipo === 'falta') {
        delitoFaltaContainer.classList.remove('hidden');
        delitoFaltaLabel.textContent = 'Falta:';
        loadFaltasForEvento();
    } else {
        delitoFaltaContainer.classList.add('hidden');
        delitoFaltaSelect.value = '';
    }
}

// Función para cargar delitos
async function loadDelitosForEvento() {
    try {
        const response = await fetch('http://localhost:8000/api/crimes/');
        if (!response.ok) throw new Error('Error al cargar delitos');
        const crimes = await response.json();
        
        const select = document.getElementById('delito-falta-select');
        if (!select) return;
        
        select.innerHTML = '<option value="" disabled selected>Selecciona un delito</option>';
        crimes.forEach(crime => {
            const option = document.createElement('option');
            option.value = crime.id;
            option.textContent = crime.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar delitos:', error);
    }
}

// Función para cargar faltas
async function loadFaltasForEvento() {
    try {
        // TODO: Crear endpoint para faltas
        const select = document.getElementById('delito-falta-select');
        if (select) {
            select.innerHTML = '<option value="" disabled selected>No disponible aún</option>';
        }
    } catch (error) {
        console.error('Error al cargar faltas:', error);
    }
}

// Función para validar y enviar el formulario de evento
async function submitEventoForm(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('tipo-evento').value;
    const fecha = document.getElementById('fecha-evento').value;
    
    // Limpiar mensajes previos
    document.getElementById('error-message-evento').classList.add('hidden');
    document.getElementById('success-message-evento').classList.add('hidden');
    document.getElementById('tipo-evento-error').classList.add('hidden');
    document.getElementById('fecha-evento-error').classList.add('hidden');
    
    // Validaciones básicas
    let isValid = true;
    
    if (!tipo) {
        document.getElementById('tipo-evento-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!fecha) {
        document.getElementById('fecha-evento-error').classList.remove('hidden');
        isValid = false;
    }
    
    if (!isValid) {
        document.getElementById('error-message-evento').textContent = 'Por favor, completa todos los campos requeridos';
        document.getElementById('error-message-evento').classList.remove('hidden');
        return;
    }
    
    // Preparar datos
    const datos = {
        tipo: tipo,
        fecha: fecha,
        hora: document.getElementById('hora-evento').value || null,
        descripcion: document.getElementById('descripcion-evento').value.trim() || null
    };
    
    // Agregar delito o falta según el tipo
    if (tipo === 'delito') {
        const delito = document.getElementById('delito-falta-select').value;
        if (delito) {
            datos.id_delito = parseInt(delito);
        }
    } else if (tipo === 'falta') {
        const falta = document.getElementById('delito-falta-select').value;
        if (falta) {
            datos.id_falta = parseInt(falta);
        }
    }
    
    // Agregar pandilla e integrante si están seleccionados
    const pandilla = document.getElementById('pandilla-evento').value;
    if (pandilla) {
        datos.id_pandilla = parseInt(pandilla);
    }
    
    const integrante = document.getElementById('integrante-evento').value;
    if (integrante) {
        datos.id_integrante = parseInt(integrante);
    }
    
    // Agregar dirección si está seleccionada
    const direccion = document.getElementById('direccion-evento').value;
    if (direccion) {
        datos.id_direccion = parseInt(direccion);
    }
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-evento').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-evento').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/eventos/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-evento').textContent = 'Evento registrado correctamente';
            document.getElementById('success-message-evento').classList.remove('hidden');
            
            // Limpiar formulario
            document.getElementById('form-nuevo-evento').reset();
            document.getElementById('delito-falta-container').classList.add('hidden');
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                closeModalEventos();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar el evento';
            document.getElementById('error-message-evento').textContent = errorMsg;
            document.getElementById('error-message-evento').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar evento:', error);
        document.getElementById('error-message-evento').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-evento').classList.remove('hidden');
    }
}

// Funciones para nueva dirección en modal de eventos
function toggleFormNuevaDireccionEvento() {
    const form = document.getElementById('form-nueva-direccion-evento');
    if (form) {
        form.classList.toggle('hidden');
    }
}

function cerrarFormNuevaDireccionEvento() {
    const form = document.getElementById('form-nueva-direccion-evento');
    if (form) {
        form.classList.add('hidden');
        // Limpiar campos
        document.getElementById('nueva-calle-evento').value = '';
        document.getElementById('nueva-numero-evento').value = '';
        document.getElementById('nueva-colonia-evento').value = '';
        document.getElementById('nueva-cp-evento').value = '';
        document.getElementById('nueva-latitud-evento').value = '';
        document.getElementById('nueva-longitud-evento').value = '';
        const mensaje = document.getElementById('mensaje-direccion-evento');
        if (mensaje) {
            mensaje.classList.add('hidden');
            mensaje.textContent = '';
        }
    }
}

async function guardarNuevaDireccionEvento() {
    const calle = document.getElementById('nueva-calle-evento').value.trim();
    const numero = document.getElementById('nueva-numero-evento').value.trim();
    const colonia = document.getElementById('nueva-colonia-evento').value.trim();
    const codigoPostal = document.getElementById('nueva-cp-evento').value.trim();
    const latitud = document.getElementById('nueva-latitud-evento').value;
    const longitud = document.getElementById('nueva-longitud-evento').value;
    const mensaje = document.getElementById('mensaje-direccion-evento');
    
    // Validaciones
    if (!calle || !latitud || !longitud) {
        if (mensaje) {
            mensaje.textContent = 'Calle, latitud y longitud son requeridos';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
        return;
    }
    
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        if (mensaje) {
            mensaje.textContent = 'No estás autenticado';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/direcciones/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                calle: calle,
                numero: numero || null,
                colonia: colonia || null,
                codigo_postal: codigoPostal || null,
                latitud: parseFloat(latitud),
                longitud: parseFloat(longitud)
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Cerrar el formulario
            cerrarFormNuevaDireccionEvento();
            
            // Recargar direcciones y seleccionar la nueva
            await loadDireccionesForEvento();
            const direccionSelect = document.getElementById('direccion-evento');
            if (direccionSelect && data.direccion && data.direccion.id_direccion) {
                direccionSelect.value = data.direccion.id_direccion;
            }
        } else {
            if (mensaje) {
                mensaje.textContent = data.message || 'Error al crear la dirección';
                mensaje.className = 'mt-2 text-xs text-red-500';
                mensaje.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error al crear dirección:', error);
        if (mensaje) {
            mensaje.textContent = 'Error de conexión. Por favor, intenta nuevamente.';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
    }
}

// ==================== FIN FUNCIONES PARA EVENTOS ====================

// ==================== FUNCIONES PARA DELITOS ====================

// Función para abrir el modal de delitos
function openModalDelitos() {
    const modal = document.getElementById('modal-nuevo-delito');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
    }
}

// Función para cerrar el modal de delitos
function closeModalDelitos() {
    const modal = document.getElementById('modal-nuevo-delito');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nuevo-delito').reset();
        // Limpiar mensajes
        document.getElementById('error-message-delito').classList.add('hidden');
        document.getElementById('success-message-delito').classList.add('hidden');
    }
}

// Función para validar y enviar el formulario de delito
async function submitDelitoForm(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-delito').value.trim();
    
    // Limpiar mensajes previos
    document.getElementById('error-message-delito').classList.add('hidden');
    document.getElementById('success-message-delito').classList.add('hidden');
    document.getElementById('nombre-delito-error').classList.add('hidden');
    
    // Validaciones básicas
    if (!nombre) {
        document.getElementById('nombre-delito-error').classList.remove('hidden');
        document.getElementById('error-message-delito').textContent = 'El nombre es requerido';
        document.getElementById('error-message-delito').classList.remove('hidden');
        return;
    }
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-delito').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-delito').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/delitos/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-delito').textContent = 'Delito registrado correctamente';
            document.getElementById('success-message-delito').classList.remove('hidden');
            
            // Limpiar formulario
            document.getElementById('form-nuevo-delito').reset();
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                closeModalDelitos();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar el delito';
            document.getElementById('error-message-delito').textContent = errorMsg;
            document.getElementById('error-message-delito').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar delito:', error);
        document.getElementById('error-message-delito').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-delito').classList.remove('hidden');
    }
}

// ==================== FIN FUNCIONES PARA DELITOS ====================

// ==================== FUNCIONES PARA FALTAS ====================

// Función para abrir el modal de faltas
function openModalFaltas() {
    const modal = document.getElementById('modal-nueva-falta');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
    }
}

// Función para cerrar el modal de faltas
function closeModalFaltas() {
    const modal = document.getElementById('modal-nueva-falta');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nueva-falta').reset();
        // Limpiar mensajes
        document.getElementById('error-message-falta').classList.add('hidden');
        document.getElementById('success-message-falta').classList.add('hidden');
    }
}

// Función para validar y enviar el formulario de falta
async function submitFaltaForm(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-falta').value.trim();
    
    // Limpiar mensajes previos
    document.getElementById('error-message-falta').classList.add('hidden');
    document.getElementById('success-message-falta').classList.add('hidden');
    document.getElementById('nombre-falta-error').classList.add('hidden');
    
    // Validaciones básicas
    if (!nombre) {
        document.getElementById('nombre-falta-error').classList.remove('hidden');
        document.getElementById('error-message-falta').textContent = 'El nombre es requerido';
        document.getElementById('error-message-falta').classList.remove('hidden');
        return;
    }
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-falta').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-falta').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/faltas/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-falta').textContent = 'Falta registrada correctamente';
            document.getElementById('success-message-falta').classList.remove('hidden');
            
            // Limpiar formulario
            document.getElementById('form-nueva-falta').reset();
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                closeModalFaltas();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar la falta';
            document.getElementById('error-message-falta').textContent = errorMsg;
            document.getElementById('error-message-falta').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar falta:', error);
        document.getElementById('error-message-falta').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-falta').classList.remove('hidden');
    }
}

// ==================== FIN FUNCIONES PARA FALTAS ====================

// ==================== FUNCIONES PARA RIVALIDADES ====================

// Función para abrir el modal de rivalidades
function openModalRivalidades() {
    const modal = document.getElementById('modal-nueva-rivalidad');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        // Cargar pandillas para los selectores
        loadPandillasForRivalidad();
    }
}

// Función para cerrar el modal de rivalidades
function closeModalRivalidades() {
    const modal = document.getElementById('modal-nueva-rivalidad');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nueva-rivalidad').reset();
        // Limpiar mensajes
        document.getElementById('error-message-rivalidad').classList.add('hidden');
        document.getElementById('success-message-rivalidad').classList.add('hidden');
    }
}

// Función para cargar pandillas en los selectores de rivalidad
async function loadPandillasForRivalidad() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            const pandilla1Select = document.getElementById('pandilla-1-rivalidad');
            const pandilla2Select = document.getElementById('pandilla-2-rivalidad');
            if (pandilla1Select) pandilla1Select.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar pandillas</option>';
            if (pandilla2Select) pandilla2Select.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar pandillas</option>';
            return;
        }
        
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();
        
        const pandilla1Select = document.getElementById('pandilla-1-rivalidad');
        const pandilla2Select = document.getElementById('pandilla-2-rivalidad');
        
        if (!pandilla1Select || !pandilla2Select) return;
        
        pandilla1Select.innerHTML = '<option value="" disabled selected>Selecciona la primera pandilla</option>';
        pandilla2Select.innerHTML = '<option value="" disabled selected>Selecciona la pandilla rival</option>';
        
        if (data.success && data.pandillas && data.pandillas.length > 0) {
            data.pandillas.forEach(pandilla => {
                const option1 = document.createElement('option');
                option1.value = pandilla.id_pandilla;
                option1.textContent = pandilla.nombre;
                pandilla1Select.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = pandilla.id_pandilla;
                option2.textContent = pandilla.nombre;
                pandilla2Select.appendChild(option2);
            });
        }
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
        const pandilla1Select = document.getElementById('pandilla-1-rivalidad');
        const pandilla2Select = document.getElementById('pandilla-2-rivalidad');
        if (pandilla1Select) pandilla1Select.innerHTML = '<option value="" disabled>Error al cargar pandillas</option>';
        if (pandilla2Select) pandilla2Select.innerHTML = '<option value="" disabled>Error al cargar pandillas</option>';
    }
}

// Función para validar y enviar el formulario de rivalidad
async function submitRivalidadForm(e) {
    e.preventDefault();
    
    const idPandilla = document.getElementById('pandilla-1-rivalidad').value;
    const idPandillaRival = document.getElementById('pandilla-2-rivalidad').value;
    
    // Limpiar mensajes previos
    document.getElementById('error-message-rivalidad').classList.add('hidden');
    document.getElementById('success-message-rivalidad').classList.add('hidden');
    document.getElementById('pandilla-1-rivalidad-error').classList.add('hidden');
    document.getElementById('pandilla-2-rivalidad-error').classList.add('hidden');
    
    // Validaciones básicas
    if (!idPandilla) {
        document.getElementById('pandilla-1-rivalidad-error').classList.remove('hidden');
        document.getElementById('error-message-rivalidad').textContent = 'La primera pandilla es requerida';
        document.getElementById('error-message-rivalidad').classList.remove('hidden');
        return;
    }
    
    if (!idPandillaRival) {
        document.getElementById('pandilla-2-rivalidad-error').classList.remove('hidden');
        document.getElementById('error-message-rivalidad').textContent = 'La pandilla rival es requerida';
        document.getElementById('error-message-rivalidad').classList.remove('hidden');
        return;
    }
    
    if (idPandilla === idPandillaRival) {
        document.getElementById('error-message-rivalidad').textContent = 'Una pandilla no puede ser rival de sí misma';
        document.getElementById('error-message-rivalidad').classList.remove('hidden');
        return;
    }
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-rivalidad').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-rivalidad').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/rivalidades/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_pandilla: parseInt(idPandilla),
                id_pandilla_rival: parseInt(idPandillaRival)
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-rivalidad').textContent = 'Rivalidad registrada correctamente';
            document.getElementById('success-message-rivalidad').classList.remove('hidden');
            
            // Limpiar formulario
            document.getElementById('form-nueva-rivalidad').reset();
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                closeModalRivalidades();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar la rivalidad';
            document.getElementById('error-message-rivalidad').textContent = errorMsg;
            document.getElementById('error-message-rivalidad').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar rivalidad:', error);
        document.getElementById('error-message-rivalidad').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-rivalidad').classList.remove('hidden');
    }
}

// ==================== FIN FUNCIONES PARA RIVALIDADES ====================

// ==================== FUNCIONES PARA REDES SOCIALES ====================

// Función para abrir el modal de redes sociales
function openModalRedesSociales() {
    const modal = document.getElementById('modal-nueva-red-social');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
    }
}

// Función para cerrar el modal de redes sociales
function closeModalRedesSociales() {
    const modal = document.getElementById('modal-nueva-red-social');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-nueva-red-social').reset();
        // Limpiar mensajes
        document.getElementById('error-message-red-social').classList.add('hidden');
        document.getElementById('success-message-red-social').classList.add('hidden');
    }
}

// Función para validar y enviar el formulario de red social
async function submitRedSocialForm(e) {
    e.preventDefault();
    
    const plataforma = document.getElementById('plataforma-red-social').value;
    const handle = document.getElementById('handle-red-social').value.trim();
    const url = document.getElementById('url-red-social').value.trim();
    
    // Limpiar mensajes previos
    document.getElementById('error-message-red-social').classList.add('hidden');
    document.getElementById('success-message-red-social').classList.add('hidden');
    document.getElementById('plataforma-red-social-error').classList.add('hidden');
    
    // Validaciones básicas
    if (!plataforma) {
        document.getElementById('plataforma-red-social-error').classList.remove('hidden');
        document.getElementById('error-message-red-social').textContent = 'La plataforma es requerida';
        document.getElementById('error-message-red-social').classList.remove('hidden');
        return;
    }
    
    // Al menos uno de handle o url debe estar presente
    if (!handle && !url) {
        document.getElementById('error-message-red-social').textContent = 'Debes proporcionar al menos un handle o una URL';
        document.getElementById('error-message-red-social').classList.remove('hidden');
        return;
    }
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-red-social').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-red-social').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/redes-sociales/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plataforma: plataforma,
                handle: handle || null,
                url: url || null
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('success-message-red-social').textContent = 'Red social registrada correctamente';
            document.getElementById('success-message-red-social').classList.remove('hidden');
            
            // Limpiar formulario
            document.getElementById('form-nueva-red-social').reset();
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                closeModalRedesSociales();
            }, 2000);
        } else {
            const errorMsg = data.message || data.errors || 'Error al registrar la red social';
            document.getElementById('error-message-red-social').textContent = errorMsg;
            document.getElementById('error-message-red-social').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al registrar red social:', error);
        document.getElementById('error-message-red-social').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-red-social').classList.remove('hidden');
    }
}

// ==================== FIN FUNCIONES PARA REDES SOCIALES ====================

// ==================== FIN FUNCIONES PARA NUEVA DIRECCIÓN DENTRO DE MODALES ====================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const tipoSelect = document.getElementById('tipo-registro-select');
    const continuarBtn = document.getElementById('btn-continuar-registro');
    
    if (tipoSelect) {
        // Actualizar el botón cuando cambie la selección
        tipoSelect.addEventListener('change', updateContinuarButton);
    }
    
    if (continuarBtn) {
        // Manejar el clic en el botón continuar
        continuarBtn.addEventListener('click', handleContinuar);
    }
    
    // Botones del modal de pandillas
    const closeModalPandillaBtn = document.getElementById('close-modal-pandilla-btn');
    const cancelarPandillaBtn = document.getElementById('cancelar-pandilla-btn');
    const formNuevaPandilla = document.getElementById('form-nueva-pandilla');
    const modalPandilla = document.getElementById('modal-nueva-pandilla');
    
    if (closeModalPandillaBtn) {
        closeModalPandillaBtn.addEventListener('click', closeModalPandillas);
    }
    
    if (cancelarPandillaBtn) {
        cancelarPandillaBtn.addEventListener('click', closeModalPandillas);
    }
    
    if (formNuevaPandilla) {
        formNuevaPandilla.addEventListener('submit', submitPandillaForm);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalPandilla) {
        modalPandilla.addEventListener('click', function(e) {
            if (e.target === modalPandilla) {
                closeModalPandillas();
            }
        });
    }
    
    // Botones del modal de integrantes
    const closeModalIntegranteBtn = document.getElementById('close-modal-integrante-btn');
    const cancelarIntegranteBtn = document.getElementById('cancelar-integrante-btn');
    const formNuevoIntegrante = document.getElementById('form-nuevo-integrante');
    const modalIntegrante = document.getElementById('modal-nuevo-integrante');
    const imagenesIntegranteInput = document.getElementById('imagenes-integrante');
    
    if (closeModalIntegranteBtn) {
        closeModalIntegranteBtn.addEventListener('click', closeModalIntegrantes);
    }
    
    if (cancelarIntegranteBtn) {
        cancelarIntegranteBtn.addEventListener('click', closeModalIntegrantes);
    }
    
    if (formNuevoIntegrante) {
        formNuevoIntegrante.addEventListener('submit', submitIntegranteForm);
    }
    
    if (imagenesIntegranteInput) {
        imagenesIntegranteInput.addEventListener('change', previewImagenesIntegrante);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalIntegrante) {
        modalIntegrante.addEventListener('click', function(e) {
            if (e.target === modalIntegrante) {
                closeModalIntegrantes();
            }
        });
    }
    
    // Botones del modal de nueva dirección
    const closeModalDireccionBtn = document.getElementById('close-modal-direccion-btn');
    const cancelarDireccionBtn = document.getElementById('cancelar-direccion-btn');
    const formNuevaDireccion = document.getElementById('form-nueva-direccion');
    const modalDireccion = document.getElementById('modal-nueva-direccion');
    const btnObtenerCoordenadas = document.getElementById('btn-obtener-coordenadas');
    
    if (closeModalDireccionBtn) {
        closeModalDireccionBtn.addEventListener('click', closeModalNuevaDireccion);
    }
    
    if (cancelarDireccionBtn) {
        cancelarDireccionBtn.addEventListener('click', closeModalNuevaDireccion);
    }
    
    if (formNuevaDireccion) {
        formNuevaDireccion.addEventListener('submit', submitNuevaDireccionForm);
    }
    
    if (btnObtenerCoordenadas) {
        btnObtenerCoordenadas.addEventListener('click', toggleBusquedaAutomatica);
    }
    
    // Botones de búsqueda automática
    const btnBuscarDireccion = document.getElementById('btn-buscar-direccion');
    const btnCancelarBusqueda = document.getElementById('btn-cancelar-busqueda');
    const inputDireccionBuscar = document.getElementById('input-direccion-buscar');
    
    if (btnBuscarDireccion) {
        btnBuscarDireccion.addEventListener('click', buscarDireccionAutomatica);
    }
    
    if (btnCancelarBusqueda) {
        btnCancelarBusqueda.addEventListener('click', toggleBusquedaAutomatica);
    }
    
    if (inputDireccionBuscar) {
        inputDireccionBuscar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarDireccionAutomatica();
            }
        });
    }
    
    // Cerrar modal de dirección al hacer clic fuera
    if (modalDireccion) {
        modalDireccion.addEventListener('click', function(e) {
            if (e.target === modalDireccion) {
                closeModalNuevaDireccion();
            }
        });
    }
    
    // Botones para nueva dirección en modal de pandillas
    const btnNuevaDireccionPandilla = document.getElementById('btn-nueva-direccion-pandilla');
    const btnCerrarFormDireccionPandilla = document.getElementById('btn-cerrar-form-direccion-pandilla');
    const btnGuardarNuevaDireccionPandilla = document.getElementById('btn-guardar-nueva-direccion-pandilla');
    const btnCancelarNuevaDireccionPandilla = document.getElementById('btn-cancelar-nueva-direccion-pandilla');
    
    if (btnNuevaDireccionPandilla) {
        btnNuevaDireccionPandilla.addEventListener('click', toggleFormNuevaDireccionPandilla);
    }
    if (btnCerrarFormDireccionPandilla) {
        btnCerrarFormDireccionPandilla.addEventListener('click', cerrarFormNuevaDireccionPandilla);
    }
    if (btnGuardarNuevaDireccionPandilla) {
        btnGuardarNuevaDireccionPandilla.addEventListener('click', guardarNuevaDireccionPandilla);
    }
    if (btnCancelarNuevaDireccionPandilla) {
        btnCancelarNuevaDireccionPandilla.addEventListener('click', cerrarFormNuevaDireccionPandilla);
    }
    
    // Botones para nueva dirección en modal de integrantes
    const btnNuevaDireccionIntegrante = document.getElementById('btn-nueva-direccion-integrante');
    const btnCerrarFormDireccionIntegrante = document.getElementById('btn-cerrar-form-direccion-integrante');
    const btnGuardarNuevaDireccionIntegrante = document.getElementById('btn-guardar-nueva-direccion-integrante');
    const btnCancelarNuevaDireccionIntegrante = document.getElementById('btn-cancelar-nueva-direccion-integrante');
    
    if (btnNuevaDireccionIntegrante) {
        btnNuevaDireccionIntegrante.addEventListener('click', toggleFormNuevaDireccionIntegrante);
    }
    if (btnCerrarFormDireccionIntegrante) {
        btnCerrarFormDireccionIntegrante.addEventListener('click', cerrarFormNuevaDireccionIntegrante);
    }
    if (btnGuardarNuevaDireccionIntegrante) {
        btnGuardarNuevaDireccionIntegrante.addEventListener('click', guardarNuevaDireccionIntegrante);
    }
    if (btnCancelarNuevaDireccionIntegrante) {
        btnCancelarNuevaDireccionIntegrante.addEventListener('click', cerrarFormNuevaDireccionIntegrante);
    }
    
    // Botones del modal de eventos
    const closeModalEventoBtn = document.getElementById('close-modal-evento-btn');
    const cancelarEventoBtn = document.getElementById('cancelar-evento-btn');
    const formNuevoEvento = document.getElementById('form-nuevo-evento');
    const modalEvento = document.getElementById('modal-nuevo-evento');
    const tipoEventoSelect = document.getElementById('tipo-evento');
    const pandillaEventoSelect = document.getElementById('pandilla-evento');
    
    if (closeModalEventoBtn) {
        closeModalEventoBtn.addEventListener('click', closeModalEventos);
    }
    
    if (cancelarEventoBtn) {
        cancelarEventoBtn.addEventListener('click', closeModalEventos);
    }
    
    if (formNuevoEvento) {
        formNuevoEvento.addEventListener('submit', submitEventoForm);
    }
    
    if (tipoEventoSelect) {
        tipoEventoSelect.addEventListener('change', handleTipoEventoChange);
    }
    
    if (pandillaEventoSelect) {
        pandillaEventoSelect.addEventListener('change', handlePandillaEventoChange);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalEvento) {
        modalEvento.addEventListener('click', function(e) {
            if (e.target === modalEvento) {
                closeModalEventos();
            }
        });
    }
    
    // Botones para nueva dirección en modal de eventos
    const btnNuevaDireccionEvento = document.getElementById('btn-nueva-direccion-evento');
    const btnCerrarFormDireccionEvento = document.getElementById('btn-cerrar-form-direccion-evento');
    const btnGuardarNuevaDireccionEvento = document.getElementById('btn-guardar-nueva-direccion-evento');
    const btnCancelarNuevaDireccionEvento = document.getElementById('btn-cancelar-nueva-direccion-evento');
    
    if (btnNuevaDireccionEvento) {
        btnNuevaDireccionEvento.addEventListener('click', toggleFormNuevaDireccionEvento);
    }
    if (btnCerrarFormDireccionEvento) {
        btnCerrarFormDireccionEvento.addEventListener('click', cerrarFormNuevaDireccionEvento);
    }
    if (btnGuardarNuevaDireccionEvento) {
        btnGuardarNuevaDireccionEvento.addEventListener('click', guardarNuevaDireccionEvento);
    }
    if (btnCancelarNuevaDireccionEvento) {
        btnCancelarNuevaDireccionEvento.addEventListener('click', cerrarFormNuevaDireccionEvento);
    }
    
    // Botones del modal de delitos
    const closeModalDelitoBtn = document.getElementById('close-modal-delito-btn');
    const cancelarDelitoBtn = document.getElementById('cancelar-delito-btn');
    const formNuevoDelito = document.getElementById('form-nuevo-delito');
    const modalDelito = document.getElementById('modal-nuevo-delito');
    
    if (closeModalDelitoBtn) {
        closeModalDelitoBtn.addEventListener('click', closeModalDelitos);
    }
    
    if (cancelarDelitoBtn) {
        cancelarDelitoBtn.addEventListener('click', closeModalDelitos);
    }
    
    if (formNuevoDelito) {
        formNuevoDelito.addEventListener('submit', submitDelitoForm);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalDelito) {
        modalDelito.addEventListener('click', function(e) {
            if (e.target === modalDelito) {
                closeModalDelitos();
            }
        });
    }
    
    // Botones del modal de faltas
    const closeModalFaltaBtn = document.getElementById('close-modal-falta-btn');
    const cancelarFaltaBtn = document.getElementById('cancelar-falta-btn');
    const formNuevaFalta = document.getElementById('form-nueva-falta');
    const modalFalta = document.getElementById('modal-nueva-falta');
    
    if (closeModalFaltaBtn) {
        closeModalFaltaBtn.addEventListener('click', closeModalFaltas);
    }
    
    if (cancelarFaltaBtn) {
        cancelarFaltaBtn.addEventListener('click', closeModalFaltas);
    }
    
    if (formNuevaFalta) {
        formNuevaFalta.addEventListener('submit', submitFaltaForm);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalFalta) {
        modalFalta.addEventListener('click', function(e) {
            if (e.target === modalFalta) {
                closeModalFaltas();
            }
        });
    }
    
    // Botones del modal de rivalidades
    const closeModalRivalidadBtn = document.getElementById('close-modal-rivalidad-btn');
    const cancelarRivalidadBtn = document.getElementById('cancelar-rivalidad-btn');
    const formNuevaRivalidad = document.getElementById('form-nueva-rivalidad');
    const modalRivalidad = document.getElementById('modal-nueva-rivalidad');
    
    if (closeModalRivalidadBtn) {
        closeModalRivalidadBtn.addEventListener('click', closeModalRivalidades);
    }
    
    if (cancelarRivalidadBtn) {
        cancelarRivalidadBtn.addEventListener('click', closeModalRivalidades);
    }
    
    if (formNuevaRivalidad) {
        formNuevaRivalidad.addEventListener('submit', submitRivalidadForm);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalRivalidad) {
        modalRivalidad.addEventListener('click', function(e) {
            if (e.target === modalRivalidad) {
                closeModalRivalidades();
            }
        });
    }
    
    // Botones del modal de redes sociales
    const closeModalRedSocialBtn = document.getElementById('close-modal-red-social-btn');
    const cancelarRedSocialBtn = document.getElementById('cancelar-red-social-btn');
    const formNuevaRedSocial = document.getElementById('form-nueva-red-social');
    const modalRedSocial = document.getElementById('modal-nueva-red-social');
    
    if (closeModalRedSocialBtn) {
        closeModalRedSocialBtn.addEventListener('click', closeModalRedesSociales);
    }
    
    if (cancelarRedSocialBtn) {
        cancelarRedSocialBtn.addEventListener('click', closeModalRedesSociales);
    }
    
    if (formNuevaRedSocial) {
        formNuevaRedSocial.addEventListener('submit', submitRedSocialForm);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalRedSocial) {
        modalRedSocial.addEventListener('click', function(e) {
            if (e.target === modalRedSocial) {
                closeModalRedesSociales();
            }
        });
    }
    
    // Inicializar el estado del botón
    updateContinuarButton();
});

