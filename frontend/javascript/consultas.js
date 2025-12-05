// Variable para almacenar el tipo de consulta actual y los resultados
let currentConsultaType = null;
let currentResults = null;
let currentFilters = null;

// Función para mostrar/ocultar formularios según el tipo de consulta seleccionado
function handleTipoConsultaChange() {
    const tipoSelect = document.getElementById('tipo-consulta-select');
    const formulariosContainer = document.getElementById('formularios-consulta-container');
    const resultadosContainer = document.getElementById('resultados-consulta-container');

    if (!tipoSelect || !tipoSelect.value) {
        formulariosContainer.classList.add('hidden');
        resultadosContainer.classList.add('hidden');
        return;
    }

    currentConsultaType = tipoSelect.value;

    // Ocultar todos los formularios
    document.getElementById('form-consulta-eventos').classList.add('hidden');
    document.getElementById('form-consulta-pandilla').classList.add('hidden');
    document.getElementById('form-consulta-integrante').classList.add('hidden');
    document.getElementById('form-consulta-general').classList.add('hidden');

    // Mostrar el formulario correspondiente
    formulariosContainer.classList.remove('hidden');
    resultadosContainer.classList.add('hidden');

    switch (currentConsultaType) {
        case 'eventos':
            document.getElementById('form-consulta-eventos').classList.remove('hidden');
            // Ocultar filtros por defecto (mostrar todos está seleccionado)
            const filtrosContainer = document.getElementById('filtros-eventos-container');
            if (filtrosContainer) {
                filtrosContainer.classList.add('hidden');
            }
            // Asegurar que "mostrar todos" esté seleccionado y quitar required de fechas
            const radioTodos = document.querySelector('input[name="modo-consulta-eventos"][value="todos"]');
            if (radioTodos) {
                radioTodos.checked = true;
            }
            // Quitar required de los campos de fecha al cargar
            const fechaInicial = document.getElementById('fecha-inicial-eventos');
            const fechaFinal = document.getElementById('fecha-final-eventos');
            if (fechaInicial) fechaInicial.removeAttribute('required');
            if (fechaFinal) fechaFinal.removeAttribute('required');
            loadDelitosFaltasForEventoFilter();
            loadZonasForEventosFilter();
            break;
        case 'pandilla':
            document.getElementById('form-consulta-pandilla').classList.remove('hidden');
            loadZonasForPandillaFilter();
            break;
        case 'integrante':
            document.getElementById('form-consulta-integrante').classList.remove('hidden');
            loadPandillasForFilter();
            loadZonasForIntegranteFilter();
            loadDelitosForIntegranteFilter();
            break;
        case 'general':
            document.getElementById('form-consulta-general').classList.remove('hidden');
            break;
    }
}

// Función para limpiar formularios y resultados
function limpiarConsulta() {
    const formulariosContainer = document.getElementById('formularios-consulta-container');
    const resultadosContainer = document.getElementById('resultados-consulta-container');

    formulariosContainer.classList.add('hidden');
    resultadosContainer.classList.add('hidden');
    currentResults = null;
    currentFilters = null;

    // Limpiar formularios
    document.getElementById('form-buscar-eventos')?.reset();
    document.getElementById('form-buscar-pandilla')?.reset();
    
    // Limpiar selects de eventos
    const zonaEventosSelect = document.getElementById('filtro-zona-eventos');
    if (zonaEventosSelect) zonaEventosSelect.value = '';
    
    // Limpiar selects de pandillas
    const zonaPandillaSelect = document.getElementById('filtro-zona-pandilla');
    if (zonaPandillaSelect) zonaPandillaSelect.value = '';
    const peligrosidadPandillaSelect = document.getElementById('filtro-peligrosidad-pandilla');
    if (peligrosidadPandillaSelect) peligrosidadPandillaSelect.value = '';
    
    // Limpiar formulario de integrantes (incluyendo checkboxes y selects)
    const formIntegrante = document.getElementById('form-buscar-integrante');
    if (formIntegrante) {
        formIntegrante.reset();
        // Limpiar checkboxes de pandillas
        document.querySelectorAll('input[name="filtro_pandillas"]:checked').forEach(cb => cb.checked = false);
        // Limpiar checkboxes de delitos
        document.querySelectorAll('input[name="filtro_delitos"]:checked').forEach(cb => cb.checked = false);
        // Limpiar selects
        const zonaSelect = document.getElementById('filtro-zona-integrante');
        if (zonaSelect) zonaSelect.value = '';
        const peligrosidadSelect = document.getElementById('filtro-peligrosidad-integrante');
        if (peligrosidadSelect) peligrosidadSelect.value = '';
    }
}

// Función para mostrar mensajes de estado
function mostrarMensaje(tipo, mensaje = '') {
    const mensajes = {
        cargando: document.getElementById('mensaje-cargando'),
        error: document.getElementById('mensaje-error'),
        sinResultados: document.getElementById('mensaje-sin-resultados')
    };

    // Ocultar todos los mensajes
    Object.values(mensajes).forEach(msg => {
        if (msg) msg.classList.add('hidden');
    });

    // Mostrar el mensaje correspondiente
    if (mensajes[tipo]) {
        mensajes[tipo].classList.remove('hidden');
        if (mensaje && tipo === 'error') {
            mensajes[tipo].textContent = mensaje;
        }
    }
}

// Función para mostrar resultados en tabla
function mostrarResultadosTabla(headers, rows) {
    const tablaContainer = document.getElementById('tabla-resultados-container');
    const tarjetasContainer = document.getElementById('tarjetas-resultados-container');
    const tablaHead = document.getElementById('tabla-resultados-head');
    const tablaBody = document.getElementById('tabla-resultados-body');

    // Ocultar tarjetas y mostrar tabla
    tarjetasContainer.classList.add('hidden');
    tablaContainer.classList.remove('hidden');

    // Limpiar tabla
    tablaHead.innerHTML = '';
    tablaBody.innerHTML = '';

    // Crear encabezados
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.className = 'px-4 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider border-b border-slate-600';
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tablaHead.appendChild(headerRow);

    // Crear filas de datos
    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-700 hover:bg-slate-700/50 transition-colors';
        row.forEach(cell => {
            const td = document.createElement('td');
            td.className = 'px-4 py-3 text-sm text-white';
            td.textContent = cell || '-';
            tr.appendChild(td);
        });
        tablaBody.appendChild(tr);
    });
}

// Función para mostrar resultados en tarjetas (para pandillas e integrantes)
function mostrarResultadosTarjetas(data, tipo, busqueda = '') {
    const tablaContainer = document.getElementById('tabla-resultados-container');
    const tarjetasContainer = document.getElementById('tarjetas-resultados-container');

    // Ocultar tabla y mostrar tarjetas
    tablaContainer.classList.add('hidden');
    tarjetasContainer.classList.remove('hidden');

    // Limpiar tarjetas
    tarjetasContainer.innerHTML = '';

    // Crear tarjetas según el tipo
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-slate-700/50 rounded-lg border border-slate-600 p-4 hover:bg-slate-700 transition-colors';

        if (tipo === 'pandilla') {
            card.innerHTML = crearTarjetaPandilla(item, busqueda);
        } else if (tipo === 'integrante') {
            card.innerHTML = crearTarjetaIntegrante(item, busqueda);
        }

        tarjetasContainer.appendChild(card);
    });
}

// Función para resaltar texto en los resultados
function resaltarTexto(texto, busqueda) {
    if (!busqueda || !texto) return texto;
    
    const regex = new RegExp(`(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return texto.toString().replace(regex, '<mark class="bg-yellow-400 text-slate-950 font-semibold px-1 rounded">$1</mark>');
}

// Función para mostrar resultados de consulta general de pandillas (tablas separadas por pandilla)
function mostrarResultadosPandillasGenerales(pandillas) {
    const tablaContainer = document.getElementById('tabla-resultados-container');
    const tarjetasContainer = document.getElementById('tarjetas-resultados-container');

    // Ocultar tarjetas y mostrar contenedor de tablas
    tarjetasContainer.classList.add('hidden');
    tablaContainer.classList.remove('hidden');

    // Limpiar contenido
    const tablaHead = document.getElementById('tabla-resultados-head');
    const tablaBody = document.getElementById('tabla-resultados-body');
    tablaHead.innerHTML = '';
    tablaBody.innerHTML = '';

    // Crear una tabla por cada pandilla
    pandillas.forEach((pandilla, index) => {
        // Tabla de información de la pandilla
        const pandillaSection = document.createElement('div');
        pandillaSection.className = 'mb-8';
        
        // Título de la pandilla
        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-white mb-4';
        title.textContent = `Pandilla: ${pandilla.nombre || 'Sin nombre'}`;
        pandillaSection.appendChild(title);

        // Tabla de datos de la pandilla
        const pandillaTable = document.createElement('table');
        pandillaTable.className = 'w-full mb-6 border-collapse';
        
        const pandillaData = [
            ['Líder', pandilla.lider || '-'],
            ['Número de Integrantes', pandilla.numero_integrantes || '-'],
            ['Peligrosidad', pandilla.peligrosidad || '-'],
            ['Zona', pandilla.zona_nombre || '-'],
            ['Dirección', pandilla.direccion || '-'],
            ['Descripción', pandilla.descripcion || '-']
        ];

        pandillaData.forEach(([label, value]) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-slate-700';
            row.innerHTML = `
                <td class="px-4 py-2 text-sm font-semibold text-blue-100 w-1/3">${label}:</td>
                <td class="px-4 py-2 text-sm text-white">${value}</td>
            `;
            pandillaTable.appendChild(row);
        });

        // Agregar delitos y faltas si existen
        if (pandilla.delitos && pandilla.delitos.length > 0) {
            const delitosRow = document.createElement('tr');
            delitosRow.className = 'border-b border-slate-700';
            const delitosList = pandilla.delitos.map(d => d.nombre || d).join(', ');
            delitosRow.innerHTML = `
                <td class="px-4 py-2 text-sm font-semibold text-blue-100 w-1/3">Delitos:</td>
                <td class="px-4 py-2 text-sm text-white">${delitosList}</td>
            `;
            pandillaTable.appendChild(delitosRow);
        }

        if (pandilla.faltas && pandilla.faltas.length > 0) {
            const faltasRow = document.createElement('tr');
            faltasRow.className = 'border-b border-slate-700';
            const faltasList = pandilla.faltas.map(f => f.falta || f.nombre || f).join(', ');
            faltasRow.innerHTML = `
                <td class="px-4 py-2 text-sm font-semibold text-blue-100 w-1/3">Faltas:</td>
                <td class="px-4 py-2 text-sm text-white">${faltasList}</td>
            `;
            pandillaTable.appendChild(faltasRow);
        }

        pandillaSection.appendChild(pandillaTable);

        // Tabla de integrantes de la pandilla
        if (pandilla.integrantes && pandilla.integrantes.length > 0) {
            const integrantesTitle = document.createElement('h4');
            integrantesTitle.className = 'text-lg font-semibold text-blue-100 mb-3';
            integrantesTitle.textContent = `Integrantes (${pandilla.integrantes.length}):`;
            pandillaSection.appendChild(integrantesTitle);

            const integrantesTable = document.createElement('table');
            integrantesTable.className = 'w-full border-collapse';
            
            // Encabezados de la tabla de integrantes
            const integrantesHeader = document.createElement('thead');
            integrantesHeader.innerHTML = `
                <tr class="bg-slate-700">
                    <th class="px-4 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider border-b border-slate-600">Nombre Completo</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-blue-100 uppercase tracking-wider border-b border-slate-600">Alias</th>
                </tr>
            `;
            integrantesTable.appendChild(integrantesHeader);

            // Cuerpo de la tabla de integrantes
            const integrantesBody = document.createElement('tbody');
            pandilla.integrantes.forEach(integrante => {
                const row = document.createElement('tr');
                row.className = 'border-b border-slate-700 hover:bg-slate-700/50 transition-colors';
                row.innerHTML = `
                    <td class="px-4 py-3 text-sm text-white">${integrante.nombre_completo || integrante.nombre || '-'}</td>
                    <td class="px-4 py-3 text-sm text-white">${integrante.alias || '-'}</td>
                `;
                integrantesBody.appendChild(row);
            });
            integrantesTable.appendChild(integrantesBody);
            pandillaSection.appendChild(integrantesTable);
        } else {
            const noIntegrantes = document.createElement('p');
            noIntegrantes.className = 'text-sm text-blue-200 mb-6';
            noIntegrantes.textContent = 'No hay integrantes registrados para esta pandilla.';
            pandillaSection.appendChild(noIntegrantes);
        }

        tablaBody.appendChild(pandillaSection);
    });
}

// Función para crear tarjeta de pandilla
function crearTarjetaPandilla(pandilla, busqueda = '') {
    const nombre = pandilla.nombre || 'Sin nombre';
    const lider = pandilla.lider || '';
    const descripcion = pandilla.descripcion || '';
    
    return `
        <div class="flex flex-col gap-3">
            <h3 class="text-lg font-bold text-white">${resaltarTexto(nombre, busqueda)}</h3>
            <div class="flex flex-col gap-2 text-sm text-blue-100">
                ${lider ? `<p><span class="font-semibold">Líder:</span> ${resaltarTexto(lider, busqueda)}</p>` : ''}
                ${pandilla.numero_integrantes ? `<p><span class="font-semibold">Integrantes:</span> ${pandilla.numero_integrantes}</p>` : ''}
                ${pandilla.peligrosidad ? `<p><span class="font-semibold">Peligrosidad:</span> ${pandilla.peligrosidad}</p>` : ''}
                ${pandilla.zona_nombre ? `<p><span class="font-semibold">Zona:</span> ${pandilla.zona_nombre}</p>` : ''}
                ${pandilla.descripcion ? `<p class="text-xs text-blue-200 mt-2">${pandilla.descripcion}</p>` : ''}
            </div>
            ${(pandilla.delitos && pandilla.delitos.length > 0) || (pandilla.faltas && pandilla.faltas.length > 0) ? `
                <div class="mt-3 pt-3 border-t border-slate-600">
                    ${pandilla.delitos && pandilla.delitos.length > 0 ? `
                        <p class="text-sm font-semibold text-blue-100 mb-2">Delitos:</p>
                        <ul class="text-xs text-blue-200 space-y-1">
                            ${pandilla.delitos.map(d => `<li>• ${d.nombre || d}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${pandilla.faltas && pandilla.faltas.length > 0 ? `
                        <p class="text-sm font-semibold text-blue-100 mb-2 mt-2">Faltas:</p>
                        <ul class="text-xs text-blue-200 space-y-1">
                            ${pandilla.faltas.map(f => `<li>• ${f.falta || f.nombre || f}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
            ${pandilla.integrantes && pandilla.integrantes.length > 0 ? `
                <div class="mt-3 pt-3 border-t border-slate-600">
                    <p class="text-sm font-semibold text-blue-100 mb-2">Integrantes (${pandilla.integrantes.length}):</p>
                    <ul class="text-xs text-blue-200 space-y-1">
                        ${pandilla.integrantes.map(int => `<li>• ${int.nombre_completo || int.nombre}${int.alias ? ` (${int.alias})` : ''}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

// Función para crear tarjeta de integrante
function crearTarjetaIntegrante(integrante, busqueda = '') {
    // Construir HTML de la imagen
    let imageHtml = '';
    if (integrante.imagen_url) {
        imageHtml = `<div class="w-full h-48 mb-3 overflow-hidden rounded-lg bg-slate-800 flex items-center justify-center">
                        <img src="http://localhost:8000/${integrante.imagen_url}" alt="Foto de ${integrante.nombre}" class="w-full h-full object-cover">
                     </div>`;
    } else {
        imageHtml = `<div class="w-full h-48 mb-3 overflow-hidden rounded-lg bg-slate-800 flex items-center justify-center border border-slate-600">
                        <div class="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span class="text-slate-400 text-sm">Sin imagen disponible</span>
                        </div>
                     </div>`;
    }

    const nombreCompleto = integrante.nombre_completo || integrante.nombre || 'Sin nombre';
    const alias = integrante.alias || '';
    const informacion = integrante.informacion || '';
    const pandillaNombre = integrante.pandilla_nombre || '';
    const direccion = integrante.direccion || '';

    return `
        <div class="flex flex-col gap-3">
            ${imageHtml}
            <h3 class="text-lg font-bold text-white">${resaltarTexto(nombreCompleto, busqueda)}</h3>
            <div class="flex flex-col gap-2 text-sm text-blue-100">
                ${alias ? `<p><span class="font-semibold">Alias:</span> ${resaltarTexto(alias, busqueda)}</p>` : ''}
                ${integrante.fecha_nacimiento ? `<p><span class="font-semibold">Fecha de Nacimiento:</span> ${integrante.fecha_nacimiento}</p>` : ''}
                ${informacion ? `<p><span class="font-semibold">Información Relevante:</span> ${resaltarTexto(informacion, busqueda)}</p>` : ''}
                ${pandillaNombre ? `<p><span class="font-semibold">Pandilla:</span> ${pandillaNombre}</p>` : ''}
                ${direccion ? `<p><span class="font-semibold">Dirección:</span> ${direccion}</p>` : ''}
            </div>
            ${(integrante.delitos && integrante.delitos.length > 0) || (integrante.faltas && integrante.faltas.length > 0) ? `
                <div class="mt-3 pt-3 border-t border-slate-600">
                    ${integrante.delitos && integrante.delitos.length > 0 ? `
                        <p class="text-sm font-semibold text-blue-100 mb-2">Delitos:</p>
                        <ul class="text-xs text-blue-200 space-y-1">
                            ${integrante.delitos.map(d => `<li>• ${d.nombre || d}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${integrante.faltas && integrante.faltas.length > 0 ? `
                        <p class="text-sm font-semibold text-blue-100 mb-2 mt-2">Faltas:</p>
                        <ul class="text-xs text-blue-200 space-y-1">
                            ${integrante.faltas.map(f => `<li>• ${f.falta || f}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
            ${integrante.redes_sociales && integrante.redes_sociales.length > 0 ? `
                <div class="mt-3 pt-3 border-t border-slate-600">
                    <p class="text-sm font-semibold text-blue-100 mb-2">Redes Sociales:</p>
                    <ul class="text-xs text-blue-200 space-y-1">
                        ${integrante.redes_sociales.map(r => `<li>• ${r.plataforma} (${r.handle || 'Sin handle'})</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

// Función para cargar pandillas para el filtro
async function loadPandillasForFilter() {
    const container = document.getElementById('filtro-pandillas-container');
    if (!container) return;

    // Si ya tiene contenido (checkboxes), no recargar
    if (container.querySelector('input[type="checkbox"]')) return;

    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/pandillas/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar pandillas');
        const data = await response.json();

        container.innerHTML = '';
        if (data.success && data.pandillas && data.pandillas.length > 0) {
            data.pandillas.forEach(pandilla => {
                const label = document.createElement('label');
                label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
                label.innerHTML = `
                    <input type="checkbox" name="filtro_pandillas" value="${pandilla.id_pandilla}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                    <span class="text-sm md:text-base text-slate-950">${pandilla.nombre}</span>
                `;
                container.appendChild(label);
            });
        } else {
            container.innerHTML = '<p class="text-slate-500 text-sm">No hay pandillas disponibles</p>';
        }
    } catch (error) {
        console.error('Error al cargar pandillas para filtro:', error);
        container.innerHTML = '<p class="text-red-500 text-sm">Error al cargar pandillas</p>';
    }
}

// Función para cargar zonas en el filtro de integrantes
async function loadZonasForIntegranteFilter() {
    const select = document.getElementById('filtro-zona-integrante');
    if (!select) return;

    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/zones/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar zonas');
        const data = await response.json();

        // Limpiar opciones excepto la primera
        select.innerHTML = '<option value="">Todas las zonas</option>';
        
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(zona => {
                const option = document.createElement('option');
                option.value = zona.id;
                option.textContent = zona.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar zonas para filtro:', error);
    }
}

// Función para cargar zonas en el filtro de pandillas
async function loadZonasForPandillaFilter() {
    const select = document.getElementById('filtro-zona-pandilla');
    if (!select) return;

    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/zones/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar zonas');
        const data = await response.json();

        // Limpiar opciones excepto la primera
        select.innerHTML = '<option value="">Todas las zonas</option>';
        
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(zona => {
                const option = document.createElement('option');
                option.value = zona.id;
                option.textContent = zona.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar zonas para filtro de pandillas:', error);
    }
}

// Función para cargar zonas en el filtro de eventos
async function loadZonasForEventosFilter() {
    const select = document.getElementById('filtro-zona-eventos');
    if (!select) return;

    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/zones/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar zonas');
        const data = await response.json();

        // Limpiar opciones excepto la primera
        select.innerHTML = '<option value="">Todas las zonas</option>';
        
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(zona => {
                const option = document.createElement('option');
                option.value = zona.id;
                option.textContent = zona.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar zonas para filtro de eventos:', error);
    }
}

// Función para cargar delitos en el filtro de integrantes
async function loadDelitosForIntegranteFilter() {
    const container = document.getElementById('filtro-delitos-container');
    if (!container) return;

    // Si ya tiene contenido (checkboxes), no recargar
    if (container.querySelector('input[type="checkbox"]')) return;

    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/delitos/', {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar delitos');
        const data = await response.json();

        container.innerHTML = '';
        if (data.success && data.delitos && data.delitos.length > 0) {
            data.delitos.forEach(delito => {
                const label = document.createElement('label');
                label.className = 'flex items-center gap-2 py-2 px-2 hover:bg-slate-100 rounded cursor-pointer';
                label.innerHTML = `
                    <input type="checkbox" name="filtro_delitos" value="${delito.id_delito}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                    <span class="text-sm md:text-base text-slate-950">${delito.nombre}</span>
                `;
                container.appendChild(label);
            });
        } else {
            container.innerHTML = '<p class="text-slate-500 text-sm">No hay delitos disponibles</p>';
        }
    } catch (error) {
        console.error('Error al cargar delitos para filtro:', error);
        container.innerHTML = '<p class="text-red-500 text-sm">Error al cargar delitos</p>';
    }
}

// Función para cargar delitos y faltas en el select combinado
async function loadDelitosFaltasForEventoFilter() {
    try {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('auth_token');
        const select = document.getElementById('delito-falta-filtro');
        if (!select) return;

        // Cargar delitos
        const responseDelitos = await fetch('http://localhost:8000/api/delitos/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Cargar faltas
        const responseFaltas = await fetch('http://localhost:8000/api/faltas/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        select.innerHTML = '<option value="">Ninguno (Todos)</option>';

        if (responseDelitos.ok) {
            const dataDelitos = await responseDelitos.json();
            if (dataDelitos.success && dataDelitos.delitos) {
                dataDelitos.delitos.forEach(delito => {
                    const option = document.createElement('option');
                    option.value = `delito_${delito.id_delito}`;
                    option.textContent = `Delito: ${delito.nombre}`;
                    select.appendChild(option);
                });
            }
        }

        if (responseFaltas.ok) {
            const dataFaltas = await responseFaltas.json();
            if (dataFaltas.success && dataFaltas.faltas) {
                dataFaltas.faltas.forEach(falta => {
                    const option = document.createElement('option');
                    option.value = `falta_${falta.id_falta}`;
                    option.textContent = `Falta: ${falta.falta || falta.nombre}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar delitos y faltas:', error);
    }
}

// Función para consultar eventos
async function consultarEventos(fechaInicial, fechaFinal, tipoEvento = '', delitoFalta = '', zonaId = '', mostrarTodos = false) {
    try {
        mostrarMensaje('cargando');

        // Obtener token directamente de localStorage si getAuthToken no está disponible
        let token = null;
        if (typeof getAuthToken === 'function') {
            token = getAuthToken();
        } else {
            token = localStorage.getItem('auth_token');
        }

        if (!token) {
            mostrarMensaje('error', 'No estás autenticado. Por favor, inicia sesión.');
            return;
        }

        // Construir URL con filtros
        let url = 'http://localhost:8000/api/consultas/eventos/?';
        const params = [];
        
        if (mostrarTodos) {
            params.push('mostrar_todos=true');
        } else {
            if (fechaInicial) params.push(`fecha_inicial=${fechaInicial}`);
            if (fechaFinal) params.push(`fecha_final=${fechaFinal}`);
        }
        
        if (tipoEvento) {
            params.push(`tipo_evento=${encodeURIComponent(tipoEvento)}`);
        }
        if (delitoFalta) {
            params.push(`delito_falta=${encodeURIComponent(delitoFalta)}`);
        }
        if (zonaId) {
            params.push(`zona=${zonaId}`);
        }
        
        url += params.join('&');

        console.log(`Consultando eventos - Mostrar todos: ${mostrarTodos}, desde ${fechaInicial || 'N/A'} hasta ${fechaFinal || 'N/A'}, tipo: ${tipoEvento || 'todos'}, delito/falta: ${delitoFalta || 'todos'}, zona: ${zonaId || 'todas'}`);
        console.log(`Token disponible: ${token ? 'Sí' : 'No'}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (!response.ok || !data.success) {
            console.error('Error en la respuesta:', data);
            mostrarMensaje('error', data.message || 'Error al consultar eventos');
            return;
        }

        if (!data.eventos || data.eventos.length === 0) {
            console.log('No se encontraron eventos en el rango especificado');
            mostrarMensaje('sinResultados');
            currentResults = [];
            return;
        }

        console.log(`Se encontraron ${data.eventos.length} eventos`);

        // Preparar datos para la tabla
        const headers = ['Fecha', 'Hora', 'Tipo', 'Delito/Falta', 'Integrante', 'Pandilla', 'Zona', 'Dirección', 'Descripción'];
        const rows = data.eventos.map(evento => [
            evento.fecha || '-',
            evento.hora || '-',
            evento.tipo ? evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1) : '-',
            evento.delito_nombre || evento.falta_nombre || evento.falta || '-',
            evento.integrante_nombre || '-',
            evento.pandilla_nombre || '-',
            evento.zona_nombre || '-',
            evento.direccion || '-',
            evento.descripcion || '-'
        ]);

        currentResults = data.eventos;
        currentFilters = { 
            mostrar_todos: mostrarTodos,
            fecha_inicial: fechaInicial || '', 
            fecha_final: fechaFinal || '',
            tipo_evento: tipoEvento || '',
            delito_falta: delitoFalta || '',
            zona: zonaId || ''
        };

        mostrarResultadosTabla(headers, rows);
        // Ocultar todos los mensajes después de mostrar resultados
        document.getElementById('mensaje-cargando').classList.add('hidden');
        document.getElementById('mensaje-error').classList.add('hidden');
        document.getElementById('mensaje-sin-resultados').classList.add('hidden');
        document.getElementById('resultados-consulta-container').classList.remove('hidden');
    } catch (error) {
        console.error('Error al consultar eventos:', error);
        mostrarMensaje('error', 'Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para consultar pandilla
async function consultarPandilla(nombre = '', zonaId = '', peligrosidad = '') {
    try {
        mostrarMensaje('cargando');

        // Obtener token directamente de localStorage si getAuthToken no está disponible
        let token = null;
        if (typeof getAuthToken === 'function') {
            token = getAuthToken();
        } else {
            token = localStorage.getItem('auth_token');
        }

        if (!token) {
            mostrarMensaje('error', 'No estás autenticado. Por favor, inicia sesión.');
            return;
        }

        // Construir URL con parámetros
        let url = 'http://localhost:8000/api/consultas/pandillas/?';
        const params = [];
        
        if (nombre) {
            params.push(`nombre=${encodeURIComponent(nombre)}`);
        }
        if (zonaId) {
            params.push(`zona=${zonaId}`);
        }
        if (peligrosidad) {
            params.push(`peligrosidad=${encodeURIComponent(peligrosidad)}`);
        }
        
        url += params.join('&');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            mostrarMensaje('error', data.message || 'Error al consultar pandillas');
            return;
        }

        if (!data.pandillas || data.pandillas.length === 0) {
            mostrarMensaje('sinResultados');
            currentResults = [];
            return;
        }

        currentResults = data.pandillas;
        currentFilters = { nombre: nombre, zona: zonaId, peligrosidad: peligrosidad };

        mostrarResultadosTarjetas(data.pandillas, 'pandilla', nombre);
        // Ocultar todos los mensajes después de mostrar resultados
        document.getElementById('mensaje-cargando').classList.add('hidden');
        document.getElementById('mensaje-error').classList.add('hidden');
        document.getElementById('mensaje-sin-resultados').classList.add('hidden');
        document.getElementById('resultados-consulta-container').classList.remove('hidden');
    } catch (error) {
        console.error('Error al consultar pandilla:', error);
        mostrarMensaje('error', 'Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para consultar integrante
async function consultarIntegrante(busqueda, pandillasIds = [], zonaId = '', peligrosidad = '', delitosIds = []) {
    try {
        mostrarMensaje('cargando');

        // Obtener token directamente de localStorage si getAuthToken no está disponible
        let token = null;
        if (typeof getAuthToken === 'function') {
            token = getAuthToken();
        } else {
            token = localStorage.getItem('auth_token');
        }

        if (!token) {
            mostrarMensaje('error', 'No estás autenticado. Por favor, inicia sesión.');
            return;
        }

        console.log(`Consultando integrantes con búsqueda: "${busqueda}", pandillas: [${pandillasIds.join(', ')}], zona: ${zonaId}, peligrosidad: ${peligrosidad}, delitos: [${delitosIds.join(', ')}]`);

        // Construir URL con parámetros
        let url = 'http://localhost:8000/api/consultas/integrantes/?';
        const params = [];
        
        // Agregar búsqueda solo si no está vacía
        if (busqueda) {
            params.push(`busqueda=${encodeURIComponent(busqueda)}`);
        }
        
        // Agregar cada ID de pandilla como parámetro repetido 'pandillas'
        if (pandillasIds.length > 0) {
            pandillasIds.forEach(id => {
                params.push(`pandillas=${id}`);
            });
        }

        // Agregar zona
        if (zonaId) {
            params.push(`zona=${zonaId}`);
        }

        // Agregar peligrosidad
        if (peligrosidad) {
            params.push(`peligrosidad=${encodeURIComponent(peligrosidad)}`);
        }

        // Agregar delitos
        if (delitosIds.length > 0) {
            delitosIds.forEach(id => {
                params.push(`delitos=${id}`);
            });
        }
        
        url += params.join('&');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (!response.ok || !data.success) {
            console.error('Error en la respuesta:', data);
            mostrarMensaje('error', data.message || 'Error al consultar integrantes');
            return;
        }

        if (!data.integrantes || data.integrantes.length === 0) {
            console.log('No se encontraron integrantes con el criterio de búsqueda');
            mostrarMensaje('sinResultados');
            currentResults = [];
            return;
        }

        console.log(`Se encontraron ${data.integrantes.length} integrantes`);

        currentResults = data.integrantes;
        currentFilters = { 
            busqueda: busqueda,
            pandillas: pandillasIds,
            zona: zonaId,
            peligrosidad: peligrosidad,
            delitos: delitosIds
        };

        mostrarResultadosTarjetas(data.integrantes, 'integrante', busqueda);
        // Ocultar todos los mensajes después de mostrar resultados
        document.getElementById('mensaje-cargando').classList.add('hidden');
        document.getElementById('mensaje-error').classList.add('hidden');
        document.getElementById('mensaje-sin-resultados').classList.add('hidden');
        document.getElementById('resultados-consulta-container').classList.remove('hidden');
    } catch (error) {
        console.error('Error al consultar integrante:', error);
        mostrarMensaje('error', 'Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para consulta general de pandillas
async function consultaGeneralPandillas() {
    try {
        mostrarMensaje('cargando');

        // Obtener token directamente de localStorage si getAuthToken no está disponible
        let token = null;
        if (typeof getAuthToken === 'function') {
            token = getAuthToken();
        } else {
            token = localStorage.getItem('auth_token');
        }

        if (!token) {
            mostrarMensaje('error', 'No estás autenticado. Por favor, inicia sesión.');
            return;
        }

        const response = await fetch('http://localhost:8000/api/consultas/pandillas/general/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            mostrarMensaje('error', data.message || 'Error al consultar pandillas');
            return;
        }

        if (!data.pandillas || data.pandillas.length === 0) {
            mostrarMensaje('sinResultados');
            currentResults = [];
            return;
        }

        currentResults = data.pandillas;
        currentFilters = {};

        // Mostrar tablas separadas por pandilla con sus integrantes
        mostrarResultadosPandillasGenerales(data.pandillas);
        // Ocultar todos los mensajes después de mostrar resultados
        document.getElementById('mensaje-cargando').classList.add('hidden');
        document.getElementById('mensaje-error').classList.add('hidden');
        document.getElementById('mensaje-sin-resultados').classList.add('hidden');
        document.getElementById('resultados-consulta-container').classList.remove('hidden');
    } catch (error) {
        console.error('Error al consultar pandillas general:', error);
        mostrarMensaje('error', 'Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para generar PDF
function generarPDF() {
    if (!currentResults || currentResults.length === 0) {
        alert('No hay resultados para generar el reporte');
        return;
    }

    if (!currentConsultaType) {
        alert('No se ha seleccionado un tipo de consulta');
        return;
    }

    // Si es consulta general de pandillas, usar función especial
    if (currentConsultaType === 'general') {
        generarPDFPandillasGenerales();
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

        // Configuración de colores
        const primaryColor = [59, 130, 246]; // blue-500
        const secondaryColor = [30, 41, 59]; // slate-800
        const textColor = [15, 23, 42]; // slate-950

        // Encabezado
        doc.setFillColor(...primaryColor);
        doc.rect(10, 10, 277, 20, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const tipoConsultaTexto = getTipoConsultaTexto(currentConsultaType);
        doc.text(tipoConsultaTexto, 15, 22);

        // Fecha y hora de generación
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fechaHora = new Date().toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generado el: ${fechaHora}`, 15, 28);

        // Filtros utilizados
        let filtrosTexto = '';
        if (currentFilters) {
            const filtrosArray = [];
            if (currentFilters.fecha_inicial && currentFilters.fecha_final) {
                filtrosArray.push(`Período: ${currentFilters.fecha_inicial} a ${currentFilters.fecha_final}`);
            }
            if (currentFilters.tipo_evento) {
                const tipoTexto = currentFilters.tipo_evento === 'riña' ? 'Riña' : 
                                 currentFilters.tipo_evento === 'delito' ? 'Delito' : 
                                 currentFilters.tipo_evento === 'falta' ? 'Falta' : currentFilters.tipo_evento;
                filtrosArray.push(`Tipo: ${tipoTexto}`);
            }
            if (currentFilters.delito_falta) {
                const delitoFaltaTexto = currentFilters.delito_falta.startsWith('delito_') ? 
                                        `Delito: ${currentFilters.delito_falta.replace('delito_', '')}` :
                                        currentFilters.delito_falta.startsWith('falta_') ?
                                        `Falta: ${currentFilters.delito_falta.replace('falta_', '')}` :
                                        currentFilters.delito_falta;
                filtrosArray.push(delitoFaltaTexto);
            }
            if (currentFilters.nombre) {
                filtrosArray.push(`Búsqueda: ${currentFilters.nombre}`);
            }
            if (currentFilters.busqueda) {
                filtrosArray.push(`Búsqueda: ${currentFilters.busqueda}`);
            }
            filtrosTexto = filtrosArray.join(' | ');
        }

        if (filtrosTexto) {
            doc.setFontSize(9);
            doc.text(`Filtros: ${filtrosTexto}`, 15, 33);
        }

        // Preparar datos para la tabla según el tipo de consulta
        let headers = [];
        let rows = [];
        let tituloTabla = '';

        switch (currentConsultaType) {
            case 'eventos':
                headers = ['Fecha', 'Hora', 'Tipo', 'Delito/Falta', 'Integrante', 'Pandilla', 'Zona', 'Dirección', 'Descripción'];
                rows = currentResults.map(evento => [
                    evento.fecha || '-',
                    evento.hora || '-',
                    evento.tipo ? evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1) : '-',
                    evento.delito_nombre || evento.falta_nombre || '-',
                    evento.integrante_nombre || '-',
                    evento.pandilla_nombre || '-',
                    evento.zona_nombre || '-',
                    evento.direccion || '-',
                    evento.descripcion || '-'
                ]);
                tituloTabla = 'Eventos Registrados';
                break;

            case 'pandilla':
                // Para pandillas, crear una tabla más detallada
                headers = ['Nombre', 'Líder', 'Integrantes', 'Peligrosidad', 'Zona', 'Dirección', 'Delitos', 'Faltas'];
                rows = currentResults.map(pandilla => [
                    pandilla.nombre || '-',
                    pandilla.lider || '-',
                    pandilla.numero_integrantes || '0',
                    pandilla.peligrosidad || '-',
                    pandilla.zona_nombre || '-',
                    pandilla.direccion || '-',
                    (pandilla.delitos && pandilla.delitos.length > 0) ? pandilla.delitos.map(d => d.nombre || d).join(', ') : '-',
                    (pandilla.faltas && pandilla.faltas.length > 0) ? pandilla.faltas.map(f => f.falta || f.nombre || f).join(', ') : '-'
                ]);
                tituloTabla = 'Pandillas Encontradas';
                break;

            case 'integrante':
                headers = ['Foto', 'Nombre Completo', 'Alias', 'Fecha Nacimiento', 'Información Relevante', 'Pandilla', 'Dirección', 'Delitos', 'Faltas'];
                rows = currentResults.map(integrante => [
                    '', // Placeholder para la foto
                    integrante.nombre_completo || integrante.nombre || '-',
                    integrante.alias || '-',
                    integrante.fecha_nacimiento || '-',
                    integrante.informacion || '-',
                    integrante.pandilla_nombre || '-',
                    integrante.direccion || '-',
                    (integrante.delitos && integrante.delitos.length > 0) ? integrante.delitos.map(d => d.nombre || d).join(', ') : '-',
                    (integrante.faltas && integrante.faltas.length > 0) ? integrante.faltas.map(f => f.falta || f.nombre || f).join(', ') : '-'
                ]);
                tituloTabla = 'Integrantes Encontrados';
                break;

            case 'general':
                headers = ['Nombre', 'Líder', 'Número Integrantes', 'Peligrosidad', 'Zona', 'Dirección'];
                rows = currentResults.map(pandilla => [
                    pandilla.nombre || '-',
                    pandilla.lider || '-',
                    pandilla.numero_integrantes || '0',
                    pandilla.peligrosidad || '-',
                    pandilla.zona_nombre || '-',
                    pandilla.direccion || '-'
                ]);
                tituloTabla = 'Todas las Pandillas';
                break;
        }

        // Calcular anchos de columna dinámicamente según el tipo
        const columnStyles = {};
        if (currentConsultaType === 'integrante') {
            columnStyles[0] = { cellWidth: 30 }; // Foto - ancho fijo para imagen
            columnStyles[1] = { cellWidth: 40 }; // Nombre completo
            columnStyles[2] = { cellWidth: 30 }; // Alias
            columnStyles[3] = { cellWidth: 30 }; // Fecha nacimiento
            columnStyles[4] = { cellWidth: 50 }; // Información relevante
            columnStyles[5] = { cellWidth: 35 }; // Pandilla
            columnStyles[6] = { cellWidth: 50 }; // Dirección
        } else if (currentConsultaType === 'eventos') {
            columnStyles[0] = { cellWidth: 25 }; // Fecha
            columnStyles[1] = { cellWidth: 20 }; // Hora
            columnStyles[2] = { cellWidth: 20 }; // Tipo
            columnStyles[3] = { cellWidth: 30 }; // Delito/Falta
            columnStyles[4] = { cellWidth: 35 }; // Integrante
            columnStyles[5] = { cellWidth: 35 }; // Pandilla
            columnStyles[6] = { cellWidth: 25 }; // Zona
            columnStyles[7] = { cellWidth: 40 }; // Dirección
            columnStyles[8] = { cellWidth: 50 }; // Descripción - más ancho para texto largo
        } else if (currentConsultaType === 'pandilla') {
            columnStyles[0] = { cellWidth: 40 }; // Nombre
            columnStyles[1] = { cellWidth: 35 }; // Líder
            columnStyles[2] = { cellWidth: 25 }; // Integrantes
            columnStyles[3] = { cellWidth: 30 }; // Peligrosidad
            columnStyles[4] = { cellWidth: 30 }; // Zona
            columnStyles[5] = { cellWidth: 50 }; // Dirección
            columnStyles[6] = { cellWidth: 50 }; // Delitos
            columnStyles[7] = { cellWidth: 50 }; // Faltas
        } else {
            // Para otros tipos, usar auto
            headers.forEach((_, index) => {
                columnStyles[index] = { cellWidth: 'auto' };
            });
        }

        // Función para calcular altura mínima de celda según contenido
        function calcularMinCellHeight(cellContent, columnIndex, rowIndex) {
            let minHeight = 8; // Altura base
            
            // Para descripciones (columna 8 en eventos)
            if (currentConsultaType === 'eventos' && columnIndex === 8) {
                if (cellContent && cellContent.length > 50) {
                    // Calcular líneas necesarias (aproximadamente 50 caracteres por línea)
                    const lineas = Math.ceil(cellContent.length / 50);
                    minHeight = Math.max(minHeight, lineas * 4 + 4);
                }
            }
            
            // Para información relevante (columna 4 en integrantes)
            if (currentConsultaType === 'integrante' && columnIndex === 4) {
                if (cellContent && cellContent.length > 40) {
                    const lineas = Math.ceil(cellContent.length / 40);
                    minHeight = Math.max(minHeight, lineas * 4 + 4);
                }
            }
            
            // Para imágenes (columna 0 en integrantes)
            if (currentConsultaType === 'integrante' && columnIndex === 0) {
                const integrante = currentResults[rowIndex];
                if (integrante && integrante.imagen_url) {
                    minHeight = Math.max(minHeight, 30); // Espacio para imagen 25x25
                }
            }
            
            return minHeight;
        }

        // Agregar tabla usando autoTable
        doc.autoTable({
            startY: 40,
            head: [headers],
            body: rows,
            theme: 'striped',
            headStyles: {
                fillColor: secondaryColor,
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                textColor: textColor,
                fontSize: 8,
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: [241, 245, 249] // slate-100
            },
            margin: { top: 40, left: 10, right: 10 },
            styles: {
                cellPadding: 3,
                overflow: 'linebreak',
                cellWidth: 'wrap',
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            columnStyles: columnStyles,
            didParseCell: function (data) {
                // Ajustar altura mínima según el contenido
                if (data.section === 'body') {
                    const cellContent = data.cell.text[0] || '';
                    const minHeight = calcularMinCellHeight(cellContent, data.column.index, data.row.index);
                    data.cell.minHeight = minHeight;
                }
            },
            didDrawCell: function (data) {
                if (currentConsultaType === 'integrante' && data.column.index === 0 && data.cell.section === 'body') {
                    const integrante = currentResults[data.row.index];
                    if (integrante && integrante.imagen_url) {
                        try {
                            const imgUrl = `http://localhost:8000/${integrante.imagen_url}`;
                            // Calcular tamaño de imagen basado en el espacio disponible
                            const cellHeight = data.cell.height - 4;
                            const imgSize = Math.min(cellHeight - 2, 25); // Máximo 25mm, pero ajustar al espacio disponible
                            doc.addImage(imgUrl, 'JPEG', data.cell.x + 2, data.cell.y + 2, imgSize, imgSize);
                        } catch (e) {
                            // Si falla, dejar en blanco
                            console.warn('No se pudo agregar imagen al PDF', e);
                        }
                    }
                }
            }
        });

        // Resumen al final
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFillColor(...secondaryColor);
        doc.rect(10, finalY, 277, 15, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const totalRegistros = currentResults.length;
        const textoResumen = `Total de registros: ${totalRegistros}`;
        doc.text(textoResumen, 15, finalY + 8);

        // Información adicional según el tipo
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        let infoAdicional = '';

        if (currentConsultaType === 'pandilla' && currentResults.length > 0) {
            const totalIntegrantes = currentResults.reduce((sum, p) => sum + (parseInt(p.numero_integrantes) || 0), 0);
            infoAdicional = `Total de integrantes en pandillas encontradas: ${totalIntegrantes}`;
        } else if (currentConsultaType === 'eventos') {
            const tiposEventos = {};
            currentResults.forEach(e => {
                const tipo = e.tipo || 'Desconocido';
                tiposEventos[tipo] = (tiposEventos[tipo] || 0) + 1;
            });
            const tiposTexto = Object.entries(tiposEventos)
                .map(([tipo, count]) => `${tipo}: ${count}`)
                .join(', ');
            infoAdicional = `Distribución por tipo: ${tiposTexto}`;
        }

        if (infoAdicional) {
            doc.text(infoAdicional, 15, finalY + 13);
        }

        // Pie de página
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const pieTexto1 = 'SIGP - Sistema de Identificación de Grupos Pandilleriles';
        const pieTexto2 = '© 2025, SIGP – Todos los derechos reservados';
        doc.text(pieTexto1, 15, doc.internal.pageSize.height - 10);
        doc.text(pieTexto2, doc.internal.pageSize.width - doc.getTextWidth(pieTexto2) - 15, doc.internal.pageSize.height - 10);

        // Generar nombre de archivo
        const fechaArchivo = new Date().toISOString().split('T')[0];
        const nombreArchivo = `reporte_${currentConsultaType}_${fechaArchivo}.pdf`;

        // Descargar PDF
        doc.save(nombreArchivo);

    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
}

// Función especial para generar PDF de consulta general de pandillas (tablas separadas por pandilla)
async function generarPDFPandillasGenerales() {
    if (!currentResults || currentResults.length === 0) {
        alert('No hay resultados para generar el reporte');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

        // Configuración de colores
        const primaryColor = [59, 130, 246]; // blue-500
        const secondaryColor = [30, 41, 59]; // slate-800
        const textColor = [15, 23, 42]; // slate-950

        // Encabezado general (solo en la primera página)
        doc.setFillColor(...primaryColor);
        doc.rect(10, 10, 277, 15, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Consulta General de Pandillas', 15, 20);

        // Fecha y hora de generación
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const fechaHora = new Date().toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generado el: ${fechaHora}`, 15, 25);

        let startY = 30; // Posición inicial después del encabezado

        // Crear una tabla por cada pandilla
        currentResults.forEach((pandilla, index) => {
            // Cada pandilla comienza en una nueva página (excepto la primera)
            if (index > 0) {
                doc.addPage();
                startY = 20; // Sin encabezado en páginas siguientes
            }

            // Título de la pandilla
            doc.setFillColor(...secondaryColor);
            doc.rect(10, startY, 277, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Pandilla: ${pandilla.nombre || 'Sin nombre'}`, 15, startY + 6);
            startY += 10;

            // Tabla de información de la pandilla
            const infoHeaders = [['Campo', 'Valor']];
            const infoRows = [
                ['Líder', pandilla.lider || '-'],
                ['Número de Integrantes', (pandilla.numero_integrantes || 0).toString()],
                ['Peligrosidad', pandilla.peligrosidad || '-'],
                ['Zona', pandilla.zona_nombre || '-'],
                ['Dirección', pandilla.direccion || '-'],
                ['Descripción', pandilla.descripcion || '-'],
                ['Delitos', (pandilla.delitos && pandilla.delitos.length > 0) ? pandilla.delitos.map(d => d.nombre || d).join(', ') : '-'],
                ['Faltas', (pandilla.faltas && pandilla.faltas.length > 0) ? pandilla.faltas.map(f => f.falta || f.nombre || f).join(', ') : '-']
            ];

            doc.autoTable({
                startY: startY,
                head: infoHeaders,
                body: infoRows,
                theme: 'striped',
                headStyles: {
                    fillColor: secondaryColor,
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 9
                },
                bodyStyles: {
                    textColor: textColor,
                    fontSize: 8
                },
                alternateRowStyles: {
                    fillColor: [241, 245, 249]
                },
            margin: { top: startY, left: 10, right: 10, bottom: 10 },
            styles: {
                cellPadding: 3,
                overflow: 'linebreak',
                cellWidth: 'wrap',
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 60, fontStyle: 'bold' },
                1: { cellWidth: 'auto' }
            },
            didParseCell: function (data) {
                // Ajustar altura para descripción
                if (data.section === 'body' && data.column.index === 1 && data.row.index === 5) {
                    const descripcion = pandilla.descripcion || '';
                    if (descripcion.length > 80) {
                        const lineas = Math.ceil(descripcion.length / 80);
                        data.cell.minHeight = Math.max(8, lineas * 4 + 4);
                    }
                }
            },
            // Evitar espacios innecesarios
            tableWidth: 'wrap',
            showHead: 'firstPage'
            });

            startY = doc.lastAutoTable.finalY + 5;

            // Tabla de integrantes de la pandilla
            if (pandilla.integrantes && pandilla.integrantes.length > 0) {
                // Verificar si hay espacio suficiente en la página actual
                // Si no hay espacio (menos de 40mm disponibles), crear nueva página
                const espacioDisponible = doc.internal.pageSize.height - startY - 20; // 20mm para pie de página
                if (espacioDisponible < 40) {
                    doc.addPage();
                    startY = 20;
                }

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...textColor);
                doc.text(`Integrantes (${pandilla.integrantes.length}):`, 15, startY);
                startY += 5;

                const integrantesHeaders = [['Nombre Completo', 'Alias']];
                const integrantesRows = pandilla.integrantes.map(integrante => [
                    integrante.nombre_completo || integrante.nombre || '-',
                    integrante.alias || '-'
                ]);

                doc.autoTable({
                    startY: startY,
                    head: integrantesHeaders,
                    body: integrantesRows,
                    theme: 'striped',
                    headStyles: {
                        fillColor: secondaryColor,
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9
                    },
                    bodyStyles: {
                        textColor: textColor,
                        fontSize: 8
                    },
                    alternateRowStyles: {
                        fillColor: [241, 245, 249]
                    },
                    margin: { top: startY, left: 10, right: 10, bottom: 10 },
                    styles: {
                        cellPadding: 3,
                        overflow: 'linebreak',
                        cellWidth: 'wrap',
                        lineColor: [200, 200, 200],
                        lineWidth: 0.1
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' }
                    },
                    // Evitar espacios innecesarios
                    tableWidth: 'wrap',
                    showHead: 'firstPage'
                });

                startY = doc.lastAutoTable.finalY + 3;
            } else {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100, 100, 100);
                doc.text('No hay integrantes registrados para esta pandilla.', 15, startY);
                startY += 8;
            }

            // No agregar espacio extra al final, la siguiente pandilla comenzará en nueva página
        });

        // Resumen al final en una nueva página
        doc.addPage();
        const finalY = 20;
        doc.setFillColor(...secondaryColor);
        doc.rect(10, finalY, 277, 12, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const totalPandillas = currentResults.length;
        const totalIntegrantes = currentResults.reduce((sum, p) => sum + (p.integrantes ? p.integrantes.length : 0), 0);
        doc.text(`Total de pandillas: ${totalPandillas}`, 15, finalY + 7);
        doc.text(`Total de integrantes: ${totalIntegrantes}`, 15, finalY + 12);

        // Pie de página en cada página
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            const pieTexto1 = 'SIGP - Sistema de Identificación de Grupos Pandilleriles';
            const pieTexto2 = '© 2025, SIGP – Todos los derechos reservados';
            doc.text(pieTexto1, 15, doc.internal.pageSize.height - 10);
            doc.text(pieTexto2, doc.internal.pageSize.width - doc.getTextWidth(pieTexto2) - 15, doc.internal.pageSize.height - 10);
        }

        // Generar nombre de archivo
        const fechaArchivo = new Date().toISOString().split('T')[0];
        const nombreArchivo = `reporte_general_pandillas_${fechaArchivo}.pdf`;

        // Descargar PDF
        doc.save(nombreArchivo);

    } catch (error) {
        console.error('Error al generar PDF de pandillas generales:', error);
        alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
}

// Función auxiliar para obtener el texto del tipo de consulta
function getTipoConsultaTexto(tipo) {
    const tipos = {
        'eventos': 'Consulta por Eventos',
        'pandilla': 'Consulta por Pandilla',
        'integrante': 'Consulta por Integrante',
        'general': 'Consulta General de Pandillas'
    };
    return tipos[tipo] || 'Consulta';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Verificar que el usuario tenga permisos (admin o consultor)
    const isAuth = typeof isAuthenticated === 'function' ? isAuthenticated() : false;
    const rol = typeof getUserRol === 'function' ? getUserRol() : null;

    if (!isAuth || (rol !== 'admin' && rol !== 'consultor')) {
        // Si no está autenticado o no es admin/consultor, redirigir al inicio
        window.location.href = typeof getBasePath === 'function' && getBasePath() === '' ? 'index.html' : '../index.html';
        return;
    }

    const tipoSelect = document.getElementById('tipo-consulta-select');
    const formEventos = document.getElementById('form-buscar-eventos');
    const formPandilla = document.getElementById('form-buscar-pandilla');
    const formIntegrante = document.getElementById('form-buscar-integrante');
    const btnConsultaGeneral = document.getElementById('btn-consulta-general');
    const btnGenerarPDF = document.getElementById('btn-generar-pdf');

    // Event listener para cambio de tipo de consulta
    if (tipoSelect) {
        tipoSelect.addEventListener('change', handleTipoConsultaChange);
    }

    // Event listeners para formularios
    if (formEventos) {
        // Manejar cambio de modo de consulta (todos vs filtros)
        const modoConsultaRadios = document.querySelectorAll('input[name="modo-consulta-eventos"]');
        const filtrosContainer = document.getElementById('filtros-eventos-container');
        
        modoConsultaRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'todos') {
                    if (filtrosContainer) {
                        filtrosContainer.classList.add('hidden');
                    }
                    // Asegurar que las fechas no sean requeridas
                    const fechaInicial = document.getElementById('fecha-inicial-eventos');
                    const fechaFinal = document.getElementById('fecha-final-eventos');
                    if (fechaInicial) fechaInicial.removeAttribute('required');
                    if (fechaFinal) fechaFinal.removeAttribute('required');
                } else {
                    if (filtrosContainer) {
                        filtrosContainer.classList.remove('hidden');
                    }
                    // Hacer que las fechas sean requeridas solo cuando se muestran los filtros
                    const fechaInicial = document.getElementById('fecha-inicial-eventos');
                    const fechaFinal = document.getElementById('fecha-final-eventos');
                    if (fechaInicial) fechaInicial.setAttribute('required', 'required');
                    if (fechaFinal) fechaFinal.setAttribute('required', 'required');
                }
            });
        });
        
        // Inicializar estado: ocultar filtros y quitar required si "todos" está seleccionado
        const radioTodos = document.querySelector('input[name="modo-consulta-eventos"][value="todos"]');
        if (radioTodos && radioTodos.checked) {
            if (filtrosContainer) {
                filtrosContainer.classList.add('hidden');
            }
            const fechaInicial = document.getElementById('fecha-inicial-eventos');
            const fechaFinal = document.getElementById('fecha-final-eventos');
            if (fechaInicial) fechaInicial.removeAttribute('required');
            if (fechaFinal) fechaFinal.removeAttribute('required');
        }
        
        formEventos.addEventListener('submit', function (e) {
            e.preventDefault();
            const modoConsulta = document.querySelector('input[name="modo-consulta-eventos"]:checked')?.value || 'todos';
            const mostrarTodos = modoConsulta === 'todos';
            
            let fechaInicial = '';
            let fechaFinal = '';
            
            if (!mostrarTodos) {
                fechaInicial = document.getElementById('fecha-inicial-eventos').value;
                fechaFinal = document.getElementById('fecha-final-eventos').value;

                if (!fechaInicial || !fechaFinal) {
                    mostrarMensaje('error', 'Por favor, completa ambas fechas');
                    return;
                }

                if (fechaInicial > fechaFinal) {
                    mostrarMensaje('error', 'La fecha inicial debe ser anterior a la fecha final');
                    return;
                }
            }

            // Obtener filtros adicionales (solo si no es "mostrar todos")
            const tipoEvento = mostrarTodos ? '' : (document.getElementById('tipo-evento-filtro')?.value || '');
            const delitoFalta = mostrarTodos ? '' : (document.getElementById('delito-falta-filtro')?.value || '');
            const zonaId = mostrarTodos ? '' : (document.getElementById('filtro-zona-eventos')?.value || '');

            consultarEventos(fechaInicial, fechaFinal, tipoEvento, delitoFalta, zonaId, mostrarTodos);
        });
    }

    if (formPandilla) {
        formPandilla.addEventListener('submit', function (e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre-pandilla-buscar').value.trim();
            const zonaId = document.getElementById('filtro-zona-pandilla')?.value || '';
            const peligrosidad = document.getElementById('filtro-peligrosidad-pandilla')?.value || '';

            // Permitir búsqueda sin nombre si hay otros filtros
            consultarPandilla(nombre, zonaId, peligrosidad);
        });
    }

    if (formIntegrante) {
        formIntegrante.addEventListener('submit', function (e) {
            e.preventDefault();
            const busqueda = document.getElementById('busqueda-integrante').value.trim();

            // Obtener pandillas seleccionadas
            const pandillasCheckboxes = document.querySelectorAll('input[name="filtro_pandillas"]:checked');
            const pandillasIds = Array.from(pandillasCheckboxes).map(cb => cb.value);

            // Obtener zona seleccionada
            const zonaSelect = document.getElementById('filtro-zona-integrante');
            const zonaId = zonaSelect ? zonaSelect.value : '';

            // Obtener peligrosidad seleccionada
            const peligrosidadSelect = document.getElementById('filtro-peligrosidad-integrante');
            const peligrosidad = peligrosidadSelect ? peligrosidadSelect.value : '';

            // Obtener delitos seleccionados
            const delitosCheckboxes = document.querySelectorAll('input[name="filtro_delitos"]:checked');
            const delitosIds = Array.from(delitosCheckboxes).map(cb => cb.value);

            // Permitir búsqueda sin filtros (todos los integrantes), solo por nombre, solo por pandillas, o ambos
            consultarIntegrante(busqueda, pandillasIds, zonaId, peligrosidad, delitosIds);
        });
    }

    if (btnConsultaGeneral) {
        btnConsultaGeneral.addEventListener('click', consultaGeneralPandillas);
    }

    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', generarPDF);
    }

    // Botones de limpiar
    const btnLimpiarEventos = document.getElementById('limpiar-consulta-eventos');
    const btnLimpiarPandilla = document.getElementById('limpiar-consulta-pandilla');
    const btnLimpiarIntegrante = document.getElementById('limpiar-consulta-integrante');

    if (btnLimpiarEventos) {
        btnLimpiarEventos.addEventListener('click', limpiarConsulta);
    }
    if (btnLimpiarPandilla) {
        btnLimpiarPandilla.addEventListener('click', limpiarConsulta);
    }
    if (btnLimpiarIntegrante) {
        btnLimpiarIntegrante.addEventListener('click', limpiarConsulta);
    }
});












