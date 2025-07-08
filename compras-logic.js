// ========= CÓDIGO FINAL Y CORRECTO para compras-logic.js =========

// YA NO NECESITAMOS la función setActiveProfile. La eliminamos por completo.
// La seguridad ahora viaja en el "pasaporte" JWT.

/**
 * Carga los módulos permitidos para el usuario autenticado en la barra de navegación.
 * Esta función ha sido actualizada para usar la nueva RPC segura.
 */
async function loadNavigationModules() {
    // Usamos el ID de tu HTML, que es el correcto.
    const navBar = document.getElementById('module-navigation-bar'); 
    if (!navBar) {
        console.error('No se encontró el contenedor de la barra de navegación #module-navigation-bar.');
        return;
    }

    // Ya no necesitamos pasar el roleId.
    console.log(`Llamando a la nueva RPC get_allowed_modules_citfsa (sin parámetros)...`);

    // Llamamos a la nueva versión de la RPC que no necesita parámetros.
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa');
    
    if (error) {
        console.error("Error al cargar módulos de navegación:", error);
        return;
    }
    if (!modules || modules.length === 0) {
        console.warn('No se encontraron módulos para este perfil.');
        navBar.innerHTML = ''; // Limpiar por si acaso
        return;
    }
    navBar.innerHTML = ''; 
    modules.forEach(module => {
        const link = document.createElement('a');
        
        // --- AJUSTE DE NOMBRES DE COLUMNA ---
        // La nueva función SQL devuelve 'url_pagina' y 'etiqueta'.
        link.href = module.url_pagina || '#';
        link.textContent = module.etiqueta || 'Módulo'; 
        
        if (window.location.pathname.includes(module.url_pagina)) {
            link.className = 'active';
        }
        
        navBar.appendChild(link);
    });
} 

// Punto de entrada principal.
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient === 'undefined') {
        return;
    }
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        handleLogout();
        return;
    }

    // Ya no necesitamos la variable 'profile' aquí, pero es bueno confirmar que existe.
    console.log(`Acceso verificado para el perfil:`, JSON.parse(profileString));

    // --- CAMBIO CLAVE ---
    // Ya no llamamos a setActiveProfile. Esa lógica ya no existe.
    // Simplemente llamamos a la función para cargar la navegación.
    loadNavigationModules();
});