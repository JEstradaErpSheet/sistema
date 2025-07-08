// compras-logic.js - VERSIÓN 2.0 (Ahora también carga la barra de navegación)

// Función para establecer el perfil activo en el backend de Supabase
async function setActiveProfile(userId) {
    console.log(`Estableciendo el 'gafete' en el backend para el usuario: ${userId}`);
    const { error } = await supabaseClient.rpc('set_active_profile', { profile_id: userId });

    if (error) {
        console.error("Error al establecer el perfil activo en el backend:", error);
        // Opcional: manejar el error, por ejemplo, redirigiendo al login
        // alert("Hubo un error de sesión. Por favor, inicie sesión de nuevo.");
        // window.location.href = '/index.html';
    } else {
        console.log("Gafete establecido correctamente en el backend.");
    }
}

// Función para cargar los módulos de navegación
async function loadNavigationModules(userRoleId) {
    // ... (El contenido de esta función no cambia, déjalo como está)
    console.log(`Cargando módulos de navegación para el rol ID: ${userRoleId}`);
    const { data, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', { p_user_role_id: userRoleId });

    if (error) {
        console.error('Error al cargar los módulos de navegación:', error);
        return;
    }

    const navContainer = document.getElementById('dynamic-nav-modules');
    if (!navContainer) {
        console.error('No se encontró el contenedor de navegación #dynamic-nav-modules.');
        return;
    }

    let navHtml = '';
    data.forEach(module => {
        // Obtenemos el nombre del archivo actual para marcarlo como activo
        const currentPage = window.location.pathname.split('/').pop();
        const isActive = (module.url_pagina === `/${currentPage}`);
        navHtml += `<a href="${module.url_pagina}" class="nav-item ${isActive ? 'active' : ''}">${module.etiqueta}</a>`;
    });

    navContainer.innerHTML = navHtml;
}


// Punto de entrada principal cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay un perfil seleccionado en el almacenamiento local
    const selectedProfileString = localStorage.getItem('selectedProfile');
    if (!selectedProfileString) {
        console.error("Acceso denegado. No se encontró 'selectedProfile'. Redirigiendo a la selección de perfil.");
        window.location.href = '/select-profile.html';
        return; // Detener la ejecución
    }

    try {
        const selectedProfile = JSON.parse(selectedProfileString);
        console.log("Acceso permitido para el perfil:", selectedProfile);

        // --- INICIO DE LA MODIFICACIÓN CLAVE ---
        // 2. Antes de hacer nada más, RESTABLECER la sesión en el backend.
        // Esto asegura que cada página de módulo le dice a Supabase "¡Hola, soy yo!".
        await setActiveProfile(selectedProfile.id_usuario);
        // --- FIN DE LA MODIFICACIÓN CLAVE ---

        // 3. Cargar la barra de navegación dinámica con los permisos correctos
        if (selectedProfile.id_rol) {
            loadNavigationModules(selectedProfile.id_rol);
        } else {
            console.error("El perfil seleccionado no tiene un 'id_rol'. No se puede cargar la navegación.");
        }

    } catch (e) {
        console.error("Error al procesar el perfil guardado. Redirigiendo...", e);
        // Limpiar el almacenamiento local en caso de datos corruptos
        localStorage.removeItem('selectedProfile');
        window.location.href = '/select-profile.html';
    }
});