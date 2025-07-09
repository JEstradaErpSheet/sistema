document.addEventListener('DOMContentLoaded', () => {
    // ... tu código de verificación de perfil ...
    const profile = JSON.parse(localStorage.getItem('selectedProfile'));
    
    // Cargar la barra de navegación (esto ya funciona)
    loadNavigationModules(profile.id_usuario);
    
    // --- LÓGICA DE CARGA SEGURA DEL IFRAME ---
    const iframe = document.getElementById('appsheet-iframe');
    if (iframe) {
        // La URL base de tu aplicación de AppSheet
        const baseUrl = "https://www.appsheet.com/start/5a784626-ab7c-4b92-969b-039c5d188b54"; // Tu URL
        
        // Construimos la URL final, pasando el ID del perfil como un InitialValue.
        // El # al principio es importante para AppSheet.
        const finalUrl = `${baseUrl}#appName=Compras-46482564&initialValue._userProfileId=${profile.id_usuario}`;
        
        console.log("Cargando AppSheet con URL segura y filtro de contexto:", finalUrl);
        iframe.src = finalUrl;
    }
});

// La función loadNavigationModules se queda como la tenemos ahora.
async function loadNavigationModules(profileId) { /* ... tu código funcional ... */ }