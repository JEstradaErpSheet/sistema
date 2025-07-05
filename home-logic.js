// home-logic.js - VERSIÓN CORREGIDA

document.addEventListener('DOMContentLoaded', () => {
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        window.location.href = '/';
        return;
    }

    const profile = JSON.parse(profileString);

    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        welcomeElement.textContent = `Bienvenido, ${profile.usuario}`;
    }

    // Llamamos a la función para cargar los módulos con el id_rol del perfil
    loadModules(profile.id_rol);
});

async function loadModules(roleId) {
    const modulesGrid = document.getElementById('modules-grid');

    // ¡CAMBIO IMPORTANTE! Usamos el nuevo nombre de la función: get_allowed_modules_citfsa
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

    modulesGrid.innerHTML = ''; // Limpiar "Cargando..."
    modules.forEach(module => {
        const card = document.createElement('a');
        card.href = module.page_url;
        card.className = 'app-card';
        // Usamos los nombres de columna que devuelve la función SQL
        card.innerHTML = `<img src="${module.icon_url}" alt="${module.module_name}"><span>${module.module_name}</span>`;
        modulesGrid.appendChild(card);
    });
}