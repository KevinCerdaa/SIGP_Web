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

        switch (tipo) {
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
                try {
                    const responseIntegrantes = await fetch('http://localhost:8000/api/integrantes/', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!responseIntegrantes.ok) {
                        throw new Error(`HTTP ${responseIntegrantes.status}: ${responseIntegrantes.statusText}`);
                    }

                    const dataIntegrantes = await responseIntegrantes.json();

                    if (dataIntegrantes.success && Array.isArray(dataIntegrantes.integrantes)) {
                        registros = dataIntegrantes.integrantes.filter(r => r && r.id_integrante);
                        console.log(`✅ Cargados ${registros.length} integrantes`);
                    } else {
                        console.error('❌ Respuesta inválida de integrantes:', dataIntegrantes);
                        registros = [];
                    }
                } catch (error) {
                    console.error('❌ Error al cargar integrantes:', error);
                    registros = [];
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
                    if (data.success && data.eventos) {
                        registros = data.eventos;
                    }
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
                // Determinar el ID según el tipo específico (IMPORTANTE: usar el campo correcto)
                let id = null;

                switch (tipo) {
                    case 'integrantes':
                        id = registro.id_integrante;
                        break;
                    case 'pandillas':
                        id = registro.id_pandilla;
                        break;
                    case 'eventos':
                        id = registro.id_evento;
                        break;
                    case 'delitos':
                        id = registro.id_delito;
                        break;
                    case 'faltas':
                        id = registro.id_falta;
                        break;
                    case 'direcciones':
                        id = registro.id_direccion;
                        break;
                    case 'rivalidades':
                        id = registro.id_rivalidad;
                        break;
                    case 'redes-sociales':
                        id = registro.id_red_social;
                        break;
                    default:
                        // Fallback: intentar todos los campos
                        id = registro.id_pandilla || registro.id_integrante || registro.id_evento ||
                            registro.id_delito || registro.id_falta || registro.id_direccion ||
                            registro.id_rivalidad || registro.id_red_social;
                }

                // Validar que el ID existe y es válido
                if (!id && id !== 0) {
                    console.warn(`Registro sin ID válido para tipo "${tipo}":`, registro);
                    return; // Saltar este registro
                }

                // Validar que el ID es un número válido
                const idNum = parseInt(id, 10);
                if (isNaN(idNum)) {
                    console.warn(`ID inválido (no es número) para tipo "${tipo}":`, id, registro);
                    return; // Saltar este registro
                }

                // Formatear texto según el tipo de registro
                let texto = '';

                if (tipo === 'integrantes') {
                    // Para integrantes: nombre completo + alias
                    const partes = [];
                    if (registro.nombre) partes.push(registro.nombre);
                    if (registro.apellido_paterno) partes.push(registro.apellido_paterno);
                    if (registro.apellido_materno) partes.push(registro.apellido_materno);
                    texto = partes.join(' ').trim();
                    if (registro.alias) {
                        texto += ` (${registro.alias})`;
                    }
                    if (!texto) texto = `ID: ${id}`;
                } else if (tipo === 'faltas') {
                    // Para faltas: usar el campo 'falta' en lugar de 'nombre'
                    texto = registro.falta || registro.nombre || `ID: ${id}`;
                } else if (registro.nombre) {
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

                option.value = idNum; // Usar el ID convertido a número
                option.textContent = texto || `ID: ${idNum}`;
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

// Función para manejar el clic en el botón continuar
function handleContinuarEdit() {
    const tipoSelect = document.getElementById('tipo-registro-edit-select');
    const registroSelect = document.getElementById('registro-edit-select');

    if (!tipoSelect || !tipoSelect.value || !registroSelect || !registroSelect.value) {
        return;
    }

    const tipoRegistro = tipoSelect.value;
    const registroId = registroSelect.value;

    // Abrir el modal correspondiente según el tipo seleccionado
    switch (tipoRegistro) {
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

// ==================== FUNCIONES PARA EDITAR PANDILLAS ====================

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

function closeModalEditarPandilla() {
    const modal = document.getElementById('modal-editar-pandilla');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-pandilla').reset();
        document.getElementById('error-message-editar-pandilla').classList.add('hidden');
        document.getElementById('success-message-editar-pandilla').classList.add('hidden');
        currentEditId = null;
    }
}

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

        if (!response.ok) {
            throw new Error('Error al cargar la pandilla');
        }

        const data = await response.json();

        if (data.success && data.pandilla) {
            const p = data.pandilla;

            // Llenar campos básicos
            document.getElementById('id-pandilla-edit').value = p.id_pandilla;
            document.getElementById('nombre-pandilla-edit').value = p.nombre || '';
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

            // Seleccionar zona y dirección (esperar a que se carguen)
            setTimeout(() => {
                if (p.id_zona) {
                    const zonaSelect = document.getElementById('zona-pandilla-edit');
                    if (zonaSelect) zonaSelect.value = p.id_zona;
                }
                if (p.id_direccion) {
                    const direccionSelect = document.getElementById('direccion-pandilla-edit');
                    if (direccionSelect) direccionSelect.value = p.id_direccion;
                }
            }, 500);

            // Marcar delitos, faltas, rivalidades y redes sociales seleccionadas
            setTimeout(() => {
                // Desmarcar todos primero
                document.querySelectorAll('input[name="delitos-edit"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('input[name="faltas-edit"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('input[name="rivalidades-edit"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('input[name="redes_sociales-edit"]').forEach(cb => cb.checked = false);

                // Marcar los seleccionados
                if (p.delitos && Array.isArray(p.delitos) && p.delitos.length > 0) {
                    p.delitos.forEach(delitoId => {
                        const checkbox = document.querySelector(`input[name="delitos-edit"][value="${delitoId}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }

                if (p.faltas && Array.isArray(p.faltas) && p.faltas.length > 0) {
                    p.faltas.forEach(faltaId => {
                        const checkbox = document.querySelector(`input[name="faltas-edit"][value="${faltaId}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }

                if (p.rivalidades && Array.isArray(p.rivalidades) && p.rivalidades.length > 0) {
                    p.rivalidades.forEach(rivalId => {
                        const checkbox = document.querySelector(`input[name="rivalidades-edit"][value="${rivalId}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }

                if (p.redes_sociales && Array.isArray(p.redes_sociales) && p.redes_sociales.length > 0) {
                    p.redes_sociales.forEach(redId => {
                        const checkbox = document.querySelector(`input[name="redes_sociales-edit"][value="${redId}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            }, 1000);
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
                option.textContent = `${direccion.calle} ${direccion.numero || ''}, ${direccion.colonia || ''}`.trim();
                direccionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
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
                <span class="text-sm md:text-base text-slate-950">${falta.nombre || falta.falta || `Falta ${falta.id_falta}`}</span>
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
            // No mostrar la pandilla actual como rival
            if (pandilla.id_pandilla === parseInt(currentEditId)) return;

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
    let peligrosidadString = 'Alto';
    if (peligrosidad === '1') {
        peligrosidadString = 'Bajo';
    } else if (peligrosidad === '2') {
        peligrosidadString = 'Medio';
    } else if (peligrosidad === '3') {
        peligrosidadString = 'Alto';
    }

    // Recopilar datos del formulario
    const formData = {
        id_pandilla: parseInt(currentEditId),
        nombre: nombre,
        descripcion: document.getElementById('descripcion-pandilla-edit').value.trim(),
        lider: document.getElementById('lider-pandilla-edit').value.trim(),
        numero_integrantes: document.getElementById('numero-integrantes-pandilla-edit').value ? parseInt(document.getElementById('numero-integrantes-pandilla-edit').value) : null,
        edades_aproximadas: document.getElementById('edades-aproximadas-pandilla-edit').value ? parseFloat(document.getElementById('edades-aproximadas-pandilla-edit').value) : null,
        horario_reunion: document.getElementById('horario-reunion-pandilla-edit').value.trim(),
        peligrosidad: peligrosidadString,
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

            setTimeout(() => {
                closeModalEditarPandilla();
                // Recargar la lista de registros
                loadRegistrosForEdit('pandillas');
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

        // Limpiar preview de imágenes anteriores
        const previewContainer = document.getElementById('imagenes-preview-edit-container');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }

        // Limpiar input de imágenes
        const imagenesInput = document.getElementById('imagenes-integrante-edit');
        if (imagenesInput) {
            imagenesInput.value = '';
            // Agregar event listener para preview si no existe
            if (!imagenesInput.hasAttribute('data-listener-added')) {
                imagenesInput.addEventListener('change', previewImagenesIntegranteEdit);
                imagenesInput.setAttribute('data-listener-added', 'true');
            }
        }

        // Cargar datos necesarios
        await loadPandillasForEditIntegrante();
        await loadDireccionesForEditIntegrante();
        await loadDelitosForEditIntegrante();
        await loadFaltasForEditIntegrante();
        await loadRedesSocialesForEditIntegrante();
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

        // Limpiar preview de imágenes
        const previewContainer = document.getElementById('imagenes-preview-edit-container');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }

        // Limpiar input de imágenes
        const imagenesInput = document.getElementById('imagenes-integrante-edit');
        if (imagenesInput) {
            imagenesInput.value = '';
        }

        currentEditId = null;
    }
}

async function loadDelitosForEditIntegrante() {
    try {
        const response = await fetch('http://localhost:8000/api/crimes/');
        if (!response.ok) throw new Error('Error al cargar delitos');
        const crimes = await response.json();

        const delitosContainer = document.getElementById('delitos-integrante-edit-container');
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
                <input type="checkbox" name="delitos_integrante-edit" value="${crime.id}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${crime.nombre}</span>
            `;
            delitosContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar delitos:', error);
    }
}

async function loadFaltasForEditIntegrante() {
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

        const faltasContainer = document.getElementById('faltas-integrante-edit-container');
        if (!faltasContainer) return;

        faltasContainer.innerHTML = '';
        const faltas = data.faltas || (data.success ? [] : []);
        if (!data.success || faltas.length === 0) {
            faltasContainer.innerHTML = '<p class="text-slate-500 text-sm">No hay faltas disponibles</p>';
            return;
        }

        faltas.forEach(falta => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
            label.innerHTML = `
                <input type="checkbox" name="faltas_integrante-edit" value="${falta.id_falta}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${falta.falta || falta.nombre || `Falta ${falta.id_falta}`}</span>
            `;
            faltasContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar faltas:', error);
    }
}

async function loadRedesSocialesForEditIntegrante() {
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

        const redesContainer = document.getElementById('redes-sociales-integrante-edit-container');
        if (!redesContainer) return;

        redesContainer.innerHTML = '';
        const redes = data.redes_sociales || (data.success ? [] : []);
        if (!data.success || redes.length === 0) {
            redesContainer.innerHTML = '<p class="text-slate-500 text-sm">No hay redes sociales disponibles</p>';
            return;
        }

        redes.forEach(red => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
            const displayText = `${red.plataforma}${red.handle ? ': ' + red.handle : ' (Sin handle)'}`;
            label.innerHTML = `
                <input type="checkbox" name="redes_sociales_integrante-edit" value="${red.id_red_social}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                <span class="text-sm md:text-base text-slate-950">${displayText}</span>
            `;
            redesContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar redes sociales:', error);
        const redesContainer = document.getElementById('redes-sociales-integrante-edit-container');
        if (redesContainer) {
            redesContainer.innerHTML = '<p class="text-red-500 text-sm">Error al cargar redes sociales</p>';
        }
    }
}

async function loadIntegranteData(integranteId) {
    const errorElement = document.getElementById('error-message-editar-integrante');
    const successElement = document.getElementById('success-message-editar-integrante');

    // Limpiar mensajes anteriores
    if (errorElement) {
        errorElement.classList.add('hidden');
        errorElement.textContent = '';
    }
    if (successElement) {
        successElement.classList.add('hidden');
    }

    try {
        // Validar ID
        if (!integranteId || integranteId === '') {
            throw new Error('ID de integrante no válido');
        }

        // Convertir a número si es string
        const id = parseInt(integranteId, 10);
        if (isNaN(id)) {
            throw new Error(`ID de integrante inválido: ${integranteId}`);
        }

        // Obtener token
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            throw new Error('No estás autenticado. Por favor, inicia sesión.');
        }

        // Hacer petición
        const response = await fetch(`http://localhost:8000/api/integrantes/${id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // Manejar errores HTTP
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`El integrante con ID ${id} no existe en la base de datos.`);
            }
            throw new Error(data.message || `Error ${response.status}: No se pudo cargar el integrante`);
        }

        // Validar respuesta
        if (!data.success || !data.integrante) {
            throw new Error(data.message || 'Error: Respuesta inválida del servidor');
        }

        const integrante = data.integrante;

        // Llenar campos del formulario
        const setValue = (id, value) => {
            const field = document.getElementById(id);
            if (field) field.value = value || '';
        };

        setValue('id-integrante-edit', integrante.id_integrante);
        setValue('nombre-integrante-edit', integrante.nombre);
        setValue('apellido-paterno-integrante-edit', integrante.apellido_paterno);
        setValue('apellido-materno-integrante-edit', integrante.apellido_materno);
        setValue('alias-integrante-edit', integrante.alias);

        // Formatear fecha
        if (integrante.fecha_nacimiento) {
            try {
                const fecha = new Date(integrante.fecha_nacimiento);
                if (!isNaN(fecha.getTime())) {
                    setValue('fecha-nacimiento-integrante-edit', fecha.toISOString().split('T')[0]);
                }
            } catch (e) {
                console.warn('Error al formatear fecha:', e);
            }
        }

        // Seleccionar pandilla y dirección (esperar a que se carguen los selectores)
        setTimeout(() => {
            const pandillaSelect = document.getElementById('pandilla-integrante-edit');
            const direccionSelect = document.getElementById('direccion-integrante-edit');

            if (pandillaSelect && integrante.id_pandilla) {
                pandillaSelect.value = integrante.id_pandilla;
            } else if (pandillaSelect) {
                pandillaSelect.value = '';
            }

            if (direccionSelect && integrante.id_direccion) {
                direccionSelect.value = integrante.id_direccion;
            } else if (direccionSelect) {
                direccionSelect.value = '';
            }
        }, 1000);

        // Marcar delitos, faltas y redes sociales seleccionadas
        setTimeout(() => {
            // Desmarcar todos primero
            document.querySelectorAll('input[name="delitos_integrante-edit"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('input[name="faltas_integrante-edit"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('input[name="redes_sociales_integrante-edit"]').forEach(cb => cb.checked = false);

            // Marcar los seleccionados
            if (integrante.delitos && Array.isArray(integrante.delitos) && integrante.delitos.length > 0) {
                integrante.delitos.forEach(delitoId => {
                    const checkbox = document.querySelector(`input[name="delitos_integrante-edit"][value="${delitoId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            if (integrante.faltas && Array.isArray(integrante.faltas) && integrante.faltas.length > 0) {
                integrante.faltas.forEach(faltaId => {
                    const checkbox = document.querySelector(`input[name="faltas_integrante-edit"][value="${faltaId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            if (integrante.redes_sociales && Array.isArray(integrante.redes_sociales) && integrante.redes_sociales.length > 0) {
                integrante.redes_sociales.forEach(redId => {
                    const checkbox = document.querySelector(`input[name="redes_sociales_integrante-edit"][value="${redId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }, 1000);

        // Mostrar imágenes
        const container = document.getElementById('imagenes-actuales-integrante-edit');
        if (container) {
            container.innerHTML = '';
            if (integrante.imagenes && Array.isArray(integrante.imagenes) && integrante.imagenes.length > 0) {
                integrante.imagenes.forEach(img => {
                    if (img && img.url_imagen) {
                        const div = document.createElement('div');
                        div.className = 'relative';
                        const imgUrl = img.url_imagen.startsWith('http')
                            ? img.url_imagen
                            : `http://localhost:8000/${img.url_imagen}`;
                        div.innerHTML = `
                            <img src="${imgUrl}" alt="Imagen" class="w-full h-full object-cover rounded-lg" 
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3C/svg%3E'">
                        `;
                        container.appendChild(div);
                    }
                });
            } else {
                container.innerHTML = '<p class="text-slate-500 text-sm">No hay imágenes registradas</p>';
            }
        }

    } catch (error) {
        console.error('Error al cargar integrante:', error);
        if (errorElement) {
            errorElement.textContent = error.message || 'Error al cargar los datos del integrante';
            errorElement.classList.remove('hidden');
        }

        // Si es un error 404, cerrar el modal después de 3 segundos
        if (error.message && error.message.includes('no existe')) {
            setTimeout(() => {
                closeModalEditarIntegrante();
            }, 3000);
        }
    }
}

async function loadPandillasForEditIntegrante() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();

        const select = document.getElementById('pandilla-integrante-edit');
        if (select && data.success) {
            select.innerHTML = '<option value="">Ninguna</option>';
            if (data.pandillas && Array.isArray(data.pandillas)) {
                data.pandillas.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id_pandilla;
                    option.textContent = p.nombre;
                    select.appendChild(option);
                });
            }
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

        if (!response.ok) throw new Error('Error al cargar direcciones');
        const data = await response.json();

        const select = document.getElementById('direccion-integrante-edit');
        if (select && data.success) {
            select.innerHTML = '<option value="">Ninguna</option>';
            if (data.direcciones && Array.isArray(data.direcciones)) {
                data.direcciones.forEach(d => {
                    const option = document.createElement('option');
                    option.value = d.id_direccion;
                    option.textContent = `${d.calle} ${d.numero || ''}, ${d.colonia || ''}`.trim();
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
    }
}

// Función para previsualizar imágenes seleccionadas en el formulario de edición
function previewImagenesIntegranteEdit() {
    const input = document.getElementById('imagenes-integrante-edit');
    const previewContainer = document.getElementById('imagenes-preview-edit-container');

    if (!input || !previewContainer) return;

    previewContainer.innerHTML = '';

    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
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
                    removeBtn.addEventListener('click', function () {
                        const indexToRemove = parseInt(this.getAttribute('data-index'));
                        removeImagenPreviewEdit(indexToRemove);
                    });
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

// Función para remover imagen del preview en el formulario de edición
function removeImagenPreviewEdit(index) {
    const input = document.getElementById('imagenes-integrante-edit');
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
    previewImagenesIntegranteEdit();
}

async function submitEditarIntegranteForm(e) {
    e.preventDefault();

    if (!currentEditId) {
        document.getElementById('error-message-editar-integrante').textContent = 'No se ha seleccionado un integrante para editar';
        document.getElementById('error-message-editar-integrante').classList.remove('hidden');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-integrante').textContent = 'No estás autenticado';
        document.getElementById('error-message-editar-integrante').classList.remove('hidden');
        return;
    }

    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre-integrante-edit').value.trim());
    formData.append('apellido_paterno', document.getElementById('apellido-paterno-integrante-edit').value.trim());
    formData.append('apellido_materno', document.getElementById('apellido-materno-integrante-edit').value.trim());
    formData.append('alias', document.getElementById('alias-integrante-edit').value.trim());
    formData.append('fecha_nacimiento', document.getElementById('fecha-nacimiento-integrante-edit').value || '');

    const pandillaValue = document.getElementById('pandilla-integrante-edit').value;
    if (pandillaValue) {
        formData.append('id_pandilla', pandillaValue);
    }

    const direccionValue = document.getElementById('direccion-integrante-edit').value;
    if (direccionValue) {
        formData.append('id_direccion', direccionValue);
    }

    // Agregar imágenes si hay alguna seleccionada
    const imagenesInput = document.getElementById('imagenes-integrante-edit');
    if (imagenesInput && imagenesInput.files && imagenesInput.files.length > 0) {
        Array.from(imagenesInput.files).forEach((file) => {
            formData.append('imagenes', file);
        });
        console.log(`📸 Agregando ${imagenesInput.files.length} imagen(es) al formulario`);
    } else {
        console.log('ℹ️ No hay imágenes nuevas para agregar');
    }

    // Agregar delitos seleccionados
    const delitosCheckboxes = document.querySelectorAll('input[name="delitos_integrante-edit"]:checked');
    delitosCheckboxes.forEach(checkbox => {
        formData.append('delitos', checkbox.value);
    });

    // Agregar faltas seleccionadas
    const faltasCheckboxes = document.querySelectorAll('input[name="faltas_integrante-edit"]:checked');
    faltasCheckboxes.forEach(checkbox => {
        formData.append('faltas', checkbox.value);
    });

    // Agregar redes sociales seleccionadas
    const redesCheckboxes = document.querySelectorAll('input[name="redes_sociales_integrante-edit"]:checked');
    redesCheckboxes.forEach(checkbox => {
        formData.append('redes_sociales', checkbox.value);
    });

    // Limpiar mensajes previos
    document.getElementById('error-message-editar-integrante').classList.add('hidden');
    document.getElementById('success-message-editar-integrante').classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:8000/api/integrantes/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`
                // NO incluir Content-Type para FormData, el navegador lo hace automáticamente
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('success-message-editar-integrante').textContent = 'Integrante actualizado correctamente';
            document.getElementById('success-message-editar-integrante').classList.remove('hidden');
            setTimeout(() => {
                closeModalEditarIntegrante();
                loadRegistrosForEdit('integrantes');
            }, 2000);
        } else {
            document.getElementById('error-message-editar-integrante').textContent = data.message || 'Error al actualizar';
            document.getElementById('error-message-editar-integrante').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al actualizar integrante:', error);
        document.getElementById('error-message-editar-integrante').textContent = `Error de conexión: ${error.message}`;
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

        // Cargar datos necesarios para los selectores
        await loadPandillasForEditEvento();
        await loadDireccionesForEditEvento();
        await loadEventoData(eventoId);
    }
}

function closeModalEditarEvento() {
    const modal = document.getElementById('modal-editar-evento');
    if (modal) {
        modal.close();
        document.body.classList.remove('modal-open');
        document.getElementById('form-editar-evento').reset();
        document.getElementById('error-message-editar-evento').classList.add('hidden');
        document.getElementById('success-message-editar-evento').classList.remove('hidden');
        currentEditId = null;
    }
}

async function loadEventoData(eventoId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
            document.getElementById('error-message-editar-evento').textContent = 'No estás autenticado';
            document.getElementById('error-message-editar-evento').classList.remove('hidden');
            return;
        }

        const response = await fetch(`http://localhost:8000/api/eventos/${eventoId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al cargar el evento');
        }

        const data = await response.json();

        if (data.success && data.evento) {
            const e = data.evento;
            document.getElementById('id-evento-edit').value = e.id_evento;
            document.getElementById('tipo-evento-edit').value = e.tipo || 'riña';

            // Formatear fecha para el input type="date"
            if (e.fecha) {
                const fecha = new Date(e.fecha);
                const fechaFormateada = fecha.toISOString().split('T')[0];
                document.getElementById('fecha-evento-edit').value = fechaFormateada;
            }

            // Formatear hora para el input type="time"
            if (e.hora) {
                const hora = e.hora.split(':');
                if (hora.length >= 2) {
                    document.getElementById('hora-evento-edit').value = `${hora[0]}:${hora[1]}`;
                }
            }

            document.getElementById('descripcion-evento-edit').value = e.descripcion || '';

            // Manejar delito/falta según el tipo
            const tipoSelect = document.getElementById('tipo-evento-edit');
            const delitoFaltaContainer = document.getElementById('delito-falta-container-edit');
            const delitoFaltaLabel = document.getElementById('delito-falta-label-edit');
            const delitoFaltaSelect = document.getElementById('delito-falta-select-edit');

            if (e.tipo === 'delito' && e.id_delito) {
                delitoFaltaContainer.classList.remove('hidden');
                delitoFaltaLabel.textContent = 'Delito:';
                await loadDelitosForEditEvento();
                setTimeout(() => {
                    if (delitoFaltaSelect) delitoFaltaSelect.value = e.id_delito;
                }, 500);
            } else if (e.tipo === 'falta' && e.id_falta) {
                delitoFaltaContainer.classList.remove('hidden');
                delitoFaltaLabel.textContent = 'Falta:';
                await loadFaltasForEditEvento();
                // Esperar a que las opciones estén completamente cargadas
                setTimeout(() => {
                    if (delitoFaltaSelect) {
                        // Convertir el ID a string para que coincida con el valor de la opción
                        const faltaIdStr = String(e.id_falta);
                        // Verificar que la opción existe antes de establecer el valor
                        const optionExists = Array.from(delitoFaltaSelect.options).some(opt => opt.value === faltaIdStr);
                        if (optionExists) {
                            delitoFaltaSelect.value = faltaIdStr;
                        } else {
                            // Si la opción no existe, esperar un poco más y reintentar
                            setTimeout(() => {
                                if (delitoFaltaSelect) {
                                    delitoFaltaSelect.value = faltaIdStr;
                                }
                            }, 500);
                        }
                    }
                }, 800);
            } else {
                delitoFaltaContainer.classList.add('hidden');
            }

            // Cargar integrantes después de cargar pandillas
            setTimeout(async () => {
                if (e.id_pandilla) {
                    const pandillaSelect = document.getElementById('pandilla-evento-edit');
                    if (pandillaSelect) {
                        pandillaSelect.value = e.id_pandilla;
                        await loadIntegrantesForEditEvento(e.id_pandilla);
                        setTimeout(() => {
                            if (e.id_integrante) {
                                const integranteSelect = document.getElementById('integrante-evento-edit');
                                if (integranteSelect) integranteSelect.value = e.id_integrante;
                            }
                        }, 500);
                    }
                } else {
                    await loadIntegrantesForEditEvento();
                }

                if (e.id_direccion) {
                    const direccionSelect = document.getElementById('direccion-evento-edit');
                    if (direccionSelect) direccionSelect.value = e.id_direccion;
                }
            }, 500);
        } else {
            document.getElementById('error-message-editar-evento').textContent = 'Error al cargar los datos del evento';
            document.getElementById('error-message-editar-evento').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al cargar evento:', error);
        document.getElementById('error-message-editar-evento').textContent = 'Error al cargar los datos del evento';
        document.getElementById('error-message-editar-evento').classList.remove('hidden');
    }
}

async function loadPandillasForEditEvento() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();

        const select = document.getElementById('pandilla-evento-edit');
        if (select && data.success) {
            select.innerHTML = '<option value="">Ninguna</option>';
            if (data.pandillas && Array.isArray(data.pandillas)) {
                data.pandillas.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id_pandilla;
                    option.textContent = p.nombre;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar pandillas:', error);
    }
}

async function loadIntegrantesForEditEvento(idPandilla = null) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/integrantes/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar integrantes');
        const data = await response.json();

        const select = document.getElementById('integrante-evento-edit');
        if (!select) return;

        let integrantes = data.success && data.integrantes ? data.integrantes : [];
        if (idPandilla) {
            integrantes = integrantes.filter(i => i.id_pandilla && i.id_pandilla === parseInt(idPandilla));
        }

        select.innerHTML = '<option value="">Ninguno</option>';
        integrantes.forEach(integrante => {
            const option = document.createElement('option');
            option.value = integrante.id_integrante;
            let nombreCompleto = integrante.nombre || '';
            if (integrante.apellido_paterno) nombreCompleto += ` ${integrante.apellido_paterno}`;
            if (integrante.apellido_materno) nombreCompleto += ` ${integrante.apellido_materno}`;
            if (integrante.alias) nombreCompleto += ` (${integrante.alias})`;
            option.textContent = nombreCompleto;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar integrantes:', error);
    }
}

async function loadDireccionesForEditEvento() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/direcciones/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar direcciones');
        const data = await response.json();

        const select = document.getElementById('direccion-evento-edit');
        if (select && data.success) {
            select.innerHTML = '<option value="">Ninguna</option>';
            if (data.direcciones && Array.isArray(data.direcciones)) {
                data.direcciones.forEach(d => {
                    const option = document.createElement('option');
                    option.value = d.id_direccion;
                    option.textContent = `${d.calle} ${d.numero || ''}, ${d.colonia || ''}`.trim();
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
    }
}

async function loadDelitosForEditEvento() {
    try {
        const response = await fetch('http://localhost:8000/api/crimes/');
        if (!response.ok) throw new Error('Error al cargar delitos');
        const crimes = await response.json();

        const select = document.getElementById('delito-falta-select-edit');
        if (select) {
            select.innerHTML = '<option value="">Ninguno</option>';
            if (Array.isArray(crimes)) {
                crimes.forEach(crime => {
                    const option = document.createElement('option');
                    option.value = crime.id;
                    option.textContent = crime.nombre;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar delitos:', error);
    }
}

async function loadFaltasForEditEvento() {
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

        const select = document.getElementById('delito-falta-select-edit');
        if (select && data.success) {
            select.innerHTML = '<option value="">Ninguna</option>';
            if (data.faltas && Array.isArray(data.faltas)) {
                data.faltas.forEach(falta => {
                    const option = document.createElement('option');
                    // Asegurar que el valor sea string para que coincida correctamente
                    option.value = String(falta.id_falta);
                    // Usar el nombre de la falta (columna 'falta')
                    option.textContent = falta.falta || falta.nombre || `Falta ${falta.id_falta}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar faltas:', error);
        const select = document.getElementById('delito-falta-select-edit');
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Error al cargar faltas</option>';
        }
    }
}

// Manejar cambio de tipo de evento en edición
function handleTipoEventoEditChange() {
    const tipoSelect = document.getElementById('tipo-evento-edit');
    const delitoFaltaContainer = document.getElementById('delito-falta-container-edit');
    const delitoFaltaLabel = document.getElementById('delito-falta-label-edit');
    const delitoFaltaSelect = document.getElementById('delito-falta-select-edit');

    if (!tipoSelect || !delitoFaltaContainer) return;

    const tipo = tipoSelect.value;

    if (tipo === 'delito') {
        delitoFaltaContainer.classList.remove('hidden');
        delitoFaltaLabel.textContent = 'Delito:';
        loadDelitosForEditEvento();
        delitoFaltaSelect.value = '';
    } else if (tipo === 'falta') {
        delitoFaltaContainer.classList.remove('hidden');
        delitoFaltaLabel.textContent = 'Falta:';
        loadFaltasForEditEvento();
        delitoFaltaSelect.value = '';
    } else {
        delitoFaltaContainer.classList.add('hidden');
        delitoFaltaSelect.value = '';
    }
}

// Manejar cambio de pandilla en eventos (edición)
async function handlePandillaEventoEditChange() {
    const pandillaSelect = document.getElementById('pandilla-evento-edit');
    if (!pandillaSelect) return;

    const idPandilla = pandillaSelect.value;
    await loadIntegrantesForEditEvento(idPandilla || null);
}

async function submitEditarEventoForm(e) {
    e.preventDefault();

    if (!currentEditId) {
        document.getElementById('error-message-editar-evento').textContent = 'No se ha seleccionado un evento para editar';
        document.getElementById('error-message-editar-evento').classList.remove('hidden');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-evento').textContent = 'No estás autenticado';
        document.getElementById('error-message-editar-evento').classList.remove('hidden');
        return;
    }

    const tipo = document.getElementById('tipo-evento-edit').value;
    const fecha = document.getElementById('fecha-evento-edit').value;

    if (!tipo || !fecha) {
        document.getElementById('error-message-editar-evento').textContent = 'Tipo y fecha son requeridos';
        document.getElementById('error-message-editar-evento').classList.remove('hidden');
        return;
    }

    const delitoFaltaSelect = document.getElementById('delito-falta-select-edit');
    const formData = {
        tipo: tipo,
        fecha: fecha,
        hora: document.getElementById('hora-evento-edit').value || null,
        descripcion: document.getElementById('descripcion-evento-edit').value || '',
        id_delito: (tipo === 'delito' && delitoFaltaSelect && delitoFaltaSelect.value) ? parseInt(delitoFaltaSelect.value) : null,
        id_falta: (tipo === 'falta' && delitoFaltaSelect && delitoFaltaSelect.value) ? parseInt(delitoFaltaSelect.value) : null,
        id_pandilla: document.getElementById('pandilla-evento-edit').value ? parseInt(document.getElementById('pandilla-evento-edit').value) : null,
        id_integrante: document.getElementById('integrante-evento-edit').value ? parseInt(document.getElementById('integrante-evento-edit').value) : null,
        id_direccion: document.getElementById('direccion-evento-edit').value ? parseInt(document.getElementById('direccion-evento-edit').value) : null
    };

    // Limpiar mensajes previos
    document.getElementById('error-message-editar-evento').classList.add('hidden');
    document.getElementById('success-message-editar-evento').classList.add('hidden');

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
            setTimeout(() => {
                closeModalEditarEvento();
                loadRegistrosForEdit('eventos');
            }, 2000);
        } else {
            document.getElementById('error-message-editar-evento').textContent = data.message || 'Error al actualizar';
            document.getElementById('error-message-editar-evento').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-editar-evento').textContent = 'Error de conexión';
        document.getElementById('error-message-editar-evento').classList.remove('hidden');
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
        document.getElementById('error-message-editar-delito').classList.add('hidden');
        document.getElementById('success-message-editar-delito').classList.add('hidden');
        currentEditId = null;
    }
}

async function loadDelitoData(delitoId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/delitos/${delitoId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar el delito');
        const data = await response.json();

        if (data.success && data.delito) {
            document.getElementById('id-delito-edit').value = data.delito.id_delito;
            document.getElementById('nombre-delito-edit').value = data.delito.nombre || '';
        }
    } catch (error) {
        console.error('Error al cargar delito:', error);
        document.getElementById('error-message-editar-delito').textContent = 'Error al cargar el delito';
        document.getElementById('error-message-editar-delito').classList.remove('hidden');
    }
}

async function submitEditarDelitoForm(e) {
    e.preventDefault();

    if (!currentEditId) {
        document.getElementById('error-message-editar-delito').textContent = 'No se ha seleccionado un delito para editar';
        document.getElementById('error-message-editar-delito').classList.remove('hidden');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-delito').textContent = 'No estás autenticado';
        document.getElementById('error-message-editar-delito').classList.remove('hidden');
        return;
    }

    const nombre = document.getElementById('nombre-delito-edit').value.trim();
    if (!nombre) {
        document.getElementById('error-message-editar-delito').textContent = 'El nombre es requerido';
        document.getElementById('error-message-editar-delito').classList.remove('hidden');
        return;
    }

    // Limpiar mensajes previos
    document.getElementById('error-message-editar-delito').classList.add('hidden');
    document.getElementById('success-message-editar-delito').classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:8000/api/delitos/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nombre })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('success-message-editar-delito').textContent = 'Delito actualizado correctamente';
            document.getElementById('success-message-editar-delito').classList.remove('hidden');
            setTimeout(() => {
                closeModalEditarDelito();
                loadRegistrosForEdit('delitos');
            }, 2000);
        } else {
            document.getElementById('error-message-editar-delito').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-delito').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-editar-delito').textContent = 'Error de conexión';
        document.getElementById('error-message-editar-delito').classList.remove('hidden');
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
        document.getElementById('error-message-editar-falta').classList.add('hidden');
        document.getElementById('success-message-editar-falta').classList.add('hidden');
        currentEditId = null;
    }
}

async function loadFaltaData(faltaId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/faltas/${faltaId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar la falta');
        const data = await response.json();

        if (data.success && data.falta) {
            document.getElementById('id-falta-edit').value = data.falta.id_falta;
            // Usar el campo 'falta' en lugar de 'nombre'
            document.getElementById('nombre-falta-edit').value = data.falta.falta || data.falta.nombre || '';
        }
    } catch (error) {
        console.error('Error al cargar falta:', error);
        document.getElementById('error-message-editar-falta').textContent = 'Error al cargar la falta';
        document.getElementById('error-message-editar-falta').classList.remove('hidden');
    }
}

async function submitEditarFaltaForm(e) {
    e.preventDefault();

    if (!currentEditId) {
        document.getElementById('error-message-editar-falta').textContent = 'No se ha seleccionado una falta para editar';
        document.getElementById('error-message-editar-falta').classList.remove('hidden');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-falta').textContent = 'No estás autenticado';
        document.getElementById('error-message-editar-falta').classList.remove('hidden');
        return;
    }

    const nombre = document.getElementById('nombre-falta-edit').value.trim();
    if (!nombre) {
        document.getElementById('error-message-editar-falta').textContent = 'El nombre es requerido';
        document.getElementById('error-message-editar-falta').classList.remove('hidden');
        return;
    }

    // Limpiar mensajes previos
    document.getElementById('error-message-editar-falta').classList.add('hidden');
    document.getElementById('success-message-editar-falta').classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:8000/api/faltas/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nombre })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('success-message-editar-falta').textContent = 'Falta actualizada correctamente';
            document.getElementById('success-message-editar-falta').classList.remove('hidden');
            setTimeout(() => {
                closeModalEditarFalta();
                loadRegistrosForEdit('faltas');
            }, 2000);
        } else {
            document.getElementById('error-message-editar-falta').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-falta').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-editar-falta').textContent = 'Error de conexión';
        document.getElementById('error-message-editar-falta').classList.remove('hidden');
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
        document.getElementById('error-message-editar-direccion').classList.add('hidden');
        document.getElementById('success-message-editar-direccion').classList.add('hidden');
        currentEditId = null;
    }
}

async function loadDireccionData(direccionId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/direcciones/${direccionId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar la dirección');
        const data = await response.json();

        if (data.success && data.direccion) {
            const d = data.direccion;
            document.getElementById('id-direccion-edit').value = d.id_direccion;
            document.getElementById('calle-direccion-edit').value = d.calle || '';
            document.getElementById('numero-direccion-edit').value = d.numero || '';
            document.getElementById('colonia-direccion-edit').value = d.colonia || '';
            document.getElementById('codigo-postal-direccion-edit').value = d.codigo_postal || '';
            document.getElementById('latitud-direccion-edit').value = d.latitud || '';
            document.getElementById('longitud-direccion-edit').value = d.longitud || '';
        }
    } catch (error) {
        console.error('Error al cargar dirección:', error);
        document.getElementById('error-message-editar-direccion').textContent = 'Error al cargar la dirección';
        document.getElementById('error-message-editar-direccion').classList.remove('hidden');
    }
}

async function submitEditarDireccionForm(e) {
    e.preventDefault();

    if (!currentEditId) {
        document.getElementById('error-message-editar-direccion').textContent = 'No se ha seleccionado una dirección para editar';
        document.getElementById('error-message-editar-direccion').classList.remove('hidden');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-direccion').textContent = 'No estás autenticado';
        document.getElementById('error-message-editar-direccion').classList.remove('hidden');
        return;
    }

    const calle = document.getElementById('calle-direccion-edit').value.trim();
    const latitud = parseFloat(document.getElementById('latitud-direccion-edit').value);
    const longitud = parseFloat(document.getElementById('longitud-direccion-edit').value);

    if (!calle || isNaN(latitud) || isNaN(longitud)) {
        document.getElementById('error-message-editar-direccion').textContent = 'Calle, latitud y longitud son requeridos';
        document.getElementById('error-message-editar-direccion').classList.remove('hidden');
        return;
    }

    // Limpiar mensajes previos
    document.getElementById('error-message-editar-direccion').classList.add('hidden');
    document.getElementById('success-message-editar-direccion').classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:8000/api/direcciones/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                calle: calle,
                numero: document.getElementById('numero-direccion-edit').value.trim(),
                colonia: document.getElementById('colonia-direccion-edit').value.trim(),
                codigo_postal: document.getElementById('codigo-postal-direccion-edit').value.trim(),
                latitud: latitud,
                longitud: longitud
            })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('success-message-editar-direccion').textContent = 'Dirección actualizada correctamente';
            document.getElementById('success-message-editar-direccion').classList.remove('hidden');
            setTimeout(() => {
                closeModalEditarDireccion();
                loadRegistrosForEdit('direcciones');
            }, 2000);
        } else {
            document.getElementById('error-message-editar-direccion').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-direccion').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-editar-direccion').textContent = 'Error de conexión';
        document.getElementById('error-message-editar-direccion').classList.remove('hidden');
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
        document.getElementById('error-message-editar-rivalidad').classList.add('hidden');
        document.getElementById('success-message-editar-rivalidad').classList.add('hidden');
        currentEditId = null;
    }
}

async function loadPandillasForEditRivalidad() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();

        const select1 = document.getElementById('pandilla-1-rivalidad-edit');
        const select2 = document.getElementById('pandilla-2-rivalidad-edit');

        if (data.success && data.pandillas) {
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

        if (!response.ok) throw new Error('Error al cargar la rivalidad');
        const data = await response.json();

        if (data.success && data.rivalidad) {
            document.getElementById('id-rivalidad-edit').value = data.rivalidad.id_rivalidad;
            setTimeout(() => {
                document.getElementById('pandilla-1-rivalidad-edit').value = data.rivalidad.id_pandilla;
                document.getElementById('pandilla-2-rivalidad-edit').value = data.rivalidad.id_pandilla_rival;
            }, 500);
        }
    } catch (error) {
        console.error('Error al cargar rivalidad:', error);
        document.getElementById('error-message-editar-rivalidad').textContent = 'Error al cargar la rivalidad';
        document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
    }
}

async function submitEditarRivalidadForm(e) {
    e.preventDefault();

    if (!currentEditId) {
        document.getElementById('error-message-editar-rivalidad').textContent = 'No se ha seleccionado una rivalidad para editar';
        document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-rivalidad').textContent = 'No estás autenticado';
        document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
        return;
    }

    const idPandilla = document.getElementById('pandilla-1-rivalidad-edit').value;
    const idPandillaRival = document.getElementById('pandilla-2-rivalidad-edit').value;

    if (!idPandilla || !idPandillaRival) {
        document.getElementById('error-message-editar-rivalidad').textContent = 'Ambas pandillas son requeridas';
        document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
        return;
    }

    if (idPandilla === idPandillaRival) {
        document.getElementById('error-message-editar-rivalidad').textContent = 'Las pandillas deben ser diferentes';
        document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
        return;
    }

    // Limpiar mensajes previos
    document.getElementById('error-message-editar-rivalidad').classList.add('hidden');
    document.getElementById('success-message-editar-rivalidad').classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:8000/api/rivalidades/${currentEditId}/update/`, {
            method: 'PUT',
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

        if (data.success) {
            document.getElementById('success-message-editar-rivalidad').textContent = 'Rivalidad actualizada correctamente';
            document.getElementById('success-message-editar-rivalidad').classList.remove('hidden');
            setTimeout(() => {
                closeModalEditarRivalidad();
                loadRegistrosForEdit('rivalidades');
            }, 2000);
        } else {
            document.getElementById('error-message-editar-rivalidad').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-editar-rivalidad').textContent = 'Error de conexión';
        document.getElementById('error-message-editar-rivalidad').classList.remove('hidden');
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
        document.getElementById('error-message-editar-red-social').classList.add('hidden');
        document.getElementById('success-message-editar-red-social').classList.add('hidden');
        currentEditId = null;
    }
}

async function loadRedSocialData(redSocialId) {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        const response = await fetch(`http://localhost:8000/api/redes-sociales/${redSocialId}/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar la red social');
        const data = await response.json();

        if (data.success && data.red_social) {
            const r = data.red_social;
            document.getElementById('id-red-social-edit').value = r.id_red_social;
            document.getElementById('plataforma-red-social-edit').value = r.plataforma || '';
            document.getElementById('handle-red-social-edit').value = r.handle || '';
            document.getElementById('url-red-social-edit').value = r.url || '';
        }
    } catch (error) {
        console.error('Error al cargar red social:', error);
        document.getElementById('error-message-editar-red-social').textContent = 'Error al cargar la red social';
        document.getElementById('error-message-editar-red-social').classList.remove('hidden');
    }
}

async function submitEditarRedSocialForm(e) {
    e.preventDefault();

    if (!currentEditId) {
        document.getElementById('error-message-editar-red-social').textContent = 'No se ha seleccionado una red social para editar';
        document.getElementById('error-message-editar-red-social').classList.remove('hidden');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        document.getElementById('error-message-editar-red-social').textContent = 'No estás autenticado';
        document.getElementById('error-message-editar-red-social').classList.remove('hidden');
        return;
    }

    const plataforma = document.getElementById('plataforma-red-social-edit').value;
    if (!plataforma) {
        document.getElementById('error-message-editar-red-social').textContent = 'La plataforma es requerida';
        document.getElementById('error-message-editar-red-social').classList.remove('hidden');
        return;
    }

    // Limpiar mensajes previos
    document.getElementById('error-message-editar-red-social').classList.add('hidden');
    document.getElementById('success-message-editar-red-social').classList.add('hidden');

    try {
        const response = await fetch(`http://localhost:8000/api/redes-sociales/${currentEditId}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plataforma: plataforma,
                handle: document.getElementById('handle-red-social-edit').value.trim(),
                url: document.getElementById('url-red-social-edit').value.trim()
            })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('success-message-editar-red-social').textContent = 'Red social actualizada correctamente';
            document.getElementById('success-message-editar-red-social').classList.remove('hidden');
            setTimeout(() => {
                closeModalEditarRedSocial();
                loadRegistrosForEdit('redes-sociales');
            }, 2000);
        } else {
            document.getElementById('error-message-editar-red-social').textContent = data.message || 'Error';
            document.getElementById('error-message-editar-red-social').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message-editar-red-social').textContent = 'Error de conexión';
        document.getElementById('error-message-editar-red-social').classList.remove('hidden');
    }
}

// ==================== FUNCIONES PARA ELIMINAR REGISTROS ====================

// Función para eliminar pandilla con confirmación
async function eliminarPandilla() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado una pandilla');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        // Primero verificar si tiene integrantes
        const checkResponse = await fetch(`http://localhost:8000/api/pandillas/${currentEditId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const pandillaData = await checkResponse.json();
        
        // Verificar número de integrantes
        const numIntegrantesResponse = await fetch(`http://localhost:8000/api/pandillas/${currentEditId}/integrantes-count/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const countData = await numIntegrantesResponse.json();
        const numIntegrantes = countData.count || 0;

        let eliminarIntegrantes = false;

        if (numIntegrantes > 0) {
            // Preguntar si quiere eliminar los integrantes también
            const respuesta = confirm(
                `⚠️ ADVERTENCIA: Esta pandilla tiene ${numIntegrantes} integrante(s) asociado(s).\n\n` +
                `Opciones:\n` +
                `- Haz clic en "Aceptar" para ELIMINAR la pandilla Y TODOS sus integrantes\n` +
                `- Haz clic en "Cancelar" para NO eliminar nada\n\n` +
                `¿Deseas eliminar la pandilla Y sus ${numIntegrantes} integrante(s)?`
            );

            if (!respuesta) {
                alert('Operación cancelada. No se eliminó nada.');
                return;
            }

            // Confirmación adicional para eliminar integrantes
            const confirmacionFinal = confirm(
                `🚨 ÚLTIMA CONFIRMACIÓN 🚨\n\n` +
                `Esto eliminará PERMANENTEMENTE:\n` +
                `- La pandilla "${pandillaData.nombre || ''}"\n` +
                `- ${numIntegrantes} integrante(s)\n` +
                `- Todas sus relaciones (delitos, faltas, rivalidades, redes sociales)\n\n` +
                `Esta acción NO se puede deshacer.\n\n` +
                `¿Estás completamente seguro?`
            );

            if (!confirmacionFinal) {
                alert('Operación cancelada. No se eliminó nada.');
                return;
            }

            eliminarIntegrantes = true;
        } else {
            // No tiene integrantes, confirmación simple
            const confirmacion = confirm(
                '¿Estás seguro de que deseas eliminar esta pandilla?\n\n' +
                'Esta acción eliminará:\n' +
                '- La pandilla\n' +
                '- Sus relaciones con delitos, faltas y rivalidades\n' +
                '- Sus redes sociales\n\n' +
                'Esta acción NO se puede deshacer.'
            );
            
            if (!confirmacion) return;
        }

        // Realizar la eliminación
        const response = await fetch(`http://localhost:8000/api/pandillas/${currentEditId}/delete/?eliminar_integrantes=${eliminarIntegrantes}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Pandilla eliminada correctamente');
            closeModalEditarPandilla();
            // Recargar lista de registros
            loadRegistrosForEdit('pandillas');
        } else {
            alert(data.message || 'Error al eliminar la pandilla');
        }
    } catch (error) {
        console.error('Error al eliminar pandilla:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para eliminar integrante con confirmación
async function eliminarIntegrante() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado un integrante');
        return;
    }

    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este integrante?\n\nEsta acción eliminará:\n- El integrante\n- Sus relaciones con delitos, faltas y redes sociales\n- Sus imágenes asociadas\n\nEsta acción NO se puede deshacer.');
    
    if (!confirmacion) return;

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/integrantes/${currentEditId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Integrante eliminado correctamente');
            closeModalEditarIntegrante();
            // Recargar lista de registros
            loadRegistrosForEdit('integrantes');
        } else {
            alert(data.message || 'Error al eliminar el integrante');
        }
    } catch (error) {
        console.error('Error al eliminar integrante:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para eliminar evento con confirmación
async function eliminarEvento() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado un evento');
        return;
    }

    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este evento?\n\nEsta acción NO se puede deshacer.');
    
    if (!confirmacion) return;

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/eventos/${currentEditId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Evento eliminado correctamente');
            closeModalEditarEvento();
            // Recargar lista de registros
            loadRegistrosForEdit('eventos');
        } else {
            alert(data.message || 'Error al eliminar el evento');
        }
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para eliminar delito con confirmación
async function eliminarDelito() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado un delito');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        // Primero verificar si tiene eventos asociados
        const checkResponse = await fetch(`http://localhost:8000/api/delitos/${currentEditId}/eventos-count/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const countData = await checkResponse.json();
        const numEventos = countData.count || 0;

        let eliminarEventos = false;

        if (numEventos > 0) {
            // Preguntar si quiere eliminar los eventos también
            const respuesta = confirm(
                `⚠️ ADVERTENCIA: Este delito tiene ${numEventos} evento(s) asociado(s).\n\n` +
                `Opciones:\n` +
                `- Haz clic en "Aceptar" para ELIMINAR el delito Y TODOS sus eventos\n` +
                `- Haz clic en "Cancelar" para NO eliminar nada\n\n` +
                `¿Deseas eliminar el delito Y sus ${numEventos} evento(s)?`
            );

            if (!respuesta) {
                alert('Operación cancelada. No se eliminó nada.');
                return;
            }

            // Confirmación adicional para eliminar eventos
            const confirmacionFinal = confirm(
                `🚨 ÚLTIMA CONFIRMACIÓN 🚨\n\n` +
                `Esto eliminará PERMANENTEMENTE:\n` +
                `- El delito\n` +
                `- ${numEventos} evento(s) asociado(s)\n` +
                `- Todas sus relaciones con pandillas e integrantes\n\n` +
                `Esta acción NO se puede deshacer.\n\n` +
                `¿Estás completamente seguro?`
            );

            if (!confirmacionFinal) {
                alert('Operación cancelada. No se eliminó nada.');
                return;
            }

            eliminarEventos = true;
        } else {
            // No tiene eventos, confirmación simple
            const confirmacion = confirm(
                '¿Estás seguro de que deseas eliminar este delito?\n\n' +
                'Esta acción eliminará sus relaciones con pandillas e integrantes.\n\n' +
                'Esta acción NO se puede deshacer.'
            );
            
            if (!confirmacion) return;
        }

        // Realizar la eliminación
        const response = await fetch(`http://localhost:8000/api/delitos/${currentEditId}/delete/?eliminar_eventos=${eliminarEventos}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Delito eliminado correctamente');
            closeModalEditarDelito();
            // Recargar lista de registros
            loadRegistrosForEdit('delitos');
        } else {
            alert(data.message || 'Error al eliminar el delito');
        }
    } catch (error) {
        console.error('Error al eliminar delito:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para eliminar falta con confirmación
async function eliminarFalta() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado una falta');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        // Primero verificar si tiene eventos asociados
        const checkResponse = await fetch(`http://localhost:8000/api/faltas/${currentEditId}/eventos-count/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const countData = await checkResponse.json();
        const numEventos = countData.count || 0;

        let eliminarEventos = false;

        if (numEventos > 0) {
            // Preguntar si quiere eliminar los eventos también
            const respuesta = confirm(
                `⚠️ ADVERTENCIA: Esta falta tiene ${numEventos} evento(s) asociado(s).\n\n` +
                `Opciones:\n` +
                `- Haz clic en "Aceptar" para ELIMINAR la falta Y TODOS sus eventos\n` +
                `- Haz clic en "Cancelar" para NO eliminar nada\n\n` +
                `¿Deseas eliminar la falta Y sus ${numEventos} evento(s)?`
            );

            if (!respuesta) {
                alert('Operación cancelada. No se eliminó nada.');
                return;
            }

            // Confirmación adicional para eliminar eventos
            const confirmacionFinal = confirm(
                `🚨 ÚLTIMA CONFIRMACIÓN 🚨\n\n` +
                `Esto eliminará PERMANENTEMENTE:\n` +
                `- La falta\n` +
                `- ${numEventos} evento(s) asociado(s)\n` +
                `- Todas sus relaciones con pandillas e integrantes\n\n` +
                `Esta acción NO se puede deshacer.\n\n` +
                `¿Estás completamente seguro?`
            );

            if (!confirmacionFinal) {
                alert('Operación cancelada. No se eliminó nada.');
                return;
            }

            eliminarEventos = true;
        } else {
            // No tiene eventos, confirmación simple
            const confirmacion = confirm(
                '¿Estás seguro de que deseas eliminar esta falta?\n\n' +
                'Esta acción eliminará sus relaciones con pandillas e integrantes.\n\n' +
                'Esta acción NO se puede deshacer.'
            );
            
            if (!confirmacion) return;
        }

        // Realizar la eliminación
        const response = await fetch(`http://localhost:8000/api/faltas/${currentEditId}/delete/?eliminar_eventos=${eliminarEventos}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Falta eliminada correctamente');
            closeModalEditarFalta();
            // Recargar lista de registros
            loadRegistrosForEdit('faltas');
        } else {
            alert(data.message || 'Error al eliminar la falta');
        }
    } catch (error) {
        console.error('Error al eliminar falta:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para eliminar dirección con confirmación
async function eliminarDireccion() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado una dirección');
        return;
    }

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        // Verificar si hay registros usando esta dirección
        const checkResponse = await fetch(`http://localhost:8000/api/direcciones/${currentEditId}/usage-count/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const usageData = await checkResponse.json();
        const numPandillas = usageData.pandillas || 0;
        const numIntegrantes = usageData.integrantes || 0;
        const numEventos = usageData.eventos || 0;
        const totalUsos = numPandillas + numIntegrantes + numEventos;

        if (totalUsos > 0) {
            // Mostrar mensaje pidiendo reasignación
            let mensaje = '⚠️ NO SE PUEDE ELIMINAR ESTA DIRECCIÓN\n\n';
            mensaje += `Esta dirección está siendo usada por:\n`;
            if (numPandillas > 0) mensaje += `- ${numPandillas} pandilla(s)\n`;
            if (numIntegrantes > 0) mensaje += `- ${numIntegrantes} integrante(s)\n`;
            if (numEventos > 0) mensaje += `- ${numEventos} evento(s)\n`;
            mensaje += `\n📋 PASOS A SEGUIR:\n`;
            mensaje += `1. Ve a "Editar Registro"\n`;
            mensaje += `2. Edita cada pandilla/integrante/evento que usa esta dirección\n`;
            mensaje += `3. Asígnales una dirección diferente\n`;
            mensaje += `4. Luego podrás eliminar esta dirección\n\n`;
            mensaje += `Total de registros usando esta dirección: ${totalUsos}`;
            
            alert(mensaje);
            return;
        }

        // No está en uso, permitir eliminación
        const confirmacion = confirm(
            '¿Estás seguro de que deseas eliminar esta dirección?\n\n' +
            'Esta dirección no está siendo usada por ningún registro.\n\n' +
            'Esta acción NO se puede deshacer.'
        );
        
        if (!confirmacion) return;

        // Realizar la eliminación
        const response = await fetch(`http://localhost:8000/api/direcciones/${currentEditId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Dirección eliminada correctamente');
            closeModalEditarDireccion();
            // Recargar lista de registros
            loadRegistrosForEdit('direcciones');
        } else {
            alert(data.message || 'Error al eliminar la dirección');
        }
    } catch (error) {
        console.error('Error al eliminar dirección:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para eliminar rivalidad con confirmación
async function eliminarRivalidad() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado una rivalidad');
        return;
    }

    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta rivalidad?\n\nEsta acción NO se puede deshacer.');
    
    if (!confirmacion) return;

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/rivalidades/${currentEditId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Rivalidad eliminada correctamente');
            closeModalEditarRivalidad();
            // Recargar lista de registros
            loadRegistrosForEdit('rivalidades');
        } else {
            alert(data.message || 'Error al eliminar la rivalidad');
        }
    } catch (error) {
        console.error('Error al eliminar rivalidad:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para eliminar red social con confirmación
async function eliminarRedSocial() {
    if (!currentEditId) {
        alert('Error: No se ha seleccionado una red social');
        return;
    }

    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta red social?\n\nEsta acción eliminará sus relaciones con pandillas e integrantes.\n\nEsta acción NO se puede deshacer.');
    
    if (!confirmacion) return;

    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
    if (!token) {
        alert('No estás autenticado');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/redes-sociales/${currentEditId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message || 'Red social eliminada correctamente');
            closeModalEditarRedSocial();
            // Recargar lista de registros
            loadRegistrosForEdit('redes-sociales');
        } else {
            alert(data.message || 'Error al eliminar la red social');
        }
    } catch (error) {
        console.error('Error al eliminar red social:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// ==================== FUNCIONES PARA NUEVA RED SOCIAL EN MODALES DE EDICIÓN ====================

// ========== FUNCIONES PARA PANDILLAS EDIT ==========

// Función para mostrar/ocultar formulario de nueva red social en modal de editar pandilla
function toggleFormNuevaRedSocialPandillaEdit() {
    const form = document.getElementById('form-nueva-red-social-pandilla-edit');
    if (form) {
        form.classList.toggle('hidden');
    }
}

// Función para cerrar formulario de nueva red social en modal de editar pandilla
function cerrarFormNuevaRedSocialPandillaEdit() {
    const form = document.getElementById('form-nueva-red-social-pandilla-edit');
    if (form) {
        form.classList.add('hidden');
        // Limpiar campos
        document.getElementById('nueva-plataforma-pandilla-edit').value = '';
        document.getElementById('nueva-handle-pandilla-edit').value = '';
        document.getElementById('nueva-url-pandilla-edit').value = '';
        const mensaje = document.getElementById('mensaje-red-social-pandilla-edit');
        if (mensaje) {
            mensaje.classList.add('hidden');
            mensaje.textContent = '';
        }
    }
}

// Función para guardar nueva red social desde modal de editar pandilla
async function guardarNuevaRedSocialPandillaEdit() {
    const plataforma = document.getElementById('nueva-plataforma-pandilla-edit').value.trim();
    const handle = document.getElementById('nueva-handle-pandilla-edit').value.trim();
    const url = document.getElementById('nueva-url-pandilla-edit').value.trim();
    const mensaje = document.getElementById('mensaje-red-social-pandilla-edit');

    // Validaciones
    if (!plataforma) {
        if (mensaje) {
            mensaje.textContent = 'La plataforma es requerida';
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
            // Cerrar el formulario
            cerrarFormNuevaRedSocialPandillaEdit();

            // Recargar redes sociales
            await loadRedesSocialesForEditPandilla();
            
            // Auto-seleccionar la nueva red social en los checkboxes
            if (data.red_social && data.red_social.id_red_social) {
                setTimeout(() => {
                    const checkbox = document.querySelector(`input[name="redes_sociales_pandilla_edit"][value="${data.red_social.id_red_social}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }, 100);
            }
        } else {
            if (mensaje) {
                mensaje.textContent = data.message || 'Error al crear la red social';
                mensaje.className = 'mt-2 text-xs text-red-500';
                mensaje.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error al crear red social:', error);
        if (mensaje) {
            mensaje.textContent = 'Error de conexión. Por favor, intenta nuevamente.';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
    }
}

// ========== FUNCIONES PARA INTEGRANTES EDIT ==========

// Función para mostrar/ocultar formulario de nueva red social en modal de editar integrante
function toggleFormNuevaRedSocialIntegranteEdit() {
    const form = document.getElementById('form-nueva-red-social-integrante-edit');
    if (form) {
        form.classList.toggle('hidden');
    }
}

// Función para cerrar formulario de nueva red social en modal de editar integrante
function cerrarFormNuevaRedSocialIntegranteEdit() {
    const form = document.getElementById('form-nueva-red-social-integrante-edit');
    if (form) {
        form.classList.add('hidden');
        // Limpiar campos
        document.getElementById('nueva-plataforma-integrante-edit').value = '';
        document.getElementById('nueva-handle-integrante-edit').value = '';
        document.getElementById('nueva-url-integrante-edit').value = '';
        const mensaje = document.getElementById('mensaje-red-social-integrante-edit');
        if (mensaje) {
            mensaje.classList.add('hidden');
            mensaje.textContent = '';
        }
    }
}

// Función para guardar nueva red social desde modal de editar integrante
async function guardarNuevaRedSocialIntegranteEdit() {
    const plataforma = document.getElementById('nueva-plataforma-integrante-edit').value.trim();
    const handle = document.getElementById('nueva-handle-integrante-edit').value.trim();
    const url = document.getElementById('nueva-url-integrante-edit').value.trim();
    const mensaje = document.getElementById('mensaje-red-social-integrante-edit');

    // Validaciones
    if (!plataforma) {
        if (mensaje) {
            mensaje.textContent = 'La plataforma es requerida';
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
            // Cerrar el formulario
            cerrarFormNuevaRedSocialIntegranteEdit();

            // Recargar redes sociales
            await loadRedesSocialesForEditIntegrante();
            
            // Auto-seleccionar la nueva red social en los checkboxes
            if (data.red_social && data.red_social.id_red_social) {
                setTimeout(() => {
                    const checkbox = document.querySelector(`input[name="redes_sociales_integrante_edit"][value="${data.red_social.id_red_social}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }, 100);
            }
        } else {
            if (mensaje) {
                mensaje.textContent = data.message || 'Error al crear la red social';
                mensaje.className = 'mt-2 text-xs text-red-500';
                mensaje.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error al crear red social:', error);
        if (mensaje) {
            mensaje.textContent = 'Error de conexión. Por favor, intenta nuevamente.';
            mensaje.className = 'mt-2 text-xs text-red-500';
            mensaje.classList.remove('hidden');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    const tipoSelect = document.getElementById('tipo-registro-edit-select');
    const registroSelect = document.getElementById('registro-edit-select');
    const continuarBtn = document.getElementById('btn-continuar-edit-registro');

    if (tipoSelect) {
        tipoSelect.addEventListener('change', function () {
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

    if (modalEditarPandilla) {
        modalEditarPandilla.addEventListener('click', function (e) {
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
    const tipoEventoEdit = document.getElementById('tipo-evento-edit');
    const pandillaEventoEdit = document.getElementById('pandilla-evento-edit');

    if (formEditarEvento) formEditarEvento.addEventListener('submit', submitEditarEventoForm);
    if (closeModalEditarEventoBtn) closeModalEditarEventoBtn.addEventListener('click', closeModalEditarEvento);
    if (cancelarEditarEventoBtn) cancelarEditarEventoBtn.addEventListener('click', closeModalEditarEvento);
    if (tipoEventoEdit) tipoEventoEdit.addEventListener('change', handleTipoEventoEditChange);
    if (pandillaEventoEdit) pandillaEventoEdit.addEventListener('change', handlePandillaEventoEditChange);

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

    // Botones para nueva red social en modal de editar pandillas
    const btnNuevaRedSocialPandillaEdit = document.getElementById('btn-nueva-red-social-pandilla-edit');
    const btnCerrarFormRedSocialPandillaEdit = document.getElementById('btn-cerrar-form-red-social-pandilla-edit');
    const btnGuardarNuevaRedSocialPandillaEdit = document.getElementById('btn-guardar-nueva-red-social-pandilla-edit');
    const btnCancelarNuevaRedSocialPandillaEdit = document.getElementById('btn-cancelar-nueva-red-social-pandilla-edit');

    if (btnNuevaRedSocialPandillaEdit) {
        btnNuevaRedSocialPandillaEdit.addEventListener('click', toggleFormNuevaRedSocialPandillaEdit);
    }
    if (btnCerrarFormRedSocialPandillaEdit) {
        btnCerrarFormRedSocialPandillaEdit.addEventListener('click', cerrarFormNuevaRedSocialPandillaEdit);
    }
    if (btnGuardarNuevaRedSocialPandillaEdit) {
        btnGuardarNuevaRedSocialPandillaEdit.addEventListener('click', guardarNuevaRedSocialPandillaEdit);
    }
    if (btnCancelarNuevaRedSocialPandillaEdit) {
        btnCancelarNuevaRedSocialPandillaEdit.addEventListener('click', cerrarFormNuevaRedSocialPandillaEdit);
    }

    // Botones para nueva red social en modal de editar integrantes
    const btnNuevaRedSocialIntegranteEdit = document.getElementById('btn-nueva-red-social-integrante-edit');
    const btnCerrarFormRedSocialIntegranteEdit = document.getElementById('btn-cerrar-form-red-social-integrante-edit');
    const btnGuardarNuevaRedSocialIntegranteEdit = document.getElementById('btn-guardar-nueva-red-social-integrante-edit');
    const btnCancelarNuevaRedSocialIntegranteEdit = document.getElementById('btn-cancelar-nueva-red-social-integrante-edit');

    if (btnNuevaRedSocialIntegranteEdit) {
        btnNuevaRedSocialIntegranteEdit.addEventListener('click', toggleFormNuevaRedSocialIntegranteEdit);
    }
    if (btnCerrarFormRedSocialIntegranteEdit) {
        btnCerrarFormRedSocialIntegranteEdit.addEventListener('click', cerrarFormNuevaRedSocialIntegranteEdit);
    }
    if (btnGuardarNuevaRedSocialIntegranteEdit) {
        btnGuardarNuevaRedSocialIntegranteEdit.addEventListener('click', guardarNuevaRedSocialIntegranteEdit);
    }
    if (btnCancelarNuevaRedSocialIntegranteEdit) {
        btnCancelarNuevaRedSocialIntegranteEdit.addEventListener('click', cerrarFormNuevaRedSocialIntegranteEdit);
    }

    // Event listeners para botones de eliminar
    const btnEliminarPandilla = document.getElementById('eliminar-pandilla-btn');
    const btnEliminarIntegrante = document.getElementById('eliminar-integrante-btn');
    const btnEliminarEvento = document.getElementById('eliminar-evento-btn');
    const btnEliminarDelito = document.getElementById('eliminar-delito-btn');
    const btnEliminarFalta = document.getElementById('eliminar-falta-btn');
    const btnEliminarDireccion = document.getElementById('eliminar-direccion-btn');
    const btnEliminarRivalidad = document.getElementById('eliminar-rivalidad-btn');
    const btnEliminarRedSocial = document.getElementById('eliminar-red-social-btn');

    if (btnEliminarPandilla) {
        btnEliminarPandilla.addEventListener('click', eliminarPandilla);
    }
    if (btnEliminarIntegrante) {
        btnEliminarIntegrante.addEventListener('click', eliminarIntegrante);
    }
    if (btnEliminarEvento) {
        btnEliminarEvento.addEventListener('click', eliminarEvento);
    }
    if (btnEliminarDelito) {
        btnEliminarDelito.addEventListener('click', eliminarDelito);
    }
    if (btnEliminarFalta) {
        btnEliminarFalta.addEventListener('click', eliminarFalta);
    }
    if (btnEliminarDireccion) {
        btnEliminarDireccion.addEventListener('click', eliminarDireccion);
    }
    if (btnEliminarRivalidad) {
        btnEliminarRivalidad.addEventListener('click', eliminarRivalidad);
    }
    if (btnEliminarRedSocial) {
        btnEliminarRedSocial.addEventListener('click', eliminarRedSocial);
    }

    // Inicializar el estado del botón
    updateContinuarEditButton();
});
