// home-logic.js - VERSIÓN FINAL Y FUNCIONAL

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient === 'undefined') { return; }

    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        handleLogout(); 
        return;
    }

    const profile = JSON.parse(profileString);
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        welcomeElement.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    // Llamamos a la función para cargar los módulos, pasándole el ID del perfil.
    loadModules(profile.id_usuario);
});

async function loadModules(profileId) {
    const modulesGrid = document.getElementById('modules-grid');
    if (!profileId) {
        modulesGrid.innerHTML = '<p>Error: No se encontró un ID de perfil para consultar.</p>';
        return;
    }
    modulesGrid.innerHTML = '<p>Cargando módulos...</p>';

    // Llamamos a la RPC, pasándole el ID del perfil como parámetro.
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', {
        p_profile_id: profileId
    });

    if (error) {
        console.error("Error al cargar los módulos:", error);
        modulesGrid.innerHTML = `<p class="error-text">Error al cargar los módulos.</p>`;
        return;
    }

    if (!modules || modules.length === 0) {
        modulesGrid.innerHTML = '<p>No tienes módulos asignados para este perfil.</p>';
        return;
    }

    modulesGrid.innerHTML = ''; 
    modules.forEach(module => {
        const card = document.createElement('a');
        card.href = module.url_pagina || '#';
        card.className = 'app-card';
        
        const iconUrl = module.icono || 'img/default-icon.png';
        const moduleName = module.etiqueta || 'Módulo sin nombre';

        card.innerHTML = `
            <img src="${iconUrl}" alt="Icono de ${moduleName}">
            <span>${moduleName}</span>
        `;
        modulesGrid.appendChild(card);
    });
}