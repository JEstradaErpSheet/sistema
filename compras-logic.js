// ========= CÓDIGO FINAL Y CORRECTO para compras-logic.js =========

// Esta función establece el gafete en el backend. ES NECESARIA.
async function setActiveProfile(userId) {
    console.log(`Estableciendo el 'gafete' en el backend para el usuario: ${userId}`);
    // Usamos el nombre de la función que ya creamos en la base de datos
    const { error } = await supabaseClient.rpc('set_active_profile', { profile_id: userId });

    if (error) {
        console.error("Error crítico al establecer el perfil activo en el backend:", error);
    } else {
        console.log("Gafete de sesión establecido correctamente en el backend.");
    }
}

// Esta es TU función para cargar la navegación. No se cambia nada.
async function loadNavigationModules(roleId) {
    // Usamos el ID que tú definiste, que es el correcto.
    const navBar = document.getElementById('module-navigation-bar'); 
    if (!navBar) {
        console.error('No se encontró el contenedor de la barra de navegación #module-navigation-bar.');
        return;
    }
    if (!roleId) {
        console.error('No se proporcionó un ID de rol para cargar los módulos.');
        return;
    }
    console.log(`Cargando módulos de navegación para el rol ID: ${roleId}`);
    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', {
        p_user_role_id: roleId
    });
    if (error) {
        console.error("Error al cargar módulos de navegación:", error);
        return;
    }
    if (!modules || modules.length === 0) {
        console.warn('No se encontraron módulos para este perfil.');
        return;
    }
    navBar.innerHTML = ''; 
    modules.forEach(module => {
        const link = document.createElement('a');
        // Usamos los nombres de columna de tu función, que son los correctos.
        link.href = module.page_url || '#';
        link.textContent = module.module_name || 'Módulo'; 
        if (window.location.pathname.includes(module.page_url)) {
            link.className = 'active';
        }
        navBar.appendChild(link);
    });
} 

// Punto de entrada principal.
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabaseClient === 'undefined') {
        return;
    }
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        handleLogout();
        return;
    }
    const profile = JSON.parse(profileString);
    console.log(`Acceso permitido para el perfil:`, profile);

    // --- LA ÚNICA ADICIÓN CLAVE ---
    // Antes de cargar cualquier otra cosa, establecemos el gafete.
    await setActiveProfile(profile.id_usuario);
    // --- FIN DE LA ADICIÓN ---

    // Llamamos a tu función de navegación, sin cambios.
    loadNavigationModules(profile.id_rol);
});