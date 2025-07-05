// home-logic.js

document.addEventListener('DOMContentLoaded', () => {
    // Leemos el perfil que guardamos en el paso anterior
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        // Si no hay perfil, lo echamos a la página de inicio. Seguridad extra.
        window.location.href = '/';
        return;
    }

    const profile = JSON.parse(profileString);

    // Mostramos el mensaje de bienvenida
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement) {
        // Usamos la columna 'usuario'
        welcomeElement.textContent = `Bienvenido, ${profile.usuario}`;
    }

    // Llamamos a la función para cargar los módulos
    loadModules(profile.id_rol);
});

async function loadModules(roleId) {
    const modulesGrid = document.getElementById('modules-grid');

    // Llamamos a la función SQL para obtener los módulos permitidos
    const { data: modules, error } = await supabaseClient.rpc('erp_sistema.get_allowed_modules', {
        user_role_id: roleId
    });

    if (error || !modules) {
        modulesGrid.innerHTML = '<p class="error-text">Error al cargar los módulos.</p>';
        return;
    }

    if (modules.length === 0) {
        modulesGrid.innerHTML = '<p>No tienes módulos asignados para este perfil.</p>';
        return;
    }

    modulesGrid.innerHTML = ''; // Limpiamos "Cargando..."
    modules.forEach(module => {
        // Creamos un enlace por cada módulo
        const card = document.createElement('a');
        card.href = module.page_url; // La URL de tu página (ej. crm.html)
        card.className = 'app-card';
        // Usamos 'etiqueta' e 'imagen_etiqueta_url' que definiste en tu función SQL
        card.innerHTML = `<img src="${module.imagen_etiqueta_url}" alt="${module.module_name}"><span>${module.module_name}</span>`;
        modulesGrid.appendChild(card);
    });
}