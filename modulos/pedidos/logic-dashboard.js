// Archivo: /modulos/pedidos/logic-dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación de perfil (estándar)
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        window.location.href = '/select-profile.html';
        return;
    }
    const profile = JSON.parse(profileString);

    // 2. Poblar bienvenida y asignar logout (estándar)
    document.getElementById('welcome-message').textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // 3. Cargar la barra de navegación superior (reutilizada)
    await loadNavigationModules(profile.id_usuario);

    // 4. Cargar las tarjetas de las aplicaciones de este módulo
    await loadModuleApps(profile.id_usuario);
});

async function loadNavigationModules(profileId) {
    const navContainer = document.getElementById('module-navigation-bar');
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_profile_id: profileId });
    if (error) { console.error('Error cargando navegación:', error); return; }
    
    const currentPagePath = '/modulos/pedidos/'; // El path de este dashboard
    navContainer.innerHTML = modules.map(module => {
        // Marcamos 'PEDIDOS' como activo si la URL del módulo coincide
        const isActive = module.url_pagina.startsWith(currentPagePath);
        return `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    }).join('');
}

async function loadModuleApps(profileId) {
    const grid = document.getElementById('apps-grid');
    const { data: apps, error } = await supabaseClient.rpc('get_allowed_apps_for_module', {
        p_profile_id: profileId,
        p_module_name: 'pedidos' 
    });

    if (error) {
        grid.innerHTML = '<p class="text-danger">Error al cargar las aplicaciones de este módulo.</p>';
        return;
    }

    if (apps.length === 0) {
        grid.innerHTML = '<p>No hay aplicaciones disponibles en este módulo.</p>';
        return;
    }

    grid.innerHTML = apps.map(app => `
        <a href="${app.disabled ? '#' : app.app_url}" class="app-card ${app.disabled ? 'disabled' : ''}" title="${app.disabled ? 'Próximamente' : app.app_description}">
            <i class="bi ${app.app_icon}" style="font-size: 48px; margin-bottom: 1rem;"></i>
            <span>${app.app_name}</span>
        </a>
    `).join('');
}