// home-logic.js - VERSIÓN CORREGIDA Y ROBUSTA

document.addEventListener('DOMContentLoaded', () => {
    // Es crucial que el cliente de Supabase esté definido ANTES de que se ejecute esta lógica.
    // La palabra 'defer' en la etiqueta <script> de home.html ayuda a asegurar esto.
    if (typeof supabaseClient === 'undefined') {
        console.error('CRITICAL ERROR: supabaseClient no está definido. Asegúrate de que supabase-client.js se carga antes que este script.');
        return;
    }

    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        console.warn('No se encontró un perfil seleccionado. Redirigiendo al inicio.');
        // Usamos handleLogout para una limpieza completa antes de redirigir
        handleLogout(); 
        return;
    }

    const profile = JSON.parse(profileString);
    console.log('Perfil activo:', profile);

    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        // Usamos etiquetausuario si existe, si no, usuario.
        welcomeElement.textContent = `Bienvenido, ${profile.etiquetausuario || profile.usuario}`;
    }

    // Llamamos a la función para cargar los módulos con el id_rol del perfil
    loadModules(profile.id_rol);
});

async function loadModules(roleId) {
    if (!roleId) {
        console.error('No se proporcionó un ID de rol para cargar los módulos.');
        return;
    }
    
    const modulesGrid = document.getElementById('modules-grid');
    console.log(`Llamando a RPC get_allowed_modules_citfsa para el rol ID: ${roleId}`);

    const { data: modules, error } = await supabaseClient.rpc('get_allowed_modules_citfsa', {
        p_user_role_id: roleId
    });

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
    modulesGrid.innerHTML = ''; // Limpiar "Cargando..."
    modules.forEach(module => {
        const card = document.createElement('a');
        card.href = module.page_url || '#'; // Enlace por defecto si la URL es nula
        card.className = 'app-card';
        
        const iconUrl = module.icon_url || 'img/default-icon.png'; // Icono por defecto
        const moduleName = module.module_name || 'Módulo sin nombre';

        card.innerHTML = `<img src="${iconUrl}" alt="${moduleName}"><span>${moduleName}</span>`;
        modulesGrid.appendChild(card);
    });
}