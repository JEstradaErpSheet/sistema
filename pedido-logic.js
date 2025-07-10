// ==================================================================
//          VERSIÓN FINAL, COMPLETA Y FUNCIONAL
// ==================================================================

// --- LÓGICA DE ARRANQUE ---
document.addEventListener('DOMContentLoaded', async () => {
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    await loadNavigationModules(profile.id_usuario);
    await loadPedidos();
    setupEventListeners(); // Esta es la función clave
});

// --- FUNCIONES DE CARGA ---
async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error RPC Navegación:', error); return; }
    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => `<a href="${module.url_pagina}" class="nav-item ${currentPagePath.includes(module.url_pagina) ? 'active' : ''}">${module.etiqueta}</a>`).join('');
}

async function loadPedidos() {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando...</td></tr>';
    const profile = JSON.parse(localStorage.getItem('selectedProfile'));
    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { p_profile_id: profile.id_usuario });
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
                <!-- Botones de acciones de fila -->
            </td>
        </tr>
    `).join('');
}


// --- GESTOR DE EVENTOS CENTRALIZADO ---
function setupEventListeners() {
    // Asigna el evento al botón de Nuevo Pedido
    document.getElementById('btn-nuevo-pedido').addEventListener('click', () => {
        // Aquí iría la lógica para abrir el modal, por ahora un alert
        alert('¡Click en Nuevo Pedido FUNCIONA!');
    });

    // Asigna el evento al botón de Cerrar Sesión
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Llama a la función global que ya tienes en supabase-client.js
        if (typeof handleLogout === 'function') {
            handleLogout();
        } else {
            console.error('La función handleLogout no está definida.');
        }
    });

    // Los enlaces de la barra de navegación no necesitan un listener,
    // su comportamiento por defecto (href) es suficiente y ahora debería funcionar.
}