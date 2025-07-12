// Archivo: /modulos/pedidos/gestion/logic-form.js
// Versión Tarea 1.A - Paso 3.1: Estructura visual para precios

document.addEventListener('DOMContentLoaded', async () => {
    // Lógica de arranque
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) { window.location.href = '/select-profile.html'; return; }
    const profile = JSON.parse(profileString);
    
    document.getElementById('welcome-message').textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Cargar y dibujar el formulario
    await renderForm(profile);
});

async function renderForm(profile) { 
    const formContainer = document.getElementById('form-container');
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    const { data, error } = await supabaseClient.rpc('get_data_for_gestion_form', {
        p_profile_id: profile.id_usuario,
        p_pedido_id: pedidoId
    });

    if (error) {
        formContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        return;
    }

    const pedidoData = data.pedido_data ? data.pedido_data.pedido_header : null;
    const detallesData = data.pedido_data ? data.pedido_data.pedido_detalles : [];
    const listas = data.listas;
    
    if (pedidoData) {
        document.getElementById('form-breadcrumb-title').textContent = `Editando Pedido: ${pedidoData.nopedido || pedidoData.id_pedido}`;
    }

    // ============================================= -->
    //   NUEVA ESTRUCTURA DE FORMULARIO CON TABLA DE PRECIOS
    // ============================================= -->
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
                    <thead>
                        <tr>
                            <th style="width: 50%;">Recurso/Producto</th>
                            <th class="text-end" style="width: 15%;">Cantidad</th>
                            <th class="text-end" style="width: 15%;">Precio Unit.</th>
                            <th class="text-end" style="width: 15%;">Subtotal</th>
                            <th class="text-center"></th>
                        </tr>
                    </thead>
                    <tbody id="pedido-detalles-body"></tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end border-0 fs-5"><strong>Total General:</strong></td>
                            <td class="text-end fw-bold border-0 fs-5">
                                C$ <span id="grand-total">0.00</span>
                            </td>
                            <td class="border-0"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <button type="button" id="btn-agregar-detalle" class="btn btn-outline-success btn-sm"><i class="bi bi-plus-lg"></i> Agregar Producto</button>
            <div class="mt-4 text-end">
                <a href="./" class="btn btn-secondary">Cancelar</a>
                <button type="button" id="btn-guardar-pedido" class="btn btn-primary">
                    <span id="guardar-spinner" class="spinner-border spinner-border-sm" style="display: none;"></span>
                    Guardar Pedido
                </button>
            </div>
        </form>
    `;

    const selectCliente = document.getElementById('form-id-cliente');
    populateSelect(selectCliente, listas.clientes, 'id_cliente', 'nombre_cliente', 'Seleccione...');
    
    if (pedidoData && pedidoData.id_cliente) {
        selectCliente.value = pedidoData.id_cliente;
    }

    window.listaRecursos = listas.recursos || [];
    
    if (detallesData && detallesData.length > 0) {
        detallesData.forEach(detalle => addDetalleRow(detalle));
    } else {
        addDetalleRow();
    }
    
    // La funcionalidad se añadirá en el siguiente paso
    setupFormEventListeners(profile.id_usuario);
}

function addDetalleRow(detalle = {}) {
    const template = document.getElementById('detalle-row-template');
    if (!template) return;
    const newRow = template.content.cloneNode(true);
    const select = newRow.querySelector('.select-recurso');
    
    populateSelect(select, window.listaRecursos, 'id_recurso', 'nombre_recurso', 'Seleccione...');
    
    if (detalle.id_recurso) { select.value = detalle.id_recurso; }
    if (detalle.cantidad) { newRow.querySelector('.input-cantidad').value = detalle.cantidad; }
    
    document.getElementById('pedido-detalles-body').appendChild(newRow);
}

function setupFormEventListeners(profileId){
    document.getElementById('form-container').addEventListener('click', async (event) => {
        const target = event.target;
        if (target.closest('#btn-agregar-detalle')) { addDetalleRow(); }
        if (target.closest('.btn-remove-detalle')) { target.closest('tr').remove(); }
        if (target.closest('#btn-guardar-pedido')) {
            // Esta lógica aún no está implementada por completo, pero el listener está aquí
            await handleGuardarPedido(profileId);
        }
    });
}

async function handleGuardarPedido(profileId) {
    alert("La lógica de guardado final se implementará en el Punto 3.3. ¡Ya casi!");
}

function populateSelect(selectElement, data, valueKey, textKey, placeholder) {
    if (!data) return;
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        selectElement.appendChild(option);
    });
}