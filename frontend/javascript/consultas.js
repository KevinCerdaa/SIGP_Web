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
    
    switch(currentConsultaType) {
        case 'eventos':
            document.getElementById('form-consulta-eventos').classList.remove('hidden');
            break;
        case 'pandilla':
            document.getElementById('form-consulta-pandilla').classList.remove('hidden');
            break;
        case 'integrante':
            document.getElementById('form-consulta-integrante').classList.remove('hidden');
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
    document.getElementById('form-buscar-integrante')?.reset();
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
function mostrarResultadosTarjetas(data, tipo) {
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
            card.innerHTML = crearTarjetaPandilla(item);
        } else if (tipo === 'integrante') {
            card.innerHTML = crearTarjetaIntegrante(item);
        }
        
        tarjetasContainer.appendChild(card);
    });
}

// Función para crear tarjeta de pandilla
function crearTarjetaPandilla(pandilla) {
    return `
        <div class="flex flex-col gap-3">
            <h3 class="text-lg font-bold text-white">${pandilla.nombre || 'Sin nombre'}</h3>
            <div class="flex flex-col gap-2 text-sm text-blue-100">
                ${pandilla.lider ? `<p><span class="font-semibold">Líder:</span> ${pandilla.lider}</p>` : ''}
                ${pandilla.numero_integrantes ? `<p><span class="font-semibold">Integrantes:</span> ${pandilla.numero_integrantes}</p>` : ''}
                ${pandilla.peligrosidad ? `<p><span class="font-semibold">Peligrosidad:</span> ${pandilla.peligrosidad}</p>` : ''}
                ${pandilla.zona_nombre ? `<p><span class="font-semibold">Zona:</span> ${pandilla.zona_nombre}</p>` : ''}
                ${pandilla.descripcion ? `<p class="text-xs text-blue-200 mt-2">${pandilla.descripcion}</p>` : ''}
            </div>
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
function crearTarjetaIntegrante(integrante) {
    return `
        <div class="flex flex-col gap-3">
            <h3 class="text-lg font-bold text-white">${integrante.nombre_completo || integrante.nombre || 'Sin nombre'}</h3>
            <div class="flex flex-col gap-2 text-sm text-blue-100">
                ${integrante.alias ? `<p><span class="font-semibold">Alias:</span> ${integrante.alias}</p>` : ''}
                ${integrante.fecha_nacimiento ? `<p><span class="font-semibold">Fecha de Nacimiento:</span> ${integrante.fecha_nacimiento}</p>` : ''}
                ${integrante.pandilla_nombre ? `<p><span class="font-semibold">Pandilla:</span> ${integrante.pandilla_nombre}</p>` : ''}
                ${integrante.direccion ? `<p><span class="font-semibold">Dirección:</span> ${integrante.direccion}</p>` : ''}
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
                            ${integrante.faltas.map(f => `<li>• ${f.nombre || f}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Función para consultar eventos
async function consultarEventos(fechaInicial, fechaFinal) {
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
        
        console.log(`Consultando eventos desde ${fechaInicial} hasta ${fechaFinal}`);
        console.log(`Token disponible: ${token ? 'Sí' : 'No'}`);
        const response = await fetch(`http://localhost:8000/api/consultas/eventos/?fecha_inicial=${fechaInicial}&fecha_final=${fechaFinal}`, {
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
            evento.delito_nombre || evento.falta_nombre || '-',
            evento.integrante_nombre || '-',
            evento.pandilla_nombre || '-',
            evento.zona_nombre || '-',
            evento.direccion || '-',
            evento.descripcion || '-'
        ]);
        
        currentResults = data.eventos;
        currentFilters = { fecha_inicial: fechaInicial, fecha_final: fechaFinal };
        
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
async function consultarPandilla(nombre) {
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
        
        const response = await fetch(`http://localhost:8000/api/consultas/pandillas/?nombre=${encodeURIComponent(nombre)}`, {
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
        currentFilters = { nombre: nombre };
        
        mostrarResultadosTarjetas(data.pandillas, 'pandilla');
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
async function consultarIntegrante(busqueda) {
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
        
        console.log(`Consultando integrantes con búsqueda: "${busqueda}"`);
        const response = await fetch(`http://localhost:8000/api/consultas/integrantes/?busqueda=${encodeURIComponent(busqueda)}`, {
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
        currentFilters = { busqueda: busqueda };
        
        mostrarResultadosTarjetas(data.integrantes, 'integrante');
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
        
        // Preparar datos para la tabla
        const headers = ['Nombre', 'Líder', 'Número Integrantes', 'Peligrosidad', 'Zona', 'Dirección'];
        const rows = data.pandillas.map(pandilla => [
            pandilla.nombre || '-',
            pandilla.lider || '-',
            pandilla.numero_integrantes || '-',
            pandilla.peligrosidad || '-',
            pandilla.zona_nombre || '-',
            pandilla.direccion || '-'
        ]);
        
        currentResults = data.pandillas;
        currentFilters = {};
        
        mostrarResultadosTabla(headers, rows);
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
        
        switch(currentConsultaType) {
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
                headers = ['Nombre', 'Líder', 'Integrantes', 'Peligrosidad', 'Zona', 'Dirección'];
                rows = currentResults.map(pandilla => [
                    pandilla.nombre || '-',
                    pandilla.lider || '-',
                    pandilla.numero_integrantes || '0',
                    pandilla.peligrosidad || '-',
                    pandilla.zona_nombre || '-',
                    pandilla.direccion || '-'
                ]);
                tituloTabla = 'Pandillas Encontradas';
                break;
                
            case 'integrante':
                headers = ['Nombre Completo', 'Alias', 'Fecha Nacimiento', 'Pandilla', 'Dirección'];
                rows = currentResults.map(integrante => [
                    integrante.nombre_completo || integrante.nombre || '-',
                    integrante.alias || '-',
                    integrante.fecha_nacimiento || '-',
                    integrante.pandilla_nombre || '-',
                    integrante.direccion || '-'
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
                fontSize: 8
            },
            alternateRowStyles: {
                fillColor: [241, 245, 249] // slate-100
            },
            margin: { top: 40, left: 10, right: 10 },
            styles: {
                cellPadding: 2,
                overflow: 'linebreak',
                cellWidth: 'wrap'
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 'auto' },
                5: { cellWidth: 'auto' },
                6: { cellWidth: 'auto' }
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
document.addEventListener('DOMContentLoaded', function() {
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
        formEventos.addEventListener('submit', function(e) {
            e.preventDefault();
            const fechaInicial = document.getElementById('fecha-inicial-eventos').value;
            const fechaFinal = document.getElementById('fecha-final-eventos').value;
            
            if (!fechaInicial || !fechaFinal) {
                mostrarMensaje('error', 'Por favor, completa ambas fechas');
                return;
            }
            
            if (fechaInicial > fechaFinal) {
                mostrarMensaje('error', 'La fecha inicial debe ser anterior a la fecha final');
                return;
            }
            
            consultarEventos(fechaInicial, fechaFinal);
        });
    }
    
    if (formPandilla) {
        formPandilla.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre-pandilla-buscar').value.trim();
            
            if (!nombre) {
                mostrarMensaje('error', 'Por favor, ingresa un nombre de pandilla');
                return;
            }
            
            consultarPandilla(nombre);
        });
    }
    
    if (formIntegrante) {
        formIntegrante.addEventListener('submit', function(e) {
            e.preventDefault();
            const busqueda = document.getElementById('busqueda-integrante').value.trim();
            
            if (!busqueda) {
                mostrarMensaje('error', 'Por favor, ingresa un nombre o alias');
                return;
            }
            
            consultarIntegrante(busqueda);
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












