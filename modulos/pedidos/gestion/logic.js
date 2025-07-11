// Archivo: /modulos/pedidos/gestion/logic.js
// Versión corregida y simplificada

document.addEventListener('DOMContentLoaded', async () => {
    // Verificación de perfil estándar
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) { 
        // Si no hay perfil, no podemos hacer nada, así que redirigimos.
        window.location.href = '/select-profile.html'; 
        return; 
    }
    const profile = JSON.parse(profileString);

    // Poblamos la bienvenida y asignamos el evento al botón de logout
    // Lo hacemos aquí porque sabemos que en esta página, la cabecera existe.
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }
    if (logoutBtn && typeof handleLogout === 'function') {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Cargar los componentes dinámicos de ESTA página
    await loadNavigationModules(profile.id_usuario);
    await loadPedidosAndActions(profile.id_usuario);
});

async function loadNavigationModules(profileId) {
    // Esta función se queda igual. Carga la barra de navegación del módulo.
    const navContainer = document.getElementById('module-navigation-bar');
    if (!navContainer) return; // Chequeo de seguridad

    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error cargando navegación:', error); return; }
    
    const moduleBasePath = '/modulos/pedidos/'; 
    navContainer.innerHTML = modules.map(module => {
        const url = module.url_pagina || '#';
        const isActive = module.url_pagina ? module.url_pagina.startsWith(moduleBasePath) : false;
        return `<a href="${url}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}

async function loadPedidosAndActions(profileId) {
    const tableBody = document.getElementById('pedidos-table-body');
    if (!tableBody) return; // Chequeo de seguridad

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
        const actionsHtml = pedido.workflow_actions.map(action => 
            `<button class="btn btn-sm ${action.class}" data-action="${action.action_id}" data-id="${pedido.id_pedido}">${action.name}</button>`
        ).join(' ');

        // El botón Ver Detalles siempre se añade
        const finalActions = `<button class="btn btn-sm btn-info" data-action="view_details" data-id="${pedido.id_pedido}">Ver Detalles</button>` + (actionsHtml ? ' ' + actionsHtml : '');

        return `
            <tr>
                <td>${pedido.nopedido || 'N/A'}</td>
                <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
                <td>${pedido.nombreusuario || 'N/A'}</td>
                <td>${pedido.observaciones || ''}</td>
                <td><span class="badge bg-secondary">${pedido.estadopedido || 'N/A'}</span></td>
                <td class="text-end">${finalActions}</td>
            </tr>
        `;
    }).join('');
}