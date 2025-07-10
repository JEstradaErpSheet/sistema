// pedido-logic.js - Basado en la estructura funcional de compras-logic.js

document.addEventListener('DOMContentLoaded', () => {
    // Verificación estándar (idéntica a compras-logic.js)
    if (typeof supabaseClient === 'undefined') { 
        console.error("Supabase client no encontrado.");
        return; 
    }

    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        // Asumimos que handleLogout está en supabase-client.js y es global
        handleLogout();
        return;
    }

    const profile = JSON.parse(profileString);
    console.log(`Acceso para perfil:`, profile);

    // --- LÓGICA EXTENDIDA PARA PEDIDOS ---

    // 1. Cargar la barra de navegación (función reutilizada)
    loadNavigationModules(profile.id_usuario);
    
    // 2. Cargar la tabla de pedidos (función nueva)
    loadPedidos(profile.id_usuario);

    // 3. Asignar todos los eventos de la página de forma segura
    setupPageEventListeners();
});


/**
 * Carga los módulos en la barra de navegación (código idéntico a compras-logic.js)
 */
async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    if (!navContainer) return;

    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });

    if (error) {
        console.error('Error cargando navegación:', error);
        navContainer.innerHTML = '<a href="/home.html" class="nav-item">Error</a>';
        return;
    }
    
    navContainer.innerHTML = '';
    const currentPagePath = window.location.pathname;
    modules.forEach(module => {
        const isActive = currentPagePath.includes(module.url_pagina);
        navContainer.innerHTML += `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    });
}


/**
 * Carga la tabla de pedidos desde la base de datos.
 */
async function loadPedidos(profileId) {
    const tableBody = document.getElementById('pedidos-table-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando...</td></tr>';

    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { p_profile_id: profileId });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        return;
    }
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }
    tableBody.innerHTML = data.map(pedido => `
        <tr>
            <td>${pedido.nopedido || 'N/A'}</td>
            <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
            <td>${pedido.nombreusuario || 'N/A'}</td>
            <td>${pedido.observaciones || ''}</td>
            <td><span class="badge bg-secondary">${pedido.estadopedido || 'N/A'}</span></td>
            <td class="text-end">
                <!-- Botones de acción se añadirán aquí si es necesario -->
            </td>
        </tr>
    `).join('');
}


/**
 * Centraliza TODOS los manejadores de eventos para evitar conflictos.
 */
function setupPageEventListeners() {
    // Usamos delegación de eventos en el body para máxima fiabilidad
    document.body.addEventListener('click', async function(event) {
        
        // Botón de Cerrar Sesión
        if (event.target.closest('#logout-btn')) {
            handleLogout();
        }

        // Botón de Nuevo Pedido
        if (event.target.closest('#btn-nuevo-pedido')) {
            const pedidoModalEl = document.getElementById('pedido-modal');
            const pedidoModal = new bootstrap.Modal(pedidoModalEl);

            // Poblar selects y mostrar el modal
            document.getElementById('pedido-form').reset();
            const selectClientes = document.getElementById('form-id-cliente');
            const { data: clientes } = await supabaseClient.rpc('get_lista_clientes');
            selectClientes.innerHTML = '<option value="">Seleccione...</option>';
            clientes.forEach(c => { selectClientes.innerHTML += `<option value="${c.id_cliente}">${c.nombre_cliente}</option>` });
            
            pedidoModal.show();
        }

        // Botón de Agregar Producto dentro del modal
        if (event.target.closest('#btn-agregar-detalle')) {
            const detallesBody = document.getElementById('pedido-detalles-body');
            const newRow = document.createElement('tr');
            
            const { data: recursos } = await supabaseClient.rpc('get_lista_recursos');
            let options = '<option value="">Seleccione...</option>';
            recursos.forEach(r => { options += `<option value="${r.id_recurso}">${r.nombre_recurso}</option>` });

            newRow.innerHTML = `
                <td><select class="form-select form-select-sm select-recurso">${options}</select></td>
                <td><input type="number" class="form-control form-control-sm" value="1" min="1"></td>
                <td class="text-end"><button type="button" class="btn btn-danger btn-sm btn-remove-detalle"><i class="bi bi-trash"></i></button></td>
            `;
            detallesBody.appendChild(newRow);
        }

        // Botón para eliminar una fila de detalle
        if (event.target.closest('.btn-remove-detalle')) {
            event.target.closest('tr').remove();
        }

        // Botón de Guardar Pedido
        if (event.target.closest('#btn-guardar-pedido')) {
            const profile = JSON.parse(localStorage.getItem('selectedProfile'));
            const pedidoId = document.getElementById('form-id-pedido').value;
            const clienteId = document.getElementById('form-id-cliente').value;
            const observaciones = document.getElementById('form-observaciones').value;

            const detalles = [];
            document.querySelectorAll('#pedido-detalles-body tr').forEach(row => {
                const recursoId = row.querySelector('.select-recurso').value;
                const cantidad = row.querySelector('input[type="number"]').value;
                if (recursoId && cantidad > 0) {
                    detalles.push({ id_recurso: recursoId, cantidad: parseFloat(cantidad) });
                }
            });

            if (!clienteId || detalles.length === 0) {
                alert('Debe seleccionar un cliente y agregar al menos un producto.');
                return;
            }

            const { error } = await supabaseClient.rpc('upsert_pedido_completo', {
                p_id_pedido: pedidoId || null,
                p_id_cliente: clienteId,
                p_observaciones: observaciones,
                p_detalles: detalles
            });

            if (error) {
                alert('Error al guardar el pedido: ' + error.message);
            } else {
                alert('¡Pedido guardado con éxito!');
                const pedidoModalEl = document.getElementById('pedido-modal');
                const pedidoModal = bootstrap.Modal.getInstance(pedidoModalEl);
                pedidoModal.hide();
                loadPedidos(profile.id_usuario);
            }
        }
    });
}