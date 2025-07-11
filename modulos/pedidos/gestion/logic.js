// Archivo: /modulos/pedidos/gestion/logic.js
// Versión Final de la Fase 2: Botones de acción funcionales.

document.addEventListener('DOMContentLoaded', async () => {
    // Verificación de perfil estándar
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) { window.location.href = '/select-profile.html'; return; }
    const profile = JSON.parse(profileString);

    // Poblar elementos de la cabecera
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }
    if (logoutBtn && typeof handleLogout === 'function') {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Cargar componentes dinámicos
    await loadNavigationModules(profile.id_usuario);
    await loadPedidosAndActions(profile.id_usuario);

    // Asignar el listener principal para todas las acciones de la página
    setupActionListeners(profile.id_usuario);
});

// --- FUNCIONES DE CARGA (Sin cambios) ---
async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    if (!navContainer) return;
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error cargando navegación:', error); return; }
    const moduleBasePath = '/modulos/pedidos/';
    navContainer.innerHTML = modules.map(module => {
        const url = module.url_pagina || '#';
        const isActive = module.url_pagina ? url.startsWith(moduleBasePath) : false;
        return `<a href="${url}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}

async function loadPedidosAndActions(profileId) {
    const tableBody = document.getElementById('pedidos-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">Cargando...</td></tr>`;
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
        const workflowActionsHtml = (pedido.workflow_actions || []).map(action =>
            `<button class="btn btn-sm ${action.class}" data-action="${action.action_id}" data-id="${pedido.id_pedido}">${action.name}</button>`
        ).join(' ');
        const finalActions = `<button class="btn btn-sm btn-info" data-action="view_details" data-id="${pedido.id_pedido}">Ver Detalles</button>` + (workflowActionsHtml ? ' ' + workflowActionsHtml : '');
        return `
            <tr>
                <td>${pedido.nopedido || 'N/A'}</td>
                <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
                <td>${pedido.nombreusuario || 'N/A'}</td>
                <td>${pedido.observaciones || ''}</td>
                <td><span class="badge bg-secondary">${pedido.estadopedido || 'N/A'}</span></td>
                <td class="text-end">${finalActions}</td>
            </tr>`;
    }).join('');
}

// --- MANEJADOR DE EVENTOS CENTRALIZADO ---
function setupActionListeners(profileId) {
    document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return; // Si el clic no fue en un botón de acción, no hacer nada.

        const actionId = button.dataset.action;
        const pedidoId = button.dataset.id;

        // Lógica para acciones que NO llaman a la RPC central
        if (actionId === 'edit' || actionId === 'view_details') {
            // En el futuro, esto redirigirá al formulario de edición/detalle
            alert(`Acción: ${actionId} en Pedido: ${pedidoId}. Redirección no implementada.`);
            return;
        }

        // Lógica para acciones que SÍ llaman a la RPC central
        const confirmAction = confirm(`¿Está seguro de que desea ejecutar la acción "${actionId}" en el pedido ${pedidoId}?`);
        if (!confirmAction) return;

        try {
            button.disabled = true; // Deshabilitar botón para evitar doble clic
            button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

            const { data, error } = await supabaseClient.rpc('execute_gestion_pedidos_action', {
                p_profile_id: profileId,
                p_pedido_id: pedidoId,
                p_action_id: actionId
            });

            if (error) {
                throw new Error(error.message);
            }
            
            // Éxito. Usaremos una notificación "Toast" simple.
            showToast(data); // El mensaje de éxito viene de la función SQL

            // Refrescar la tabla para mostrar el nuevo estado y las nuevas acciones
            await loadPedidosAndActions(profileId);

        } catch (err) {
            console.error('Error al ejecutar la acción:', err);
            showToast(`Error: ${err.message}`, true); // Muestra el toast en modo error
            // Volver a habilitar el botón si falló no es necesario porque la tabla se refrescará
            await loadPedidosAndActions(profileId);
        }
    });
}

// --- FUNCIÓN DE UTILIDAD: NOTIFICACIÓN TOAST ---
function showToast(message, isError = false) {
    const toastContainer = document.createElement('div');
    toastContainer.className = `toast-notification ${isError ? 'error' : 'success'}`;
    toastContainer.textContent = message;

    // Estilos del Toast
    const style = document.createElement('style');
    style.innerHTML = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 1056;
            opacity: 0;
            transition: opacity 0.5s, bottom 0.5s;
        }
        .toast-notification.show {
            opacity: 1;
            bottom: 40px;
        }
        .toast-notification.success { background-color: #28a745; }
        .toast-notification.error { background-color: #dc3545; }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toastContainer);

    // Animar la entrada
    setTimeout(() => {
        toastContainer.classList.add('show');
    }, 100);

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        toastContainer.classList.remove('show');
        // Eliminar el elemento del DOM después de la animación
        setTimeout(() => {
            toastContainer.remove();
            style.remove();
        }, 500);
    }, 3000);
}