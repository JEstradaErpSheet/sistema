// Archivo: /modulos/pedidos/gestion/logic-form.js
// Versión Corregida: Asigna correctamente los valores al editar.

document.addEventListener('DOMContentLoaded', async () => {
    // Lógica de arranque
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) { window.location.href = '/select-profile.html'; return; }
    const profile = JSON.parse(profileString);
    
    document.getElementById('welcome-message').textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Cargar y dibujar el formulario
    await renderForm(profile.id_usuario);
});

async function renderForm(profileId) {
    const formContainer = document.getElementById('form-container');
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    const { data, error } = await supabaseClient.rpc('get_data_for_gestion_form', {
        p_profile_id: profileId,
        p_pedido_id: pedidoId
    });

    if (error) {
        formContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        return;
    }

    const pedidoData = data.pedido_data;
    const listas = data.listas;
    
    if (pedidoData) {
        document.getElementById('form-breadcrumb-title').textContent = `Editando Pedido: ${pedidoData.nopedido || pedidoData.id_pedido}`;
    }

    formContainer.innerHTML = `
        <form id="pedido-form" onsubmit="return false;">
            <input type="hidden" id="form-id-pedido" value="${pedidoData ? pedidoData.id_pedido : ''}">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="form-id-cliente" class="form-label">Cliente</label>
                    <select class="form-select" id="form-id-cliente" required></select>
                </div>
            </div>
            <div class="mb-3">
                <label for="form-observaciones" class="form-label">Observaciones</label>
                <textarea class="form-control" id="form-observaciones">${pedidoData ? pedidoData.observaciones || '' : ''}</textarea>
            </div>
            <hr>
            <h5 class="mb-3">Detalles del Pedido</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="width: 60%;">Recurso/Producto</th>
                            <th style="width: 25%;">Cantidad</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="pedido-detalles-body"></tbody>
                </table>
            </div>
            <button type="button" id="btn-agregar-detalle" class="btn btn-outline-success btn-sm">
                <i class="bi bi-plus-lg"></i> Agregar Producto
            </button>
            <div class="mt-4 text-end">
                <a href="./" class="btn btn-secondary">Cancelar</a>
                <button type="button" id="btn-guardar-pedido" class="btn btn-primary">
                    <span id="guardar-spinner" class="spinner-border spinner-border-sm" style="display: none;"></span>
                    Guardar Pedido
                </button>
            </div>
        </form>
    `;

    // --- SECCIÓN DE LÓGICA CORREGIDA ---
    const selectCliente = document.getElementById('form-id-cliente');
    populateSelect(selectCliente, listas.clientes, 'id_cliente', 'nombre_cliente', 'Seleccione...');
    
    // Si estamos editando, seleccionamos el cliente que ya venía en los datos.
    if (pedidoData && pedidoData.id_cliente) {
        selectCliente.value = pedidoData.id_cliente;
    }

    window.listaRecursos = listas.recursos || [];

    // Si estamos editando y hay detalles, los dibujamos. Si no, una fila vacía.
    if (pedidoData && pedidoData.detalles && pedidoData.detalles.length > 0) {
        pedidoData.detalles.forEach(detalle => addDetalleRow(detalle));
    } else {
        addDetalleRow();
    }
    
    setupFormEventListeners(profile.id_usuario);
}

function addDetalleRow(detalle = {}) {
    const template = document.getElementById('detalle-row-template');
    const newRow = template.content.cloneNode(true);
    const select = newRow.querySelector('.select-recurso');
    
    populateSelect(select, window.listaRecursos, 'id_recurso', 'nombre_recurso', 'Seleccione...');
    
    // CORRECCIÓN: Asignar los valores del detalle a la nueva fila
    if (detalle.id_recurso) {
        select.value = detalle.id_recurso;
    }
    if (detalle.cantidad) {
        newRow.querySelector('.input-cantidad').value = detalle.cantidad;
    }
    
    document.getElementById('pedido-detalles-body').appendChild(newRow);
}

// El resto de las funciones (setupFormEventListeners, populateSelect, etc.)
// y el Punto 3.3 (handleGuardarPedido) los implementaremos después de esta verificación.
// Por ahora, solo añadimos el listener para "Agregar Producto".
function setupFormEventListeners(profileId){
     document.getElementById('btn-agregar-detalle').addEventListener('click', () => addDetalleRow());
    
    document.body.addEventListener('click', event => {
        if (event.target.closest('.btn-remove-detalle')) {
            event.target.closest('tr').remove();
        }
    });

    document.getElementById('btn-guardar-pedido').addEventListener('click', () => {
        alert('La lógica de guardado se implementará en el Punto 3.3');
    });
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