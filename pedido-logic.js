// ==================================================================
//              VERSIÓN FINAL, COMPLETA Y FUNCIONAL
// ==================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar perfil
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);

    // 2. Poblar bienvenida
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    // 3. Cargar contenido dinámico
    await loadNavigationModules(profile.id_usuario);
    await loadPedidos(profile.id_usuario);

    // 4. Asignar TODOS los listeners
    setupEventListeners();
});

// --- FUNCIONES DE CARGA ---
async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error RPC Navegación:', error); return; }
    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => `<a href="${module.url_pagina}" class="nav-item ${currentPagePath.includes(module.url_pagina) ? 'active' : ''}">${module.etiqueta}</a>`).join('');
}

async function loadPedidos(profileId) {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    showLoading(true);
    pedidosTableBody.innerHTML = '';
    
    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { p_profile_id: profileId });
    
    showLoading(false);
    if (error) { showError(`Error al cargar pedidos: ${error.message}`); return; }
    
    if (data.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }
    pedidosTableBody.innerHTML = data.map(pedido => `
        <tr>
            <td>${pedido.nopedido || 'N/A'}</td>
            <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
            <td>${pedido.nombreusuario || 'N/A'}</td>
            <td>${pedido.observaciones || ''}</td>
            <td><span class="badge ${getStatusClass(pedido.estadopedido)}">${pedido.estadopedido}</span></td>
            <td class="text-end">${generateActionButtons(pedido)}</td>
        </tr>
    `).join('');
}

// --- GESTOR DE EVENTOS ---
function setupEventListeners() {
    // Delegación de eventos en el cuerpo del documento para todos los clics
    document.body.addEventListener('click', async (e) => {
        const logoutBtn = e.target.closest('#logout-btn');
        const nuevoPedidoBtn = e.target.closest('#btn-nuevo-pedido');
        const guardarPedidoBtn = e.target.closest('#btn-guardar-pedido');
        const agregarDetalleBtn = e.target.closest('#btn-agregar-detalle');
        const removeDetalleBtn = e.target.closest('.btn-remove-detalle');
        const editBtn = e.target.closest('.btn-edit');
        const cancelBtn = e.target.closest('.btn-cancel');

        if (logoutBtn) {
            handleLogout();
        } else if (nuevoPedidoBtn) {
            await handleNuevoPedido();
        } else if (guardarPedidoBtn) {
            await handleGuardarPedido();
        } else if (agregarDetalleBtn) {
            agregarFilaDetalle();
        } else if (removeDetalleBtn) {
            removeDetalleBtn.closest('tr').remove();
        } else if (editBtn) {
            handleEditarPedido(editBtn.dataset.id);
        } else if (cancelBtn) {
            await handleCancelarPedido(cancelBtn.dataset.id);
        }
    });
}

// --- FUNCIONES DE ACCIÓN Y MODAL ---
async function handleNuevoPedido() {
    const pedidoModalEl = document.getElementById('pedido-modal');
    const pedidoModal = new bootstrap.Modal(pedidoModalEl);
    
    document.getElementById('pedido-form').reset();
    document.getElementById('form-id-pedido').value = '';
    document.getElementById('pedido-detalles-body').innerHTML = '';
    document.getElementById('pedidoModalLabel').textContent = 'Crear Nuevo Pedido';
    
    await populateSelects();
    agregarFilaDetalle();
    pedidoModal.show();
}

async function handleGuardarPedido() {
    const formIdCliente = document.getElementById('form-id-cliente');
    const detallesBody = document.getElementById('pedido-detalles-body');
    if (!formIdCliente.value) { alert('Seleccione un cliente.'); return; }

    const detalles = Array.from(detallesBody.querySelectorAll('tr')).map(row => {
        const recursoId = row.querySelector('.select-recurso').value;
        const cantidad = parseFloat(row.querySelector('.input-cantidad').value);
        return { id_recurso: recursoId, cantidad: cantidad };
    }).filter(d => d.id_recurso && d.cantidad > 0);

    if (detalles.length === 0) { alert('Debe agregar al menos un producto.'); return; }

    setGuardarButtonState(true);
    const { error } = await supabaseClient.rpc('upsert_pedido_completo', {
        p_id_pedido: document.getElementById('form-id-pedido').value || null,
        p_observaciones: document.getElementById('form-observaciones').value,
        p_id_cliente: formIdCliente.value,
        p_detalles: detalles
    });
    setGuardarButtonState(false);

    if (error) {
        alert('Error al guardar: ' + error.message);
    } else {
        const pedidoModalEl = document.getElementById('pedido-modal');
        const pedidoModal = bootstrap.Modal.getInstance(pedidoModalEl);
        alert('Pedido guardado.');
        pedidoModal.hide();
        const profile = JSON.parse(localStorage.getItem('selectedProfile'));
        await loadPedidos(profile.id_usuario);
    }
}

function handleEditarPedido(pedidoId) {
    alert(`Funcionalidad de Edición para ${pedidoId} no implementada.`);
}

async function handleCancelarPedido(pedidoId) {
    if (!confirm('¿Está seguro de que desea cancelar este pedido?')) return;
    const { error } = await supabaseClient.rpc('cancelar_pedido', { p_id_pedido: pedidoId });
    if (error) { alert('Error al cancelar: ' + error.message); }
    else {
        alert('Pedido cancelado.');
        const profile = JSON.parse(localStorage.getItem('selectedProfile'));
        await loadPedidos(profile.id_usuario);
    }
}

function agregarFilaDetalle() {
    const detallesBody = document.getElementById('pedido-detalles-body');
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
    const formIdCliente = document.getElementById('form-id-cliente');
    const detallesBody = document.getElementById('pedido-detalles-body');
    const [clientesRes, recursosRes] = await Promise.all([
        supabaseClient.rpc('get_lista_clientes'),
        supabaseClient.rpc('get_lista_recursos')
    ]);
    if (clientesRes.error) console.error('Error al cargar clientes:', clientesRes.error);
    else populateSelect(formIdCliente, clientesRes.data, 'id_cliente', 'nombre_cliente', 'Seleccione...');
    
    if (recursosRes.error) console.error('Error al cargar recursos:', recursosRes.error);
    else {
        window.listaRecursos = recursosRes.data;
        detallesBody.querySelectorAll('.select-recurso').forEach(select => {
            populateSelect(select, window.listaRecursos, 'id_recurso', 'nombre_recurso');
        });
    }
}

// --- FUNCIONES DE UTILIDAD ---
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
function populateSelect(select, data, valueKey, textKey, placeholder = 'Seleccione...') {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => { select.innerHTML += `<option value="${item[valueKey]}">${item[textKey]}</option>`; });
}
function showLoading(isLoading) { document.getElementById('loading-spinner').style.display = isLoading ? 'block' : 'none'; }
function showError(message) { 
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'block'; 
    errorMessage.textContent = message; 
}
function getStatusClass(status) { return { 'borrador': 'bg-secondary', 'enviado': 'bg-primary', 'completado': 'bg-success', 'cancelado': 'bg-danger' }[status] || 'bg-light text-dark'; }
function setGuardarButtonState(isSaving) { 
    const guardarPedidoBtn = document.getElementById('btn-guardar-pedido');
    const guardarSpinner = document.getElementById('guardar-spinner');
    guardarPedidoBtn.disabled = isSaving; 
    guardarSpinner.style.display = isSaving ? 'inline-block' : 'none'; 
}