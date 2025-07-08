// compras-logic.js - CÓDIGO FINAL Y CORRECTO

document.addEventListener('DOMContentLoaded', () => {
    // Verificación estándar de Supabase y del perfil de usuario.
    if (typeof supabaseClient === 'undefined') { return; }

    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        handleLogout();
        return;
    }

    const profile = JSON.parse(profileString);
    console.log(`Acceso verificado para el perfil:`, profile);

    // --- ¡LA LÓGICA CORRECTA! ---
    // Llamamos a la función para cargar la barra de navegación,
    // pasándole el ID del perfil que es necesario ahora.
    loadNavigationModules(profile.id_usuario);
});

/**
 * Carga los módulos permitidos para un perfil y los muestra en la barra de navegación superior.
 * @param {string} profileId - El ID del perfil del usuario activo.
 */
async function loadNavigationModules(profileId) {
    // Asegúrate de que tus páginas de módulo (crm.html, etc.) tengan un contenedor
    // con este ID para la barra de navegación.
    const navContainer = document.getElementById('dynamic-nav-modules');
    if (!navContainer) {
        console.error('Error: Contenedor de navegación #dynamic-nav-modules no encontrado en el HTML.');
        return;
    }

    console.log(`Llamando a la nueva RPC get_allowed_modules_citfsa con el ID de perfil: ${profileId}`);
    
    // --- ¡LA LLAMADA CORRECTA! ---
    // Llamamos a la RPC con el parámetro que ahora es obligatorio.
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', {
        p_profile_id: profileId
    });

    if (error) {
        console.error('Error al cargar módulos de navegación:', error);
        navContainer.innerHTML = '<a href="/home.html" class="nav-item">Error de Carga</a>';
        return;
    }

    if (!modules || modules.length === 0) {
        console.warn('Este perfil no tiene módulos de navegación asignados.');
        return;
    }

    // Construimos el HTML de la barra de navegación.
    navContainer.innerHTML = '';
    const currentPagePath = window.location.pathname;
    modules.forEach(module => {
        const isActive = currentPagePath.includes(module.url_pagina);
        navContainer.innerHTML += `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    });
}