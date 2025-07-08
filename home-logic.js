// home-logic.js - VERSIÓN FINAL (sincronizada con la tabla 'modulo' y la arquitectura JWT)

document.addEventListener('DOMContentLoaded', () => {
    // Verificación de que el cliente de Supabase está listo.
    if (typeof supabaseClient === 'undefined') {
        console.error('CRITICAL ERROR: supabaseClient no está definido.');
        return;
    }

    // Verificación de que el usuario ha seleccionado un perfil.
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        console.warn('No se encontró un perfil seleccionado. Redirigiendo al inicio.');
        handleLogout(); 
        return;
    }

    // Mostramos el mensaje de bienvenida.
    const profile = JSON.parse(profileString);
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        welcomeElement.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    // Llamamos a la función para cargar los módulos.
    loadModules();
});

/**
 * Carga los módulos permitidos para el usuario actual (obtenido del JWT)
 * y los muestra en la cuadrícula de la página principal.
 */
async function loadModules() {
    const modulesGrid = document.getElementById('modules-grid');
    if (!modulesGrid) {
        console.error("El contenedor de módulos '#modules-grid' no se encontró en el HTML.");
        return;
    }

    console.log(`Llamando a la RPC segura 'get_allowed_modules_citfsa' (sin parámetros)...`);
    modulesGrid.innerHTML = '<p>Cargando módulos...</p>'; // Mensaje de carga

    // Llamamos a la nueva RPC segura que no necesita parámetros.
    const { data: who_am_i, error } = await supabaseClient.rpc('ask_who_am_i');
    console.log("RESPUESTA A 'QUIÉN SOY':", who_am_i);

    if (error) {
        console.error("Error al cargar los módulos:", error);
        modulesGrid.innerHTML = `<p class="error-text">Error al cargar los módulos. Por favor, revisa la consola para más detalles.</p>`;
        return;
    }

    if (!modules || modules.length === 0) {
        modulesGrid.innerHTML = '<p>No tienes módulos asignados para este perfil.</p>';
        return;
    }

    console.log('Módulos recibidos del backend:', modules);
    modulesGrid.innerHTML = ''; // Limpiar el mensaje de "Cargando...".

    // Iteramos sobre los módulos y creamos una tarjeta para cada uno.
    modules.forEach(module => {
        const card = document.createElement('a');
        
        // Usamos los nombres de columna EXACTOS que devuelve la función SQL.
        card.href = module.url_pagina || '#';
        card.className = 'app-card';
        
        // 'icono' y 'etiqueta' son los alias que le dimos en la función SQL.
        const iconUrl = module.icono || 'img/default-icon.png';
        const moduleName = module.etiqueta || 'Módulo sin nombre';

        card.innerHTML = `
            <img src="${iconUrl}" alt="Icono de ${moduleName}">
            <span>${moduleName}</span>
        `;
        modulesGrid.appendChild(card);
    });
}