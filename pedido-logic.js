// ==================================================================
//          VERSIÓN DE DEPURACIÓN CON PUNTOS DE RUPTURA
// ==================================================================

// --- INICIO: LÓGICA DE ARRANQUE ---
document.addEventListener('DOMContentLoaded', async () => {
    // PUNTO DE RUPTURA #1: Ver si llegamos al inicio de la lógica.
    debugger; 
    
    console.log("DEPURACIÓN: DOMContentLoaded se ha disparado.");

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
    setupEventListeners();
});

// ... (Las funciones loadNavigationModules y loadPedidos se quedan igual)
async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error RPC Navegación:', error); return; }
    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => `<a href="${module.url_pagina}" class="nav-item ${currentPagePath.includes(module.url_pagina) ? 'active' : ''}">${module.etiqueta}</a>`).join('');
}

async function loadPedidos() {
    const pedidosTableBody = document.getElementById('pedidos-table-body');
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';
    const profile = JSON.parse(localStorage.getItem('selectedProfile'));
    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { p_profile_id: profile.id_usuario });
    loadingSpinner.style.display = 'none';
    if (error) { pedidosTableBody.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`; return; }
    if (data.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }
    pedidosTableBody.innerHTML = data.map(pedido => `...`).join(''); // El detalle no es importante aquí
}
// --- FIN DE FUNCIONES DE CARGA ---

function setupEventListeners() {
    console.log("DEPURACIÓN: Entrando en setupEventListeners.");

    // PUNTO DE RUPTURA #2: Ver si llegamos a la función que asigna los eventos.
    debugger;

    const nuevoPedidoBtn = document.getElementById('btn-nuevo-pedido');
    if (nuevoPedidoBtn) {
        nuevoPedidoBtn.addEventListener('click', () => {
            alert('¡Click en Nuevo Pedido detectado!');
        });
        console.log("DEPURACIÓN: Event listener para 'Nuevo Pedido' asignado.");
    } else {
        console.error("DEPURACIÓN: No se encontró el botón #btn-nuevo-pedido.");
    }

    // Para los botones de la barra de navegación, probemos un enfoque diferente.
    const navContainer = document.getElementById('module-navigation-bar');
    if (navContainer) {
        navContainer.addEventListener('click', (e) => {
            // Prevenimos el comportamiento por defecto para ver si el evento se captura
            e.preventDefault();
            const targetLink = e.target.closest('a.nav-item');
            if (targetLink) {
                const href = targetLink.getAttribute('href');
                alert(`¡Click en la barra de navegación detectado! Ir a: ${href}`);
                // window.location.href = href; // Lo dejamos comentado por ahora
            }
        });
        console.log("DEPURACIÓN: Event listener para la barra de navegación asignado.");
    } else {
        console.error("DEPURACIÓN: No se encontró el contenedor #module-navigation-bar.");
    }
}