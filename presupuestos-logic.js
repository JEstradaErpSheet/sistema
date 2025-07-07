// presupuestos-logic.js - VERSIÓN 2.0 (Ahora también carga la barra de navegación)

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient === 'undefined') {
        console.error('ERROR CRÍTICO: supabaseClient no está definido.');
        return;
    }

    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        console.warn('Acceso denegado: no hay un perfil seleccionado. Redirigiendo...');
        handleLogout();
        return;
    }
    
    const profile = JSON.parse(profileString);
    console.log(`Acceso permitido a Contabilidad para el perfil:`, profile);

    // ¡NUEVO! Llamamos a la función para cargar la barra de navegación
    loadNavigationModules(profile.id_rol);
});

/**
 * Carga los módulos permitidos para un rol en la barra de navegación superior.
 * @param {string} roleId El ID del rol del usuario.
 */
async function loadNavigationModules(roleId) {
    const navBar = document.getElementById('module-navigation-bar');
    if (!navBar) {
        console.error('No se encontró el contenedor de la barra de navegación.');
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
        return; // No mostramos nada en la barra si hay un error
    }

    if (!modules || modules.length === 0) {
        console.warn('No se encontraron módulos para este perfil.');
        return;
    }

    // Limpiamos la barra antes de llenarla
    navBar.innerHTML = ''; 
    modules.forEach(module => {
        const link = document.createElement('a');
        link.href = module.page_url || '#';
        link.textContent = module.module_name || 'Módulo';

        // Resaltamos el link de la página actual
        if (window.location.pathname.includes(module.page_url)) {
            link.className = 'active';
        }
        
        navBar.appendChild(link);
    });
}