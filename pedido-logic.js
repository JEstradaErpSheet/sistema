// ==================================================================
//              VERSIÓN FINAL Y COMPLETA
// ==================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener elementos principales
    const welcomeMessage = document.getElementById('welcome-message');
    const navContainer = document.getElementById('module-navigation-bar');
    const logoutBtn = document.getElementById('logout-btn');
    const nuevoPedidoBtn = document.getElementById('btn-nuevo-pedido');

    // 2. Verificar perfil y poblar bienvenida
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    // 3. Asignar listeners a los botones que existen desde el principio
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (nuevoPedidoBtn) {
        nuevoPedidoBtn.addEventListener('click', handleNuevoPedido);
    }

    // 4. Cargar contenido dinámico
    await loadNavigationModules(profile.id_usuario, navContainer);
    await loadPedidos(profile.id_usuario);
});

// --- FUNCIONES DE CARGA ---
async function loadNavigationModules(profileId, navContainer) {
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error RPC Navegación:', error); return; }
    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => `<a href="${module.url_pagina}" class="nav-item ${currentPagePath.includes(module.url_pagina) ? 'active' : ''}">${module.etiqueta}</a>`).join('');
}

async function loadPedidos(profileId) {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando...</td></tr>';
    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { p_profile_id: profileId });
    if (error) { pedidosTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`; return; }
    if (data.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }
    // Lógica para dibujar la tabla
    pedidosTableBody.innerHTML = data.map(pedido => `
        <tr>
            <td>${pedido.nopedido || 'N/A'}</td>
            <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
            <td>${pedido.nombreusuario || 'N/A'}</td>
            <td>${pedido.observaciones || ''}</td>
            <td><span class="badge bg-secondary">${pedido.estadopedido || 'N/A'}</span></td>
            <td class="text-end">
                <!-- Botones de acciones de fila aquí -->
            </td>
        </tr>
    `).join('');
}

// --- FUNCIONES DEL MODAL (Aún no se usan, pero las dejamos listas) ---
function handleNuevoPedido() {
    alert("Ahora sí, aquí iría la lógica para abrir el modal.");
    // Aquí es donde, en el futuro, pondremos el código para
    // new bootstrap.Modal(...) y .show()
}

// ... aquí irían el resto de funciones (handleGuardarPedido, etc.)