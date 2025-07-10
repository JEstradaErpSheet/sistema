// Archivo: /modulos/pedidos/gestion/logic.js

document.addEventListener('DOMContentLoaded', async () => {
    // Verificación de perfil estándar
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) { window.location.href = '/select-profile.html'; return; }
    const profile = JSON.parse(profileString);

    // Poblar elementos de la cabecera
    document.getElementById('welcome-message').textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Cargar componentes dinámicos
    await loadNavigationModules(profile.id_usuario);
    await loadPedidosAndActions(profile.id_usuario);
});

async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error cargando navegación:', error); return; }
    
    // El path de nuestro módulo padre es /modulos/pedidos/
    const moduleBasePath = '/modulos/pedidos/'; 
    navContainer.innerHTML = modules.map(module => {
        const isActive = module.url_pagina.startsWith(moduleBasePath);
        return `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}

async function loadPedidosAndActions(profileId) {
    const tableBody = document.getElementById('pedidos-table-body');
    // Renombramos la función que llamamos a la que ya probamos en el backend
    const { data: pedidos, error } = await supabaseClient.rpc('get_gestion_pedidos_vista', { p_profile_id: profileId });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        return;
    }
    if (pedidos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = pedidos.map(pedido => {
        // Generamos los botones a partir del JSON `allowed_actions`
        const actionsHtml = pedido.allowed_actions.map(action => 
            `<button class="btn btn-sm ${action.class}" data-action="${action.action_id}" data-id="${pedido.id_pedido}">${action.name}</button>`
        ).join(' '); //   para un pequeño espacio entre botones

        return `
            <tr>
                <td>${pedido.nopedido || 'N/A'}</td>
                <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
                <td>${pedido.nombreusuario || 'N/A'}</td>
                <td>${pedido.observaciones || ''}</td>
                <td><span class="badge bg-secondary">${pedido.estadopedido || 'N/A'}</span></td>
                <td class="text-end">${actionsHtml}</td>
            </tr>
        `;
    }).join('');
}