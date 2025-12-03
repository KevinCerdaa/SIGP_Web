// Variable para almacenar el tipo de registro seleccionado
let currentEditType = null;
let currentEditId = null;

// Función para habilitar/deshabilitar el botón según la selección
function updateContinuarEditButton() {
    const tipoSelect = document.getElementById('tipo-registro-edit-select');
    const registroSelect = document.getElementById('registro-edit-select');
    const continuarBtn = document.getElementById('btn-continuar-edit-registro');
    
    if (tipoSelect && registroSelect && continuarBtn) {
        if (tipoSelect.value && tipoSelect.value !== '' && registroSelect.value && registroSelect.value !== '') {
            continuarBtn.disabled = false;
        } else {
            continuarBtn.disabled = true;
        }
    }
}

// Función para cargar registros según el tipo seleccionado
async function loadRegistrosForEdit(tipo) {
    const registroSelect = document.getElementById('registro-edit-select');
    if (!registroSelect) return;
    
    registroSelect.disabled = true;
    registroSelect.innerHTML = '<option value="" disabled selected>Cargando...</option>';
    
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            registroSelect.innerHTML = '<option value="" disabled selected>Inicia sesión para cargar registros</option>';
            return;
        }
        
        let registros = [];
        
        switch(tipo) {
            case 'pandillas':
                const response = await fetch('http://localhost:8000/api/pandillas/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.pandillas) {
                        registros = data.pandillas;
                    }
                }
                break;
            case 'integrantes':
                const responseIntegrantes = await fetch('http://localhost:8000/api/integrantes/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (responseIntegrantes.ok) {
                    const data = await responseIntegrantes.json();
                    if (data.success && data.integrantes) {
                        registros = data.integrantes;
                    }
                }
                break;
            case 'eventos':
                const responseEventos = await fetch('http://localhost:8000/api/eventos/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (responseEventos.ok) {
                    const data = await responseEventos.json();
                    console.log('DEBUG: Respuesta de eventos:', data);
                    if (data.success) {
                        if (data.eventos && Array.isArray(data.eventos)) {
                            registros = data.eventos;
                            console.log(`DEBUG: ${registros.length} eventos cargados`);
                        } else {
                            console.warn('DEBUG: data.eventos no es un array:', data.eventos);
                            registros = [];
                        }
                    } else {
                        console.error('Error al obtener eventos:', data.message || 'Error desconocido');
                        registroSelect.innerHTML = '<option value="" disabled selected>Error al cargar eventos</option>';
                    }
                } else {
                    const errorData = await responseEventos.json().catch(() => ({}));
                    console.error('Error HTTP al obtener eventos:', responseEventos.status, errorData);
                    registroSelect.innerHTML = '<option value="" disabled selected>Error al cargar eventos</option>';
                }
                break;
            case 'delitos':
                const responseDelitos = await fetch('http://localhost:8000/api/delitos/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (responseDelitos.ok) {
                    const data = await responseDelitos.json();
                    if (data.success && data.delitos) {
                        registros = data.delitos;
                    }
                }
                break;
            case 'faltas':
                const responseFaltas = await fetch('http://localhost:8000/api/faltas/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (responseFaltas.ok) {
                    const data = await responseFaltas.json();
                    if (data.success && data.faltas) {
                        registros = data.faltas;
                    }
                }
                break;
            case 'direcciones':
                const responseDirecciones = await fetch('http://localhost:8000/api/direcciones/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (responseDirecciones.ok) {
                    const data = await responseDirecciones.json();
                    if (data.success && data.direcciones) {
                        registros = data.direcciones;
                    }
                }
                break;
            case 'rivalidades':
                const responseRivalidades = await fetch('http://localhost:8000/api/rivalidades/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (responseRivalidades.ok) {
                    const data = await responseRivalidades.json();
                    if (data.success && data.rivalidades) {
                        registros = data.rivalidades;
                    }
                }
                break;
            case 'redes-sociales':
                const responseRedes = await fetch('http://localhost:8000/api/redes-sociales/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (responseRedes.ok) {
                    const data = await responseRedes.json();
                    if (data.success && data.redes_sociales) {
                        registros = data.redes_sociales;
                    }
                }
                break;
            default:
                registroSelect.innerHTML = '<option value="" disabled selected>Selecciona un tipo de registro</option>';
        }
        
        // Si hay registros, poblar el select
        if (registros.length > 0) {
            registroSelect.innerHTML = '<option value="" disabled selected>Selecciona un registro</option>';
            registros.forEach(registro => {
                const option = document.createElement('option');
                // Determinar el ID y el texto según el tipo
                let id = registro.id_pandilla || registro.id_integrante || registro.id_evento || 
                         registro.id_delito || registro.id_falta || registro.id_direccion || 
                         registro.id_rivalidad || registro.id_red_social;
                
                // Formatear texto según el tipo de registro
                let texto = '';
                if (registro.nombre) {
                    texto = registro.nombre;
                } else if (registro.calle) {
                    texto = `${registro.calle} ${registro.numero || ''}, ${registro.colonia || ''}`.trim();
                } else if (registro.pandilla_nombre && registro.pandilla_rival_nombre) {
                    texto = `${registro.pandilla_nombre} vs ${registro.pandilla_rival_nombre}`;
                } else if (registro.plataforma) {
                    texto = `${registro.plataforma}${registro.handle ? ': ' + registro.handle : ''}`;
                } else if (registro.tipo) {
                    // Para eventos: tipo - fecha (hora si existe)
                    const fechaStr = registro.fecha ? registro.fecha.split('T')[0] : 'Sin fecha';
                    const horaStr = registro.hora ? registro.hora : '';
                    texto = `${registro.tipo.charAt(0).toUpperCase() + registro.tipo.slice(1)} - ${fechaStr}${horaStr ? ' ' + horaStr : ''}`;
                } else {
                    texto = `ID: ${id}`;
                }
                
                option.value = id;
                option.textContent = texto;
                registroSelect.appendChild(option);
            });
            registroSelect.disabled = false;
        } else {
            registroSelect.innerHTML = '<option value="" disabled selected>No hay registros disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar registros:', error);
        registroSelect.innerHTML = '<option value="" disabled selected>Error al cargar registros</option>';
    }
    
    updateContinuarEditButton();
}

// Función para abrir el modal de edición de pandillas
function openModalEditarPandilla(pandillaId) {
    const modal = document.getElementById('modal-editar-pandilla');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = pandillaId;
        
        // Cargar datos necesarios para los selectores
        loadZonasForEditPandilla();
        loadDireccionesForEditPandilla();
        loadDelitosForEditPandilla();
        loadFaltasForEditPandilla();
        loadPandillasForEditRivalidades();
        loadRedesSocialesForEditPandilla();
        
        // Cargar datos de la pandilla
        loadPandillaData(pandillaId);
    }
}

// Función para cerrar el modal de edición de pandillas
function closeModalEditarPandilla() {
    const modal = document.getElementById('modal-editar-pandilla');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        // Limpiar el formulario
        document.getElementById('form-editar-pandilla').reset();
        // Limpiar mensajes
        document.getElementById('error-message-editar-pandilla').classList.add('hidden');
        document.getElementById('success-message-editar-pandilla').classList.add('hidden');
        currentEditId = null;
    }
}

// Función para cargar datos de la pandilla
async function loadPandillaData(pandillaId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            document.getElementById('error-message-editar-pandilla').textContent = 'No estás autenticado';
            document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
            return;
        }
        
        const response = await fetch(`http://localhost:8000/api/pandillas/${pandillaId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.pandilla) {
            const p = data.pandilla;
            
            // Llenar campos básicos
            document.getElementById('id-pandilla-edit').value = p.id_pandilla;
            document.getElementById('nombre-pandilla-edit').value = p.nombre;
            document.getElementById('lider-pandilla-edit').value = p.lider || '';
            document.getElementById('descripcion-pandilla-edit').value = p.descripcion || '';
            document.getElementById('numero-integrantes-pandilla-edit').value = p.numero_integrantes || '';
            document.getElementById('edades-aproximadas-pandilla-edit').value = p.edades_promedio || '';
            document.getElementById('horario-reunion-pandilla-edit').value = p.horario_reunion || '';
            
            // Convertir peligrosidad string a número para el select
            let peligrosidadNum = '3'; // Por defecto Alto
            if (p.peligrosidad === 'Bajo') peligrosidadNum = '1';
            else if (p.peligrosidad === 'Medio') peligrosidadNum = '2';
            else if (p.peligrosidad === 'Alto') peligrosidadNum = '3';
            document.getElementById('peligrosidad-pandilla-edit').value = peligrosidadNum;
            
            // Seleccionar zona y dirección
            if (p.id_zona) document.getElementById('zona-pandilla-edit').value = p.id_zona;
            if (p.id_direccion) document.getElementById('direccion-pandilla-edit').value = p.id_direccion;
            
            // Marcar delitos, faltas, rivalidades y redes sociales seleccionadas
            if (p.delitos && p.delitos.length > 0) {
                p.delitos.forEach(delitoId => {
                    const checkbox = document.querySelector(`input[name="delitos-edit"][value="${delitoId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (p.faltas && p.faltas.length > 0) {
                p.faltas.forEach(faltaId => {
                    const checkbox = document.querySelector(`input[name="faltas-edit"][value="${faltaId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (p.rivalidades && p.rivalidades.length > 0) {
                p.rivalidades.forEach(rivalId => {
                    const checkbox = document.querySelector(`input[name="rivalidades-edit"][value="${rivalId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (p.redes_sociales && p.redes_sociales.length > 0) {
                p.redes_sociales.forEach(redId => {
                    const checkbox = document.querySelector(`input[name="redes_sociales-edit"][value="${redId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } else {
            document.getElementById('error-message-editar-pandilla').textContent = 'Error al cargar los datos de la pandilla';
            document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al cargar datos de la pandilla:', error);
        document.getElementById('error-message-editar-pandilla').textContent = 'Error al cargar los datos de la pandilla';
        document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
    }
}

// Funciones para cargar datos en los selectores (similares a nuevo_registro.js)
async function loadZonasForEditPandilla() {
    try {
        const response = await fetch('http://localhost:8000/api/zones/');
        if (!response.ok) throw new Error('Error al cargar zonas');
        const zones = await response.json();
        
        const zonaSelect = document.getElementById('zona-pandilla-edit');
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
    }
}

async function loadDireccionesForEditPandilla() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/direcciones/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar direcciones');
        const data = await response.json();
        
        const direccionSelect = document.getElementById('direccion-pandilla-edit');
        if (!direccionSelect) return;
        
        direccionSelect.innerHTML = '<option value="">Ninguna</option>';
        if (data.success && data.direcciones) {
            data.direcciones.forEach(direccion => {
                const option = document.createElement('option');
                option.value = direccion.id_direccion;
                option.textContent = `${direccion.calle} ${direccion.numero || ''}, ${direccion.colonia || ''}`;
                direccionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
        const direccionSelect = document.getElementById('direccion-pandilla-edit');
        if (direccionSelect) {
            direccionSelect.innerHTML = '<option value="" disabled selected>Error al cargar direcciones</option>';
        }
    }
}

async function loadDelitosForEditPandilla() {
    try {
        const response = await fetch('http://localhost:8000/api/crimes/');
        if (!response.ok) throw new Error('Error al cargar delitos');
        const crimes = await response.json();
        
        const delitosContainer = document.getElementById('delitos-pandilla-edit-container');
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
                <input type="checkbox" name="delitos-edit" value="${crime.id}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${crime.nombre}</span>
            `;
            delitosContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar delitos:', error);
    }
}

async function loadFaltasForEditPandilla() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/faltas/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar faltas');
        const data = await response.json();
        
        const faltasContainer = document.getElementById('faltas-pandilla-edit-container');
        if (!faltasContainer) return;
        
        faltasContainer.innerHTML = '';
        if (!data.success || !data.faltas || data.faltas.length === 0) {
            faltasContainer.innerHTML = '<p class="text-slate-500 text-sm">No hay faltas disponibles</p>';
            return;
        }
        
        data.faltas.forEach(falta => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
            label.innerHTML = `
                <input type="checkbox" name="faltas-edit" value="${falta.id_falta}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${falta.nombre}</span>
            `;
            faltasContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar faltas:', error);
    }
}

async function loadPandillasForEditRivalidades() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();
        
        const rivalidadesContainer = document.getElementById('rivalidades-pandilla-edit-container');
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
                <input type="checkbox" name="rivalidades-edit" value="${pandilla.id_pandilla}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${pandilla.nombre}</span>
            `;
            rivalidadesContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
    }
}

async function loadRedesSocialesForEditPandilla() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/redes-sociales/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar redes sociales');
        const data = await response.json();
        
        const redesContainer = document.getElementById('redes-sociales-pandilla-edit-container');
        if (!redesContainer) return;
        
        redesContainer.innerHTML = '';
        if (!data.success || !data.redes_sociales || data.redes_sociales.length === 0) {
            redesContainer.innerHTML = '<p class="text-slate-500 text-sm">No hay redes sociales disponibles</p>';
            return;
        }
        
        data.redes_sociales.forEach(red => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
            const displayText = `${red.plataforma}${red.handle ? ': ' + red.handle : ''}`;
            label.innerHTML = `
                <input type="checkbox" name="redes_sociales-edit" value="${red.id_red_social}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${displayText}</span>
            `;
            redesContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar redes sociales:', error);
    }
}

// Función para manejar el clic en el botón continuar
function handleContinuarEdit() {
    const tipoSelect = document.getElementById('tipo-registro-edit-select');
    const registroSelect = document.getElementById('registro-edit-select');
    
    if (!tipoSelect || !tipoSelect.value || !registroSelect || !registroSelect.value) {
        return;
    }
    
    const tipoRegistro = tipoSelect.value;
    const registroId = registroSelect.value;
    
    console.log('Tipo de registro seleccionado:', tipoRegistro);
    console.log('ID del registro a editar:', registroId);
    
    // Abrir el modal correspondiente según el tipo seleccionado
    switch(tipoRegistro) {
        case 'pandillas':
            openModalEditarPandilla(registroId);
            break;
        case 'integrantes':
            openModalEditarIntegrante(registroId);
            break;
        case 'eventos':
            openModalEditarEvento(registroId);
            break;
        case 'delitos':
            openModalEditarDelito(registroId);
            break;
        case 'faltas':
            openModalEditarFalta(registroId);
            break;
        case 'direcciones':
            openModalEditarDireccion(registroId);
            break;
        case 'rivalidades':
            openModalEditarRivalidad(registroId);
            break;
        case 'redes-sociales':
            openModalEditarRedSocial(registroId);
            break;
        default:
            alert('Tipo de registro no reconocido');
    }
}

// Función para validar y enviar el formulario de edición de pandilla
async function submitEditarPandillaForm(e) {
    e.preventDefault();
    
    if (!currentEditId) {
        document.getElementById('error-message-editar-pandilla').textContent = 'No se ha seleccionado una pandilla para editar';
        document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
        return;
    }
    
    const nombre = document.getElementById('nombre-pandilla-edit').value.trim();
    const peligrosidad = document.getElementById('peligrosidad-pandilla-edit').value;
    const zona = document.getElementById('zona-pandilla-edit').value;
    
    // Limpiar mensajes previos
    document.getElementById('error-message-editar-pandilla').classList.add('hidden');
    document.getElementById('success-message-editar-pandilla').classList.add('hidden');
    
    // Validaciones básicas
    if (!nombre || !peligrosidad || !zona) {
        document.getElementById('error-message-editar-pandilla').textContent = 'Por favor, completa todos los campos requeridos';
        document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
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
        id_pandilla: currentEditId,
        nombre: nombre,
        descripcion: document.getElementById('descripcion-pandilla-edit').value.trim(),
        lider: document.getElementById('lider-pandilla-edit').value.trim(),
        numero_integrantes: document.getElementById('numero-integrantes-pandilla-edit').value ? parseInt(document.getElementById('numero-integrantes-pandilla-edit').value) : null,
        edades_aproximadas: document.getElementById('edades-aproximadas-pandilla-edit').value ? parseFloat(document.getElementById('edades-aproximadas-pandilla-edit').value) : null,
        horario_reunion: document.getElementById('horario-reunion-pandilla-edit').value.trim(),
        peligrosidad: peligrosidadString, // Enviar como string: "Bajo", "Medio", "Alto"
        id_zona: parseInt(zona),
        id_direccion: document.getElementById('direccion-pandilla-edit').value ? parseInt(document.getElementById('direccion-pandilla-edit').value) : null,
        delitos: Array.from(document.querySelectorAll('input[name="delitos-edit"]:checked')).map(cb => parseInt(cb.value)),
        faltas: Array.from(document.querySelectorAll('input[name="faltas-edit"]:checked')).map(cb => parseInt(cb.value)),
        rivalidades: Array.from(document.querySelectorAll('input[name="rivalidades-edit"]:checked')).map(cb => parseInt(cb.value)),
        redes_sociales: Array.from(document.querySelectorAll('input[name="redes_sociales-edit"]:checked')).map(cb => parseInt(cb.value))
    };
    
    // Enviar datos al backend
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-pandilla').textContent = 'No estás autenticado. Por favor, inicia sesión.';
        document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8000/api/pandillas/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('success-message-editar-pandilla').textContent = 'Pandilla actualizada correctamente';
            document.getElementById('success-message-editar-pandilla').classList.remove('hidden');
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                closeModalEditarPandilla();
            }, 2000);
        } else {
            document.getElementById('error-message-editar-pandilla').textContent = data.message || 'Error al actualizar la pandilla';
            document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al actualizar pandilla:', error);
        document.getElementById('error-message-editar-pandilla').textContent = 'Error de conexión. Por favor, intenta nuevamente.';
        document.getElementById('error-message-editar-pandilla').classList.remove('hidden');
    }
}

// ==================== FUNCIONES PARA EDITAR INTEGRANTES ====================

async function openModalEditarIntegrante(integranteId) {
    const modal = document.getElementById('modal-editar-integrante');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = integranteId;
        
        // Cargar datos necesarios
        await loadPandillasForEditIntegrante();
        await loadDireccionesForEditIntegrante();
        await loadIntegranteData(integranteId);
    }
}

function closeModalEditarIntegrante() {
    const modal = document.getElementById('modal-editar-integrante');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-integrante').reset();
        document.getElementById('error-message-editar-integrante').classList.add('hidden');
        document.getElementById('success-message-editar-integrante').classList.add('hidden');
        currentEditId = null;
    }
}

async function loadIntegranteData(integranteId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/integrantes/${integranteId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.integrante) {
            const i = data.integrante;
            document.getElementById('id-integrante-edit').value = i.id_integrante;
            document.getElementById('nombre-integrante-edit').value = i.nombre;
            document.getElementById('apellido-paterno-integrante-edit').value = i.apellido_paterno || '';
            document.getElementById('apellido-materno-integrante-edit').value = i.apellido_materno || '';
            document.getElementById('alias-integrante-edit').value = i.alias || '';
            document.getElementById('fecha-nacimiento-integrante-edit').value = i.fecha_nacimiento || '';
            if (i.id_pandilla) document.getElementById('pandilla-integrante-edit').value = i.id_pandilla;
            if (i.id_direccion) document.getElementById('direccion-integrante-edit').value = i.id_direccion;
            
            // Mostrar imágenes existentes
            const container = document.getElementById('imagenes-actuales-integrante-edit');
            container.innerHTML = '';
            if (i.imagenes && i.imagenes.length > 0) {
                i.imagenes.forEach(img => {
                    const div = document.createElement('div');
                    div.className = 'relative';
                    div.innerHTML = `
                        <img src="http://localhost:8000/${img.url_imagen}" alt="Imagen" class="w-full h-full object-cover rounded-lg">
                    `;
                    container.appendChild(div);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar integrante:', error);
    }
}

async function loadPandillasForEditIntegrante() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        const select = document.getElementById('pandilla-integrante-edit');
        if (select && data.success) {
            select.innerHTML = '<option value="">Ninguna</option>';
            data.pandillas.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id_pandilla;
                option.textContent = p.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
    }
}

async function loadDireccionesForEditIntegrante() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/direcciones/', {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        const select = document.getElementById('direccion-integrante-edit');
        if (select && data.success) {
            select.innerHTML = '<option value="">Ninguna</option>';
            data.direcciones.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id_direccion;
                option.textContent = `${d.calle} ${d.numero || ''}, ${d.colonia || ''}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
    }
}

async function submitEditarIntegranteForm(e) {
    e.preventDefault();
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre-integrante-edit').value);
    formData.append('apellido_paterno', document.getElementById('apellido-paterno-integrante-edit').value);
    formData.append('apellido_materno', document.getElementById('apellido-materno-integrante-edit').value);
    formData.append('alias', document.getElementById('alias-integrante-edit').value);
    formData.append('fecha_nacimiento', document.getElementById('fecha-nacimiento-integrante-edit').value);
    formData.append('id_pandilla', document.getElementById('pandilla-integrante-edit').value || '');
    formData.append('id_direccion', document.getElementById('direccion-integrante-edit').value || '');
    
    const imagenes = document.getElementById('imagenes-integrante-edit').files;
    for (let i = 0; i < imagenes.length; i++) {
        formData.append('imagenes', imagenes[i]);
    }
    
    try {
        const response = await fetch(`http://localhost:8000/api/integrantes/${currentEditId}/update/`, {
            method: 'PUT',
            headers: { 'Authorization': `Token ${token}` },
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('success-message-editar-integrante').textContent = 'Integrante actualizado correctamente';
            document.getElementById('success-message-editar-integrante').classList.remove('hidden');
            setTimeout(() => closeModalEditarIntegrante(), 2000);
        } else {
            document.getElementById('error-message-editar-integrante').textContent = data.message || 'Error al actualizar';
            document.getElementById('error-message-editar-integrante').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-editar-integrante').textContent = 'Error de conexión';
        document.getElementById('error-message-editar-integrante').classList.remove('hidden');
    }
}

// ==================== FUNCIONES PARA EDITAR EVENTOS ====================

async function openModalEditarEvento(eventoId) {
    const modal = document.getElementById('modal-editar-evento');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = eventoId;
        await loadEventoData(eventoId);
    }
}

function closeModalEditarEvento() {
    const modal = document.getElementById('modal-editar-evento');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-evento').reset();
        currentEditId = null;
    }
}

async function loadEventoData(eventoId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/eventos/${eventoId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.evento) {
            const e = data.evento;
            document.getElementById('id-evento-edit').value = e.id_evento;
            document.getElementById('tipo-evento-edit').value = e.tipo;
            document.getElementById('fecha-evento-edit').value = e.fecha || '';
            document.getElementById('hora-evento-edit').value = e.hora || '';
            document.getElementById('descripcion-evento-edit').value = e.descripcion || '';
            if (e.id_delito) document.getElementById('delito-falta-select-edit').value = e.id_delito;
            if (e.id_falta) document.getElementById('delito-falta-select-edit').value = e.id_falta;
            if (e.id_pandilla) document.getElementById('pandilla-evento-edit').value = e.id_pandilla;
            if (e.id_integrante) document.getElementById('integrante-evento-edit').value = e.id_integrante;
            if (e.id_direccion) document.getElementById('direccion-evento-edit').value = e.id_direccion;
        }
    } catch (error) {
        console.error('Error al cargar evento:', error);
    }
}

async function submitEditarEventoForm(e) {
    e.preventDefault();
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    const formData = {
        tipo: document.getElementById('tipo-evento-edit').value,
        fecha: document.getElementById('fecha-evento-edit').value,
        hora: document.getElementById('hora-evento-edit').value,
        descripcion: document.getElementById('descripcion-evento-edit').value,
        id_delito: document.getElementById('delito-falta-select-edit').value || null,
        id_falta: document.getElementById('delito-falta-select-edit').value || null,
        id_pandilla: document.getElementById('pandilla-evento-edit').value || null,
        id_integrante: document.getElementById('integrante-evento-edit').value || null,
        id_direccion: document.getElementById('direccion-evento-edit').value || null
    };
    
    try {
        const response = await fetch(`http://localhost:8000/api/eventos/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('success-message-editar-evento').textContent = 'Evento actualizado correctamente';
            document.getElementById('success-message-editar-evento').classList.remove('hidden');
            setTimeout(() => closeModalEditarEvento(), 2000);
        } else {
            document.getElementById('error-message-editar-evento').textContent = data.message || 'Error al actualizar';
            document.getElementById('error-message-editar-evento').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ==================== FUNCIONES PARA EDITAR DELITOS, FALTAS, DIRECCIONES, RIVALIDADES Y REDES SOCIALES ====================

async function openModalEditarDelito(delitoId) {
    const modal = document.getElementById('modal-editar-delito');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = delitoId;
        await loadDelitoData(delitoId);
    }
}

function closeModalEditarDelito() {
    const modal = document.getElementById('modal-editar-delito');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-delito').reset();
        currentEditId = null;
    }
}

async function loadDelitoData(delitoId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/delitos/${delitoId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        if (data.success && data.delito) {
            document.getElementById('id-delito-edit').value = data.delito.id_delito;
            document.getElementById('nombre-delito-edit').value = data.delito.nombre;
        }
    } catch (error) {
        console.error('Error al cargar delito:', error);
    }
}

async function submitEditarDelitoForm(e) {
    e.preventDefault();
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    try {
        const response = await fetch(`http://localhost:8000/api/delitos/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: document.getElementById('nombre-delito-edit').value })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('success-message-editar-delito').textContent = 'Delito actualizado correctamente';
            document.getElementById('success-message-editar-delito').classList.remove('hidden');
            setTimeout(() => closeModalEditarDelito(), 2000);
        } else {
            document.getElementById('error-message-editar-delito').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-delito').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function openModalEditarFalta(faltaId) {
    const modal = document.getElementById('modal-editar-falta');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = faltaId;
        await loadFaltaData(faltaId);
    }
}

function closeModalEditarFalta() {
    const modal = document.getElementById('modal-editar-falta');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-falta').reset();
        currentEditId = null;
    }
}

async function loadFaltaData(faltaId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/faltas/${faltaId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        if (data.success && data.falta) {
            document.getElementById('id-falta-edit').value = data.falta.id_falta;
            document.getElementById('nombre-falta-edit').value = data.falta.nombre;
        }
    } catch (error) {
        console.error('Error al cargar falta:', error);
    }
}

async function submitEditarFaltaForm(e) {
    e.preventDefault();
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    try {
        const response = await fetch(`http://localhost:8000/api/faltas/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: document.getElementById('nombre-falta-edit').value })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('success-message-editar-falta').textContent = 'Falta actualizada correctamente';
            document.getElementById('success-message-editar-falta').classList.remove('hidden');
            setTimeout(() => closeModalEditarFalta(), 2000);
        } else {
            document.getElementById('error-message-editar-falta').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-falta').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function openModalEditarDireccion(direccionId) {
    const modal = document.getElementById('modal-editar-direccion');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = direccionId;
        await loadDireccionData(direccionId);
    }
}

function closeModalEditarDireccion() {
    const modal = document.getElementById('modal-editar-direccion');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-direccion').reset();
        currentEditId = null;
    }
}

async function loadDireccionData(direccionId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/direcciones/${direccionId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        if (data.success && data.direccion) {
            const d = data.direccion;
            document.getElementById('id-direccion-edit').value = d.id_direccion;
            document.getElementById('calle-direccion-edit').value = d.calle;
            document.getElementById('numero-direccion-edit').value = d.numero || '';
            document.getElementById('colonia-direccion-edit').value = d.colonia || '';
            document.getElementById('codigo-postal-direccion-edit').value = d.codigo_postal || '';
            document.getElementById('latitud-direccion-edit').value = d.latitud;
            document.getElementById('longitud-direccion-edit').value = d.longitud;
        }
    } catch (error) {
        console.error('Error al cargar dirección:', error);
    }
}

async function submitEditarDireccionForm(e) {
    e.preventDefault();
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    try {
        const response = await fetch(`http://localhost:8000/api/direcciones/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                calle: document.getElementById('calle-direccion-edit').value,
                numero: document.getElementById('numero-direccion-edit').value,
                colonia: document.getElementById('colonia-direccion-edit').value,
                codigo_postal: document.getElementById('codigo-postal-direccion-edit').value,
                latitud: parseFloat(document.getElementById('latitud-direccion-edit').value),
                longitud: parseFloat(document.getElementById('longitud-direccion-edit').value)
            })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('success-message-editar-direccion').textContent = 'Dirección actualizada correctamente';
            document.getElementById('success-message-editar-direccion').classList.remove('hidden');
            setTimeout(() => closeModalEditarDireccion(), 2000);
        } else {
            document.getElementById('error-message-editar-direccion').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-direccion').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function openModalEditarRivalidad(rivalidadId) {
    const modal = document.getElementById('modal-editar-rivalidad');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = rivalidadId;
        await loadPandillasForEditRivalidad();
        await loadRivalidadData(rivalidadId);
    }
}

function closeModalEditarRivalidad() {
    const modal = document.getElementById('modal-editar-rivalidad');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-rivalidad').reset();
        currentEditId = null;
    }
}

async function loadPandillasForEditRivalidad() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        const select1 = document.getElementById('pandilla-1-rivalidad-edit');
        const select2 = document.getElementById('pandilla-2-rivalidad-edit');
        if (data.success) {
            const options = '<option value="">Selecciona...</option>' + 
                data.pandillas.map(p => `<option value="${p.id_pandilla}">${p.nombre}</option>`).join('');
            if (select1) select1.innerHTML = options;
            if (select2) select2.innerHTML = options;
        }
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
    }
}

async function loadRivalidadData(rivalidadId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/rivalidades/${rivalidadId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        if (data.success && data.rivalidad) {
            document.getElementById('id-rivalidad-edit').value = data.rivalidad.id_rivalidad;
            document.getElementById('pandilla-1-rivalidad-edit').value = data.rivalidad.id_pandilla;
            document.getElementById('pandilla-2-rivalidad-edit').value = data.rivalidad.id_pandilla_rival;
        }
    } catch (error) {
        console.error('Error al cargar rivalidad:', error);
    }
}

async function submitEditarRivalidadForm(e) {
    e.preventDefault();
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    try {
        const response = await fetch(`http://localhost:8000/api/rivalidades/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_pandilla: document.getElementById('pandilla-1-rivalidad-edit').value,
                id_pandilla_rival: document.getElementById('pandilla-2-rivalidad-edit').value
            })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('success-message-editar-rivalidad').textContent = 'Rivalidad actualizada correctamente';
            document.getElementById('success-message-editar-rivalidad').classList.remove('hidden');
            setTimeout(() => closeModalEditarRivalidad(), 2000);
        } else {
            document.getElementById('error-message-editar-rivalidad').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function openModalEditarRedSocial(redSocialId) {
    const modal = document.getElementById('modal-editar-red-social');
    if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open');
        currentEditId = redSocialId;
        await loadRedSocialData(redSocialId);
    }
}

function closeModalEditarRedSocial() {
    const modal = document.getElementById('modal-editar-red-social');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-red-social').reset();
        currentEditId = null;
    }
}

async function loadRedSocialData(redSocialId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/redes-sociales/${redSocialId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await response.json();
        if (data.success && data.red_social) {
            const r = data.red_social;
            document.getElementById('id-red-social-edit').value = r.id_red_social;
            document.getElementById('plataforma-red-social-edit').value = r.plataforma;
            document.getElementById('handle-red-social-edit').value = r.handle || '';
            document.getElementById('url-red-social-edit').value = r.url || '';
        }
    } catch (error) {
        console.error('Error al cargar red social:', error);
    }
}

async function submitEditarRedSocialForm(e) {
    e.preventDefault();
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    try {
        const response = await fetch(`http://localhost:8000/api/redes-sociales/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plataforma: document.getElementById('plataforma-red-social-edit').value,
                handle: document.getElementById('handle-red-social-edit').value,
                url: document.getElementById('url-red-social-edit').value
            })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('success-message-editar-red-social').textContent = 'Red social actualizada correctamente';
            document.getElementById('success-message-editar-red-social').classList.remove('hidden');
            setTimeout(() => closeModalEditarRedSocial(), 2000);
        } else {
            document.getElementById('error-message-editar-red-social').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-red-social').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const tipoSelect = document.getElementById('tipo-registro-edit-select');
    const registroSelect = document.getElementById('registro-edit-select');
    const continuarBtn = document.getElementById('btn-continuar-edit-registro');
    
    if (tipoSelect) {
        tipoSelect.addEventListener('change', function() {
            currentEditType = this.value;
            if (this.value) {
                loadRegistrosForEdit(this.value);
            } else {
                registroSelect.innerHTML = '<option value="" disabled selected>Primero selecciona un tipo de registro</option>';
                registroSelect.disabled = true;
                updateContinuarEditButton();
            }
        });
    }
    
    if (registroSelect) {
        registroSelect.addEventListener('change', updateContinuarEditButton);
    }
    
    if (continuarBtn) {
        continuarBtn.addEventListener('click', handleContinuarEdit);
    }
    
    // Botones del modal de editar pandillas
    const closeModalEditarPandillaBtn = document.getElementById('close-modal-editar-pandilla-btn');
    const cancelarEditarPandillaBtn = document.getElementById('cancelar-editar-pandilla-btn');
    const formEditarPandilla = document.getElementById('form-editar-pandilla');
    const modalEditarPandilla = document.getElementById('modal-editar-pandilla');
    
    if (closeModalEditarPandillaBtn) {
        closeModalEditarPandillaBtn.addEventListener('click', closeModalEditarPandilla);
    }
    
    if (cancelarEditarPandillaBtn) {
        cancelarEditarPandillaBtn.addEventListener('click', closeModalEditarPandilla);
    }
    
    if (formEditarPandilla) {
        formEditarPandilla.addEventListener('submit', submitEditarPandillaForm);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalEditarPandilla) {
        modalEditarPandilla.addEventListener('click', function(e) {
            if (e.target === modalEditarPandilla) {
                closeModalEditarPandilla();
            }
        });
    }
    
    // Event listeners para modales de edición de integrantes
    const formEditarIntegrante = document.getElementById('form-editar-integrante');
    const closeModalEditarIntegranteBtn = document.getElementById('close-modal-editar-integrante-btn');
    const cancelarEditarIntegranteBtn = document.getElementById('cancelar-editar-integrante-btn');
    if (formEditarIntegrante) formEditarIntegrante.addEventListener('submit', submitEditarIntegranteForm);
    if (closeModalEditarIntegranteBtn) closeModalEditarIntegranteBtn.addEventListener('click', closeModalEditarIntegrante);
    if (cancelarEditarIntegranteBtn) cancelarEditarIntegranteBtn.addEventListener('click', closeModalEditarIntegrante);
    
    // Event listeners para modales de edición de eventos
    const formEditarEvento = document.getElementById('form-editar-evento');
    const closeModalEditarEventoBtn = document.getElementById('close-modal-editar-evento-btn');
    const cancelarEditarEventoBtn = document.getElementById('cancelar-editar-evento-btn');
    if (formEditarEvento) formEditarEvento.addEventListener('submit', submitEditarEventoForm);
    if (closeModalEditarEventoBtn) closeModalEditarEventoBtn.addEventListener('click', closeModalEditarEvento);
    if (cancelarEditarEventoBtn) cancelarEditarEventoBtn.addEventListener('click', closeModalEditarEvento);
    
    // Event listeners para modales de edición de delitos
    const formEditarDelito = document.getElementById('form-editar-delito');
    const closeModalEditarDelitoBtn = document.getElementById('close-modal-editar-delito-btn');
    const cancelarEditarDelitoBtn = document.getElementById('cancelar-editar-delito-btn');
    if (formEditarDelito) formEditarDelito.addEventListener('submit', submitEditarDelitoForm);
    if (closeModalEditarDelitoBtn) closeModalEditarDelitoBtn.addEventListener('click', closeModalEditarDelito);
    if (cancelarEditarDelitoBtn) cancelarEditarDelitoBtn.addEventListener('click', closeModalEditarDelito);
    
    // Event listeners para modales de edición de faltas
    const formEditarFalta = document.getElementById('form-editar-falta');
    const closeModalEditarFaltaBtn = document.getElementById('close-modal-editar-falta-btn');
    const cancelarEditarFaltaBtn = document.getElementById('cancelar-editar-falta-btn');
    if (formEditarFalta) formEditarFalta.addEventListener('submit', submitEditarFaltaForm);
    if (closeModalEditarFaltaBtn) closeModalEditarFaltaBtn.addEventListener('click', closeModalEditarFalta);
    if (cancelarEditarFaltaBtn) cancelarEditarFaltaBtn.addEventListener('click', closeModalEditarFalta);
    
    // Event listeners para modales de edición de direcciones
    const formEditarDireccion = document.getElementById('form-editar-direccion');
    const closeModalEditarDireccionBtn = document.getElementById('close-modal-editar-direccion-btn');
    const cancelarEditarDireccionBtn = document.getElementById('cancelar-editar-direccion-btn');
    if (formEditarDireccion) formEditarDireccion.addEventListener('submit', submitEditarDireccionForm);
    if (closeModalEditarDireccionBtn) closeModalEditarDireccionBtn.addEventListener('click', closeModalEditarDireccion);
    if (cancelarEditarDireccionBtn) cancelarEditarDireccionBtn.addEventListener('click', closeModalEditarDireccion);
    
    // Event listeners para modales de edición de rivalidades
    const formEditarRivalidad = document.getElementById('form-editar-rivalidad');
    const closeModalEditarRivalidadBtn = document.getElementById('close-modal-editar-rivalidad-btn');
    const cancelarEditarRivalidadBtn = document.getElementById('cancelar-editar-rivalidad-btn');
    if (formEditarRivalidad) formEditarRivalidad.addEventListener('submit', submitEditarRivalidadForm);
    if (closeModalEditarRivalidadBtn) closeModalEditarRivalidadBtn.addEventListener('click', closeModalEditarRivalidad);
    if (cancelarEditarRivalidadBtn) cancelarEditarRivalidadBtn.addEventListener('click', closeModalEditarRivalidad);
    
    // Event listeners para modales de edición de redes sociales
    const formEditarRedSocial = document.getElementById('form-editar-red-social');
    const closeModalEditarRedSocialBtn = document.getElementById('close-modal-editar-red-social-btn');
    const cancelarEditarRedSocialBtn = document.getElementById('cancelar-editar-red-social-btn');
    if (formEditarRedSocial) formEditarRedSocial.addEventListener('submit', submitEditarRedSocialForm);
    if (closeModalEditarRedSocialBtn) closeModalEditarRedSocialBtn.addEventListener('click', closeModalEditarRedSocial);
    if (cancelarEditarRedSocialBtn) cancelarEditarRedSocialBtn.addEventListener('click', closeModalEditarRedSocial);
    
    // Inicializar el estado del botón
    updateContinuarEditButton();
});

