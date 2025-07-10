// ==================================================================
//               VERSIÓN DE DEPURACIÓN EXTREMA
//             Solo carga la barra de navegación y nada más
// ==================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DEPURACIÓN: DOMContentLoaded se ha disparado.");

    // 1. Verificación de Supabase Client
    if (typeof supabaseClient === 'undefined') {
        console.error("DEPURACIÓN: ¡CRÍTICO! supabaseClient no está definido. Deteniendo todo.");
        alert("Error crítico: El cliente de Supabase no se ha cargado. Revisa la consola.");
        return;
    }
    console.log("DEPURACIÓN: supabaseClient SÍ está definido.");

    // 2. Verificación del Perfil
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        console.error("DEPURACIÓN: No se encontró 'selectedProfile' en localStorage.");
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);
    console.log("DEPURACIÓN: Perfil encontrado:", profile);

    // 3. Llamar a la ÚNICA función: cargar la barra de navegación
    console.log("DEPURACIÓN: Intentando cargar la barra de navegación...");
    await loadNavigationModules(profile.id_usuario);
    console.log("DEPURACIÓN: La función de la barra de navegación ha terminado.");
    
    // El resto de las funciones (loadPedidos, setupEventListeners) no se llaman
    // para aislar el problema.
});

async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    if (!navContainer) {
        console.error("DEPURACIÓN: No se encontró el elemento #module-navigation-bar en el HTML.");
        return;
    }

    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });

    if (error) {
        console.error('DEPURACIÓN: Error en la llamada RPC para la barra de navegación:', error);
        navContainer.innerHTML = '<a href="#" class="nav-item">Error al cargar</a>';
        return;
    }

    console.log("DEPURACIÓN: Módulos recibidos para la barra de navegación:", modules);
    const currentPagePath = window.location.pathname;
    navContainer.innerHTML = modules.map(module => {
        const isActive = currentPagePath.includes(module.url_pagina);
        return `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}

// Las demás funciones no se incluyen en esta versión de prueba.