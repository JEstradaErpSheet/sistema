alert('¡pedido-logic.js se está ejecutando!');

// --- INICIO: ELEMENTOS DEL DOM ---
const welcomeMessage = document.getElementById('welcome-message');
const navContainer = document.getElementById('module-navigation-bar');
const pedidosTableBody = document.getElementById('pedidos-table-body');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const nuevoPedidoBtn = document.getElementById('btn-nuevo-pedido');

// Elementos del Modal
const pedidoModalEl = document.getElementById('pedido-modal');
const pedidoModal = new bootstrap.Modal(pedidoModalEl);
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


// --- INICIO: LÓGICA DE ARRANQUE Y NAVEGACIÓN ---

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación de perfil activo
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

    // 2. Cargar la barra de navegación superior
    await loadNavigationModules(profile.id_usuario);

    // 3. Cargar la vista principal del módulo
    await loadPedidos();

    // 4. Configurar todos los event listeners
    setupEventListeners();
});

async function loadNavigationModules(profileId) {
    if (!supabaseClient) {
        console.error("Supabase client no está disponible.");
        return;
    }
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

// --- FIN: LÓGICA DE ARRANQUE ---


// --- INICIO: LÓGICA ESPECÍFICA DEL MÓDULO ---

async function loadPedidos() {
    showLoading(true);
    pedidosTableBody.innerHTML = '';

    const profile = JSON.parse(localStorage.getItem('selectedProfile'));
    if (!profile) {
        showError('Error crítico: No se pudo encontrar el perfil seleccionado.');
        return;
    }

    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { 
        p_profile_id: profile.id_usuario 
    });

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

    data.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pedido.nopedido || 'N/A'}</td>
            <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
            <td>${pedido.nombreusuario || 'N/A'}</td>
            <td>${pedido.observaciones || ''}</td>
            <td><span class="badge ${getStatusClass(pedido.estadopedido)}">${pedido.estadopedido}</span></td>
            <td class="text-end">${generateActionButtons(pedido)}</td>
        `;
        pedidosTableBody.appendChild(tr);
    });
}

function generateActionButtons(pedido) {
    let buttons = '';
    if (pedido.estadopedido === 'borrador') {
        buttons += `<button class="btn btn-warning btn-sm btn-edit" data-id="${pedido.id_pedido}" title="Editar Pedido"><i class="bi bi-pencil"></i></button>`;
    }
    if (pedido.estadopedido === 'enviado') {
        buttons += `<button class="btn btn-danger btn-sm btn-cancel ms-2" data-id="${pedido.id_pedido}" title="Cancelar Pedido"><i class="bi bi-x-circle"></i></button>`;
    }
    return buttons;
}

function setupEventListeners() {
    nuevoPedidoBtn.addEventListener('click', handleNuevoPedido);
    guardarPedidoBtn.addEventListener('click', handleGuardarPedido);
    agregarDetalleBtn.addEventListener('click', agregarFilaDetalle);

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

async function handleNuevoPedido() {
    pedidoForm.reset();
    formIdPedido.value = '';
    detallesBody.innerHTML = '';
    pedidoModalLabel.textContent = 'Crear Nuevo Pedido';
    await populateSelects();
    agregarFilaDetalle();
    pedidoModal.show();
}

function handleEditarPedido(pedidoId) {
    alert(`Funcionalidad de Edición para el pedido ${pedidoId} no implementada aún.`);
}

async function handleCancelarPedido(pedidoId) {
    if (!confirm('¿Está seguro de que desea cancelar este pedido?')) {
        return;
    }
    const { error } = await supabaseClient.rpc('cancelar_pedido', { p_id_pedido: pedidoId });
    if (error) {
        alert('Error al cancelar el pedido: ' + error.message);
    } else {
        alert('Pedido cancelado exitosamente.');
        await loadPedidos();
    }
}

async function handleGuardarPedido() {
    if (!formIdCliente.value) {
        alert('Por favor, seleccione un cliente.');
        return;
    }
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

    setGuardarButtonState(true);

    const { error } = await supabaseClient.rpc('upsert_pedido_completo', {
        p_id_pedido: formIdPedido.value || null,
        p_observaciones: formObservaciones.value,
        p_id_cliente: formIdCliente.value,
        p_detalles: detalles
    });

    setGuardarButtonState(false);

    if (error) {
        alert('Error al guardar el pedido: ' + error.message);
        console.error(error);
    } else {
        alert('Pedido guardado exitosamente.');
        pedidoModal.hide();
        await loadPedidos();
    }
}

function agregarFilaDetalle() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><select class="form-select form-select-sm select-recurso"><option value="">Cargando...</option></select></td>
        <td><input type="number" class="form-control form-control-sm input-cantidad" value="1" min="1"></td>
        <td class="text-end"><button type="button" class="btn btn-danger btn-sm btn-remove-detalle" title="Eliminar Fila"><i class="bi bi-trash"></i></button></td>
    `;
    detallesBody.appendChild(newRow);
    if (window.listaRecursos) {
        populateSelect(newRow.querySelector('.select-recurso'), window.listaRecursos, 'id_recurso', 'nombre_recurso');
    }
}

async function populateSelects() {
    const [clientesRes, recursosRes] = await Promise.all([
        supabaseClient.rpc('get_lista_clientes'),
        supabaseClient.rpc('get_lista_recursos')
    ]);

    if (clientesRes.error) console.error('Error al cargar clientes:', clientesRes.error);
    else populateSelect(formIdCliente, clientesRes.data, 'id_cliente', 'nombre_cliente', 'Seleccione un cliente...');
    
    if (recursosRes.error) console.error('Error al cargar recursos:', recursosRes.error);
    else {
        window.listaRecursos = recursosRes.data;
        const primerSelect = detallesBody.querySelector('.select-recurso');
        if(primerSelect) {
            populateSelect(primerSelect, window.listaRecursos, 'id_recurso', 'nombre_recurso');
        }
    }
}

// --- INICIO: FUNCIONES DE UTILIDAD ---

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

function getStatusClass(status) {
    const statusMap = {
        'borrador': 'bg-secondary',
        'enviado': 'bg-primary',
        'completado': 'bg-success',
        'cancelado': 'bg-danger'
    };
    return statusMap[status] || 'bg-light text-dark';
}

function setGuardarButtonState(isSaving) {
    guardarPedidoBtn.disabled = isSaving;
    guardarSpinner.style.display = isSaving ? 'inline-block' : 'none';
}

// --- FIN: FUNCIONES DE UTILIDAD ---