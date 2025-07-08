// home-logic.js - VERSIÓN FINAL Y CORRECTA PARA ARQUITECTURA JWT

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient === 'undefined') {
        console.error('CRITICAL ERROR: supabaseClient no está definido.');
        return;
    }

    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        console.warn('No se encontró un perfil seleccionado. Redirigiendo al inicio.');
        handleLogout(); 
        return;
    }

    const profile = JSON.parse(profileString);
    console.log('Perfil activo:', profile);

    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        welcomeElement.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    // --- CAMBIO CLAVE ---
    // Ya no pasamos el id_rol. La función ahora es más inteligente.
    loadModules();
});

// --- FUNCIÓN MODIFICADA ---
async function loadModules() {
    const modulesGrid = document.getElementById('modules-grid');
    // Ya no necesitamos el roleId aquí.
    console.log(`Llamando a la nueva RPC get_allowed_modules_citfsa (sin parámetros)...`);

    // Llamamos a la nueva versión de la RPC que no necesita parámetros.
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa');

    if (error) {
        console.error("Error al cargar módulos:", error);
        modulesGrid.innerHTML = `<p class="error-text">Error al cargar los módulos. Revisa la consola.</p>`;
        return;
    }

    if (!modules || modules.length === 0) {
        modulesGrid.innerHTML = '<p>No tienes módulos asignados para este perfil.</p>';
        return;
    }

    console.log('Módulos recibidos:', modules);
    modulesGrid.innerHTML = ''; 
    modules.forEach(module => {
        const card = document.createElement('a');
        // --- PEQUEÑO AJUSTE DE NOMBRES DE COLUMNA ---
        // La nueva función devuelve 'url_pagina' y 'etiqueta' según la definimos.
        // Asegurémonos de que el código use los nombres correctos.
        card.href = module.url_pagina || '#'; 
        card.className = 'app-card';
        
        const iconUrl = module.icono || 'img/default-icon.png';
        const moduleName = module.etiqueta || 'Módulo sin nombre';

        card.innerHTML = `<img src="${iconUrl}" alt="${moduleName}"><span>${moduleName}</span>`;
        modulesGrid.appendChild(card);
    });
}