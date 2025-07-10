// ==================================================================
//              VERSIÓN FINAL Y FUNCIONAL
// ==================================================================

// --- INICIO: ELEMENTOS DEL DOM ---
const welcomeMessage = document.getElementById('welcome-message');
const navContainer = document.getElementById('module-navigation-bar');
const pedidosTableBody = document.getElementById('pedidos-table-body');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const nuevoPedidoBtn = document.getElementById('btn-nuevo-pedido');

const pedidoModalEl = document.getElementById('pedido-modal');
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


// --- INICIO: LÓGICA DE ARRANQUE ---
document.addEventListener('DOMContentLoaded', async () => {
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }
    await loadNavigationModules(profile.id_usuario);
    await loadPedidos();
    setupEventListeners();
});

async function loadNavigationModules(profileId) {
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error en RPC de navegación:', error); return; }
    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => {
        const isActive = currentPagePath.includes(module.url_pagina);
        return `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}
// --- FIN: LÓGICA DE ARRANQUE ---


// --- INICIO: LÓGICA DEL MÓDULO ---
async function loadPedidos() {
    showLoading(true);
    pedidosTableBody.innerHTML = '';
    const profile = JSON.parse(localStorage.getItem('selectedProfile'));
    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { p_profile_id: profile.id_usuario });
    showLoading(false);
    if (error) { showError('Error al cargar los pedidos: ' + error.message); return; }
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
    document.body.addEventListener('click', async (e) => {
        if (e.target.closest('.btn-edit')) {
            handleEditarPedido(e.target.closest('.btn-edit').dataset.id);
        }
        if (e.target.closest('.btn-cancel')) {
            await handleCancelarPedido(e.target.closest('.btn-cancel').dataset.id);
        }
        if (e.target.closest('.btn-remove-detalle')) {
            e.target.closest('tr').remove();
        }
    });
}

async function handleNuevoPedido() {
    // La corrección clave: se crea el objeto Modal justo cuando se necesita.
    const pedidoModal = new bootstrap.Modal(pedidoModalEl);
    pedidoForm.reset();
    formIdPedido.value = '';
    detallesBody.innerHTML = '';
    pedidoModalLabel.textContent = 'Crear Nuevo Pedido';
    await populateSelects();
    agregarFilaDetalle();
    pedidoModal.show();
}

function handleEditarPedido(pedidoId) {
    alert(`Funcionalidad de Edición para ${pedidoId} no implementada.`);
}

async function handleCancelarPedido(pedidoId) {
    if (!confirm('¿Está seguro de que desea cancelar este pedido?')) return;
    const { error } = await supabaseClient.rpc('cancelar_pedido', { p_id_pedido: pedidoId });
    if (error) { alert('Error al cancelar: ' + error.message); }
    else { alert('Pedido cancelado.'); await loadPedidos(); }
}

async function handleGuardarPedido() {
    if (!formIdCliente.value) { alert('Seleccione un cliente.'); return; }
    const detalles = [];
    detallesBody.querySelectorAll('tr').forEach(row => {
        const recursoId = row.querySelector('.select-recurso').value;
        const cantidad = parseFloat(row.querySelector('.input-cantidad').value);
        if (recursoId && cantidad > 0) { detalles.push({ id_recurso: recursoId, cantidad: cantidad }); }
    });
    if (detalles.length === 0) { alert('Debe agregar al menos un producto.'); return; }
    setGuardarButtonState(true);
    const { error } = await supabaseClient.rpc('upsert_pedido_completo', {
        p_id_pedido: formIdPedido.value || null,
        p_observaciones: formObservaciones.value,
        p_id_cliente: formIdCliente.value,
        p_detalles: detalles
    });
    setGuardarButtonState(false);
    if (error) { alert('Error al guardar: ' + error.message); }
    else {
        // Obtenemos la instancia del modal para poder cerrarlo.
        const pedidoModal = bootstrap.Modal.getInstance(pedidoModalEl);
        alert('Pedido guardado.');
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
    if (clientesRes.error) { console.error('Error al cargar clientes:', clientesRes.error); }
    else { populateSelect(formIdCliente, clientesRes.data, 'id_cliente', 'nombre_cliente', 'Seleccione...'); }
    if (recursosRes.error) { console.error('Error al cargar recursos:', recursosRes.error); }
    else {
        window.listaRecursos = recursosRes.data;
        detallesBody.querySelectorAll('.select-recurso').forEach(select => {
            populateSelect(select, window.listaRecursos, 'id_recurso', 'nombre_recurso');
        });
    }
}

function populateSelect(select, data, valueKey, textKey, placeholder = 'Seleccione...') {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => { select.innerHTML += `<option value="${item[valueKey]}">${item[textKey]}</option>`; });
}
function showLoading(isLoading) { loadingSpinner.style.display = isLoading ? 'block' : 'none'; }
function showError(message) { errorMessage.style.display = 'block'; errorMessage.textContent = message; }
function getStatusClass(status) { return { 'borrador': 'bg-secondary', 'enviado': 'bg-primary', 'completado': 'bg-success', 'cancelado': 'bg-danger' }[status] || 'bg-light text-dark'; }
function setGuardarButtonState(isSaving) { guardarPedidoBtn.disabled = isSaving; guardarSpinner.style.display = isSaving ? 'inline-block' : 'none'; }