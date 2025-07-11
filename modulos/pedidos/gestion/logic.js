// Archivo: /modulos/pedidos/gestion/logic.js
// Versión Final de la Fase 2: Botones funcionales y pulidos.

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

    // Cargar componentes dinámicos de la página
    await loadNavigationModules(profile.id_usuario);
    await loadPedidosAndActions(profile.id_usuario);

    // Asignar el listener principal para todas las acciones
    setupActionListeners(profile.id_usuario);
});

// --- FUNCIONES DE CARGA ---
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
        // Botón "Ver Detalles" siempre presente
        const viewButton = `<button class="btn btn-sm btn-info" data-action="view_details" data-id="${pedido.id_pedido}">Ver Detalles</button>`;

        // Botones de flujo de trabajo condicionales
        const workflowActionsHtml = (pedido.workflow_actions || []).map(action => 
            `<button 
                class="btn btn-sm ${action.class}" 
                data-action="${action.action_id}" 
                data-id="${pedido.id_pedido}"
                ${action.confirm_message ? `data-confirm-message="${action.confirm_message}"` : ''}
            >${action.name}</button>`
        ).join(' ');

        const finalActions = viewButton + (workflowActionsHtml ? ' ' + workflowActionsHtml : '');

        return `
            <tr>
                <td>${pedido.nopedido || 'N/A'}</td>
                <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
                <td>${pedido.nombreusuario || 'N/A'}</td>
                <td>${pedido.observaciones || ''}</td>
                <td><span class="badge ${getStatusClass(pedido.estadopedido)}">${(pedido.estadopedido || 'N/A').toUpperCase()}</span></td>
                <td class="text-end">${finalActions}</td>
            </tr>`;
    }).join('');
}

// --- MANEJADOR DE EVENTOS ---
function setupActionListeners(profileId) {
    document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const actionId = button.dataset.action;
        const pedidoId = button.dataset.id;
        const confirmMessage = button.dataset.confirmMessage;

        // Acciones que no necesitan confirmación ni RPC de estado
        if (actionId === 'edit' || actionId === 'view_details') {
            alert(`Acción: ${actionId} en Pedido: ${pedidoId}. La redirección se implementará en la Fase 3.`);
            return;
        }

        // Acciones que sí necesitan confirmación y RPC
        if (confirmMessage) {
            if (!confirm(confirmMessage)) {
                return; // El usuario presionó "Cancelar"
            }
        }

        try {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

            const { data, error } = await supabaseClient.rpc('execute_gestion_pedidos_action', {
                p_profile_id: profileId,
                p_pedido_id: pedidoId,
                p_action_id: actionId
            });

            if (error) { throw new Error(error.message); }
            
            showToast(data);
            await loadPedidosAndActions(profileId); // Refrescar la tabla

        } catch (err) {
            console.error('Error al ejecutar la acción:', err);
            showToast(`Error: ${err.message}`, true);
            await loadPedidosAndActions(profileId); // Refrescar incluso si hay error
        }
    });
}

// --- FUNCIONES DE UTILIDAD ---
function getStatusClass(status) {
    const statusMap = {
        'borrador': 'bg-secondary',
        'ordenado': 'bg-primary',
        'transito': 'bg-info',
        'entregado': 'bg-success',
        'cancelado': 'bg-danger'
    };
    return statusMap[status] || 'bg-light text-dark';
}

function showToast(message, isError = false) {
    const toastId = 'toast-notification-id';
    // Remover toast existente si lo hay
    const existingToast = document.getElementById(toastId);
    if (existingToast) { existingToast.remove(); }
    
    const toastContainer = document.createElement('div');
    toastContainer.id = toastId;
    toastContainer.className = `toast-notification ${isError ? 'error' : 'success'}`;
    toastContainer.textContent = message;

    const style = document.createElement('style');
    style.innerHTML = `
        .toast-notification { position: fixed; bottom: -100px; right: 20px; padding: 15px 25px; border-radius: 8px; color: white; z-index: 1060; opacity: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.4s ease-in-out; font-weight: 500; }
        .toast-notification.show { opacity: 1; bottom: 20px; }
        .toast-notification.success { background-color: #28a745; }
        .toast-notification.error { background-color: #dc3545; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toastContainer);

    setTimeout(() => { toastContainer.classList.add('show'); }, 100);
    setTimeout(() => {
        toastContainer.classList.remove('show');
        setTimeout(() => {
            toastContainer.remove();
            style.remove();
        }, 500);
    }, 3500);
}