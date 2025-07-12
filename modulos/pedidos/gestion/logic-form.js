// Archivo: /modulos/pedidos/gestion/logic-form.js
// Versión Final: Integra Unidad de Medida y Precios Dinámicos.

document.addEventListener('DOMContentLoaded', async () => {
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) { window.location.href = '/select-profile.html'; return; }
    const profile = JSON.parse(profileString);
    
    document.getElementById('welcome-message').textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    await renderForm(profile);
});

async function renderForm(profile) {
    const formContainer = document.getElementById('form-container');
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    const { data, error } = await supabaseClient.rpc('get_data_for_gestion_form', { p_profile_id: profile.id_usuario, p_pedido_id: pedidoId });
    if (error) { formContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`; return; }

    const pedidoData = data.pedido_data ? data.pedido_data.pedido_header : null;
    const detallesData = data.pedido_data ? data.pedido_data.pedido_detalles : [];
    const listas = data.listas;
    
    if (pedidoData) { document.getElementById('form-breadcrumb-title').textContent = `Editando: ${pedidoData.nopedido || pedidoData.id_pedido}`; }

    formContainer.innerHTML = `
        <form id="pedido-form" onsubmit="return false;">
            <input type="hidden" id="form-id-pedido" value="${pedidoData ? pedidoData.id_pedido : ''}">
            <div class="row mb-3"><div class="col-md-6">
                <label for="form-id-cliente" class="form-label">Cliente</label>
                <select class="form-select" id="form-id-cliente" required></select>
            </div></div>
            <div class="mb-3">
                <label for="form-observaciones" class="form-label">Observaciones</label>
                <textarea class="form-control" id="form-observaciones">${pedidoData ? pedidoData.observaciones || '' : ''}</textarea>
            </div>
            <hr><h5 class="mb-3">Detalles del Pedido</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead><tr>
                        <th style="width: 45%;">Recurso/Producto</th>
                        <th class="text-center" style="width: 10%;">UM</th>
                        <th class="text-end" style="width: 15%;">Cantidad</th>
                        <th class="text-end" style="width: 15%;">Precio Unit.</th>
                        <th class="text-end" style="width: 15%;">Subtotal</th>
                        <th class="text-center"></th>
                    </tr></thead>
                    <tbody id="pedido-detalles-body"></tbody>
                    <tfoot><tr>
                        <td colspan="4" class="text-end border-0 fs-5"><strong>Total General:</strong></td>
                        <td class="text-end fw-bold border-0 fs-5">C$ <span id="grand-total">0.00</span></td>
                        <td class="border-0"></td>
                    </tr></tfoot>
                </table>
            </div>
            <button type="button" id="btn-agregar-detalle" class="btn btn-outline-success btn-sm"><i class="bi bi-plus-lg"></i> Agregar Producto</button>
            <div class="mt-4 text-end">
                <a href="./" class="btn btn-secondary">Cancelar</a>
                <button type="button" id="btn-guardar-pedido" class="btn btn-primary">
                    <span id="guardar-spinner" class="spinner-border spinner-border-sm" style="display: none;"></span> Guardar Pedido
                </button>
            </div>
        </form>`;

    const selectCliente = document.getElementById('form-id-cliente');
    populateSelect(selectCliente, listas.clientes, 'id_cliente', 'nombre_cliente', 'Seleccione...');
    
    if (pedidoData && pedidoData.id_cliente) {
        selectCliente.value = pedidoData.id_cliente;
    }

    window.listaRecursos = listas.recursos || [];
    
    if (detallesData && detallesData.length > 0) {
        for (const detalle of detallesData) { await addDetalleRow(detalle); }
    } else {
        addDetalleRow();
    }
    updateGrandTotal();
    setupFormEventListeners(profile.id_usuario);
}

async function addDetalleRow(detalle = {}) {
    const template = document.getElementById('detalle-row-template');
    if (!template) return;
    const newRow = template.content.cloneNode(true);
    const select = newRow.querySelector('.select-recurso');
    
    populateSelect(select, window.listaRecursos, 'id_recurso', 'nombre_recurso', 'Seleccione...');
    
    if (detalle.id_recurso) { select.value = detalle.id_recurso; }
    if (detalle.cantidad) { newRow.querySelector('.input-cantidad').value = detalle.cantidad; }
    
    document.getElementById('pedido-detalles-body').appendChild(newRow);

    if (detalle.id_recurso) {
        await updateRowData(document.getElementById('pedido-detalles-body').lastElementChild);
    }
}

function setupFormEventListeners(profileId){
    const formContainer = document.getElementById('form-container');
    formContainer.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.closest('#btn-agregar-detalle')) { addDetalleRow(); }
        if (target.closest('.btn-remove-detalle')) { target.closest('tr').remove(); updateGrandTotal(); }
        if (target.closest('#btn-guardar-pedido')) { await handleGuardarPedido(profileId); }
    });
    formContainer.addEventListener('change', async (event) => {
        const target = event.target;
        if (target.classList.contains('select-recurso') || target.classList.contains('input-cantidad')) {
            await updateRowData(target.closest('tr'));
        }
    });
}

async function updateRowData(row) {
    const selectRecurso = row.querySelector('.select-recurso');
    const inputCantidad = row.querySelector('.input-cantidad');
    const spanUm = row.querySelector('.input-um');
    const spanPrecio = row.querySelector('.input-precio');
    const spanSubtotal = row.querySelector('.input-subtotal');
    const clienteId = document.getElementById('form-id-cliente').value;
    const recursoId = selectRecurso.value;
    const cantidad = parseFloat(inputCantidad.value) || 0;

    if (!recursoId || !clienteId) {
        spanUm.textContent = '--'; spanPrecio.textContent = '0.00'; spanSubtotal.textContent = '0.00';
        updateGrandTotal(); return;
    }
    const recursoSeleccionado = window.listaRecursos.find(r => r.id_recurso === recursoId);
    spanUm.textContent = recursoSeleccionado ? recursoSeleccionado.unidad_medida : '??';

    const { data: precio, error } = await supabaseClient.rpc('get_precio_producto', { p_id_recurso: recursoId, p_id_cliente: clienteId });
    if (error) { console.error('Error precio:', error); return; }

    const precioUnitario = parseFloat(precio) || 0;
    const subtotal = cantidad * precioUnitario;
    spanPrecio.textContent = precioUnitario.toFixed(2);
    spanSubtotal.textContent = subtotal.toFixed(2);
    updateGrandTotal();
}

function updateGrandTotal() {
    let total = 0;
    document.querySelectorAll('.input-subtotal').forEach(span => { total += parseFloat(span.textContent) || 0; });
    document.getElementById('grand-total').textContent = total.toFixed(2);
}

async function handleGuardarPedido(profileId) {
    const guardarBtn = document.getElementById('btn-guardar-pedido');
    const spinner = document.getElementById('guardar-spinner');
    const pedidoId = document.getElementById('form-id-pedido').value;
    const clienteId = document.getElementById('form-id-cliente').value;
    const observaciones = document.getElementById('form-observaciones').value;
    const detalles = Array.from(document.querySelectorAll('#pedido-detalles-body tr')).map(row => ({
        id_recurso: row.querySelector('.select-recurso').value,
        cantidad: row.querySelector('.input-cantidad').value
    })).filter(d => d.id_recurso && parseFloat(d.cantidad) > 0);

    if (!clienteId || detalles.length === 0) { alert('Debe seleccionar un cliente y agregar al menos un producto.'); return; }
    guardarBtn.disabled = true; spinner.style.display = 'inline-block';
    const { data, error } = await supabaseClient.rpc('upsert_pedido_completo', {
        p_profile_id: profileId, p_id_pedido: pedidoId || null, p_id_cliente: clienteId,
        p_observaciones: observaciones, p_detalles: detalles
    });
    guardarBtn.disabled = false; spinner.style.display = 'none';
    if (error) { alert(`Error al guardar: ${error.message}`); }
    else { alert(data); window.location.href = './'; }
}

function populateSelect(selectElement, data, valueKey, textKey, placeholder) {
    if (!data) return;
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => { const option = document.createElement('option'); option.value = item[valueKey]; option.textContent = item[textKey]; selectElement.appendChild(option); });
}