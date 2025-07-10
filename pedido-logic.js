/*
==================================================================
        VERSIÓN DE DEPURACIÓN - CÓDIGO DEL MODAL DESACTIVADO
==================================================================
*/

// --- INICIO: ELEMENTOS DEL DOM ---
const welcomeMessage = document.getElementById('welcome-message');
const navContainer = document.getElementById('module-navigation-bar');
const pedidosTableBody = document.getElementById('pedidos-table-body');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const nuevoPedidoBtn = document.getElementById('btn-nuevo-pedido');

/* --- CÓDIGO DEL MODAL DESACTIVADO ---
const pedidoModalEl = document.getElementById('pedido-modal');
const pedidoModalLabel = document.getElementById('pedidoModalLabel');
const pedidoForm = document.getElementById('pedido-form');
// ... y así con todos los elementos del modal ...
*/
// --- FIN: ELEMENTOS DEL DOM ---


// --- INICIO: LÓGICA DE ARRANQUE ---
document.addEventListener('DOMContentLoaded', async () => {
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }
    await loadNavigationModules(profile.id_usuario);
    await loadPedidos();
    
    // La función que da vida a los botones AHORA SÓLO TIENE 1 LÍNEA ACTIVA
    setupEventListeners();
});

async function loadNavigationModules(profileId) {
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error en RPC de navegación:', error); return; }
    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => {
        const isActive = currentPagePath.includes(module.url_pagina);
        return `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}

async function loadPedidos() {
    showLoading(true);
    pedidosTableBody.innerHTML = '';
    const profile = JSON.parse(localStorage.getItem('selectedProfile'));
    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { p_profile_id: profile.id_usuario });
    showLoading(false);
    if (error) { showError('Error al cargar los pedidos: ' + error.message); return; }
    if (data.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }
    pedidosTableBody.innerHTML = data.map(pedido => `
        <tr>
            <td>${pedido.nopedido || 'N/A'}</td>
            <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
            <td>${pedido.nombreusuario || 'N/A'}</td>
            <td>${pedido.observaciones || ''}</td>
            <td><span class="badge bg-secondary">${pedido.estadopedido}</span></td>
            <td class="text-end"></td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // La única acción que NO está comentada es un simple alert
    // para probar si el botón "Nuevo Pedido" responde.
    nuevoPedidoBtn.addEventListener('click', () => {
        alert('¡El botón Nuevo Pedido AHORA SÍ funciona!');
    });

    /* --- CÓDIGO DE LOS OTROS BOTONES DESACTIVADO ---
    guardarPedidoBtn.addEventListener('click', handleGuardarPedido);
    agregarDetalleBtn.addEventListener('click', agregarFilaDetalle);
    // ... etc ...
    */
}


// --- FUNCIONES DE UTILIDAD (SIN CAMBIOS) ---
function showLoading(isLoading) { loadingSpinner.style.display = isLoading ? 'block' : 'none'; }
function showError(message) { errorMessage.style.display = 'block'; errorMessage.textContent = message; }