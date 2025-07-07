// crm-logic.js - La "Cerradura Ligera" para esta oficina

document.addEventListener('DOMContentLoaded', () => {
    // Verificamos si la 'Caja de Herramientas' está disponible
    if (typeof supabaseClient === 'undefined') {
        console.error('ERROR CRÍTICO: supabaseClient no está definido.');
        return;
    }

    // Verificamos si el usuario tiene el "Pase de Empleado"
    const profileString = localStorage.getItem('selectedProfile');
    if (!profileString) {
        console.warn('Acceso denegado: no hay un perfil seleccionado. Redirigiendo...');
        // Usamos la función global de la Caja de Herramientas para un logout limpio
        handleLogout();
    } else {
        // Opcional: Podemos usar los datos del perfil si los necesitamos en el futuro
        const profile = JSON.parse(profileString);
        console.log(`Acceso permitido a CRM para el perfil:`, profile);
    }
});