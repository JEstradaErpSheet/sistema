// /pedido-logic.js

// --- INICIO: ELEMENTOS DEL DOM ---
// Guardamos referencias a los elementos HTML que vamos a manipular frecuentemente.
const welcomeMessage = document.getElementById('welcome-message');
const navContainer = document.getElementById('module-navigation-bar');
const pedidosTableBody = document.getElementById('pedidos-table-body');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const nuevoPedidoBtn = document.getElementById('btn-nuevo-pedido');

// Elementos del Modal
const pedidoModalEl = document.getElementById('pedido-modal');
const pedidoModal = new bootstrap.Modal(pedidoModalEl); // Objeto Modal de Bootstrap
const pedidoModalLabel = document.getElementById('pedidoModalLabel');
const pedidoForm = document.getElementById('pedido-form');
const formIdPedido = document.getElementById('form-id-pedido');
const formIdCliente = document.getElementById('form-id-cliente');
const formObservaciones = document.getElementById('form-observaciones');
const detallesBody = document.getElementById('pedido-detalles-body');
const agregarDetalleBtn = document.getElementById('btn-agregar-detalle');
const guardarPedidoBtn = document.getElementById('btn-guardar-pedido');
const guardarSpinner = document.getElementById('guardar-spinner');

// --- FIN: ELEMENTOS DEL DOM ---


// --- INICIO: LÓGICA DE ARRANQUE Y NAVEGACIÓN (Estándar del Sistema) ---

// El evento DOMContentLoaded se dispara cuando el HTML ha sido completamente cargado.
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación de perfil activo (lógica de seguridad estándar)
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        alert('No se ha seleccionado un perfil. Redirigiendo...');
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    // 2. Cargar la barra de navegación superior (reutilizando la lógica de otros módulos)
    await loadNavigationModules(profile.id_usuario);

    // 3. Cargar la vista principal del módulo de pedidos
    await loadPedidos();

    // 4. Configurar todos los event listeners de la página (botones, etc.)
    setupEventListeners();
});

/**
 * Carga los módulos permitidos para el perfil y los muestra en la barra de navegación.
 * @param {string} profileId - El ID del perfil del usuario activo.
 */
async function loadNavigationModules(profileId) {
    // Esta lógica es idéntica a la de tus otros módulos para mantener la consistencia.
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });

    if (error) {
        console.error('Error al cargar módulos de navegación:', error);
        navContainer.innerHTML = '<a href="/home.html" class="nav-item">Error</a>';
        return;
    }

    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => {
        const isActive = currentPagePath.includes(module.url_pagina);
        return `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}

// --- FIN: LÓGICA DE ARRANQUE Y NAVEGACIÓN ---


// --- INICIO: LÓGICA ESPECÍFICA DEL MÓDULO DE PEDIDOS ---

/**
 * Función principal para obtener los pedidos desde el backend y dibujarlos en la tabla.
 */
async function loadPedidos() {
    showLoading(true);
    pedidosTableBody.innerHTML = '';

    const { data, error } = await supabaseClient.rpc('get_pedidos_vista');

    showLoading(false);
    if (error) {
        showError('Error al cargar los pedidos: ' + error.message);
        console.error(error);
        return;
    }

    if (data.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }

    // Por cada pedido en los datos, creamos una fila en la tabla.
    data.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pedido.nopedido || 'N/A'}</td>
            <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
            <td>${pedido.nombreusuario || 'N/A'}</td>
            <td>${pedido.observaciones || ''}</td>
            <td><span class="badge ${getStatusClass(pedido.estadopedido)}">${pedido.estadopedido}</span></td>
            <td class="text-end">
                ${generateActionButtons(pedido)}
            </td>
        `;
        pedidosTableBody.appendChild(tr);
    });
}

/**
 * Genera los botones de acción (Editar, Cancelar) según el estado del pedido.
 * @param {object} pedido - El objeto del pedido.
 */
function generateActionButtons(pedido) {
    let buttons = '';
    // Solo se puede editar si está en 'borrador'.
    if (pedido.estadopedido === 'borrador') {
        buttons += `<button class="btn btn-warning btn-sm btn-edit" data-id="${pedido.id_pedido}" title="Editar Pedido"><i class="bi bi-pencil"></i></button>`;
    }
    // Solo se puede cancelar si está 'enviado'.
    if (pedido.estadopedido === 'enviado') {
        buttons += `<button class="btn btn-danger btn-sm btn-cancel ms-2" data-id="${pedido.id_pedido}" title="Cancelar Pedido"><i class="bi bi-x-circle"></i></button>`;
    }
    // Podríamos añadir un botón de 'Ver' para todos los estados.
    // buttons += `<button class="btn btn-info btn-sm btn-view ms-2" data-id="${pedido.id_pedido}" title="Ver Detalles"><i class="bi bi-eye"></i></button>`;
    return buttons;
}

/**
 * Configura todos los manejadores de eventos para la página.
 */
function setupEventListeners() {
    // Botón para abrir el modal de nuevo pedido
    nuevoPedidoBtn.addEventListener('click', handleNuevoPedido);

    // Botón para guardar el pedido (dentro del modal)
    guardarPedidoBtn.addEventListener('click', handleGuardarPedido);
    
    // Botón para agregar una nueva fila de detalle en el modal
    agregarDetalleBtn.addEventListener('click', agregarFilaDetalle);

    // Delegación de eventos para los botones de la tabla (editar, cancelar) y del modal (borrar detalle)
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit')) {
            const pedidoId = e.target.closest('.btn-edit').dataset.id;
            handleEditarPedido(pedidoId);
        }
        if (e.target.closest('.btn-cancel')) {
            const pedidoId = e.target.closest('.btn-cancel').dataset.id;
            handleCancelarPedido(pedidoId);
        }
        if (e.target.closest('.btn-remove-detalle')) {
            e.target.closest('tr').remove();
        }
    });
}

/**
 * Maneja la creación de un nuevo pedido.
 */
async function handleNuevoPedido() {
    pedidoForm.reset();
    formIdPedido.value = '';
    detallesBody.innerHTML = '';
    pedidoModalLabel.textContent = 'Crear Nuevo Pedido';
    await populateSelects(); // Carga clientes y recursos en los selects
    agregarFilaDetalle(); // Agrega una primera línea de detalle vacía
    pedidoModal.show();
}

/**
 * Maneja la edición de un pedido existente. (Función a implementar si es necesaria)
 */
async function handleEditarPedido(pedidoId) {
    // TODO: Implementar la carga de datos de un pedido existente para edición.
    // 1. Crear una RPC en Supabase `get_pedido_details(p_id_pedido)` que devuelva la cabecera y los detalles.
    // 2. Llamar a esa RPC.
    // 3. Poblar el formulario del modal con los datos recibidos.
    // 4. Mostrar el modal.
    alert(`Funcionalidad de Edición para el pedido ${pedidoId} no implementada aún.`);
}


/**
 * Maneja la cancelación de un pedido.
 * @param {string} pedidoId - El ID del pedido a cancelar.
 */
async function handleCancelarPedido(pedidoId) {
    if (!confirm('¿Está seguro de que desea cancelar este pedido? Esta acción no se puede deshacer.')) {
        return;
    }
    const { error } = await supabaseClient.rpc('cancelar_pedido', { p_id_pedido: pedidoId });
    if (error) {
        alert('Error al cancelar el pedido: ' + error.message);
    } else {
        alert('Pedido cancelado exitosamente.');
        await loadPedidos(); // Recargar la lista
    }
}

/**
 * Maneja el guardado de un pedido (nuevo o existente).
 */
async function handleGuardarPedido() {
    // Validar cliente
    if (!formIdCliente.value) {
        alert('Por favor, seleccione un cliente.');
        return;
    }

    // Recolectar datos de los detalles
    const detalles = [];
    const detalleRows = detallesBody.querySelectorAll('tr');
    let hasValidDetails = false;
    detalleRows.forEach(row => {
        const recursoId = row.querySelector('.select-recurso').value;
        const cantidad = parseFloat(row.querySelector('.input-cantidad').value);
        if (recursoId && cantidad > 0) {
            detalles.push({ id_recurso: recursoId, cantidad: cantidad });
            hasValidDetails = true;
        }
    });

    if (!hasValidDetails) {
        alert('Debe agregar al menos un producto con una cantidad válida.');
        return;
    }

    setGuardarButtonState(true); // Bloquear botón y mostrar spinner

    // Llamar a la RPC de Supabase para guardar
    const { data, error } = await supabaseClient.rpc('upsert_pedido_completo', {
        p_id_pedido: formIdPedido.value || null,
        p_observaciones: formObservaciones.value,
        p_id_cliente: formIdCliente.value,
        p_detalles: detalles
    });

    setGuardarButtonState(false); // Desbloquear botón

    if (error) {
        alert('Error al guardar el pedido: ' + error.message);
        console.error(error);
    } else {
        alert('Pedido guardado exitosamente.');
        pedidoModal.hide();
        await loadPedidos(); // Recargar la lista de pedidos
    }
}

/**
 * Agrega una nueva fila en blanco a la tabla de detalles del modal.
 */
function agregarFilaDetalle() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><select class="form-select form-select-sm select-recurso"><option value="">Cargando recursos...</option></select></td>
        <td><input type="number" class="form-control form-control-sm input-cantidad" value="1" min="1"></td>
        <td class="text-end"><button type="button" class="btn btn-danger btn-sm btn-remove-detalle" title="Eliminar Fila"><i class="bi bi-trash"></i></button></td>
    `;
    detallesBody.appendChild(newRow);
    // Poblar el nuevo select con los recursos ya cargados (si existen)
    if (window.listaRecursos) {
        populateSelect(newRow.querySelector('.select-recurso'), window.listaRecursos, 'id_recurso', 'nombre_recurso');
    }
}

/**
 * Carga los datos para los selects de Clientes y Recursos.
 */
async function populateSelects() {
    // Usamos Promise.all para cargar ambos en paralelo, es más eficiente.
    const [clientesRes, recursosRes] = await Promise.all([
        supabaseClient.rpc('get_lista_clientes'),
        supabaseClient.rpc('get_lista_recursos')
    ]);

    if (clientesRes.error) console.error('Error al cargar clientes:', clientesRes.error);
    else populateSelect(formIdCliente, clientesRes.data, 'id_cliente', 'nombre_cliente', 'Seleccione un cliente...');
    
    if (recursosRes.error) console.error('Error al cargar recursos:', recursosRes.error);
    else {
        // Guardamos la lista de recursos en una variable global de 'window'
        // para no tener que volver a pedirla cada vez que se agrega una fila.
        window.listaRecursos = recursosRes.data;
        // poblamos el primer select que ya existe
        const primerSelect = detallesBody.querySelector('.select-recurso');
        if(primerSelect) {
            populateSelect(primerSelect, window.listaRecursos, 'id_recurso', 'nombre_recurso');
        }
    }
}

// --- INICIO: FUNCIONES DE UTILIDAD ---

/**
 * Función genérica para poblar un elemento <select>.
 * @param {HTMLElement} selectElement - El elemento <select>.
 * @param {Array} data - El array de objetos para las opciones.
 * @param {string} valueKey - La clave del objeto para el 'value' de la opción.
 * @param {string} textKey - La clave del objeto para el texto de la opción.
 * @param {string} [placeholder='Seleccione...'] - Texto para la primera opción deshabilitada.
 */
function populateSelect(selectElement, data, valueKey, textKey, placeholder = 'Seleccione...') {
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        selectElement.appendChild(option);
    });
}

function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
    errorMessage.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Devuelve una clase de Bootstrap para el color del badge según el estado.
function getStatusClass(status) {
    const statusMap = {
        'borrador': 'bg-secondary',
        'enviado': 'bg-primary',
        'completado': 'bg-success',
        'cancelado': 'bg-danger'
    };
    return statusMap[status] || 'bg-light text-dark';
}

// Habilita/deshabilita el botón de guardar y muestra/oculta el spinner.
function setGuardarButtonState(isSaving) {
    guardarPedidoBtn.disabled = isSaving;
    guardarSpinner.style.display = isSaving ? 'inline-block' : 'none';
}

// --- FIN: FUNCIONES DE UTILIDAD ---