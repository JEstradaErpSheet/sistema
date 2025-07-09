// --- LÓGICA DE CARGA SEGURA DEL IFRAME (VERSIÓN USER SETTINGS) ---
const iframe = document.getElementById('appsheet-iframe');
if (iframe) {
    const baseUrl = "https://www.appsheet.com/start/5a784626-ab7c-4b92-969b-039c5d188b54"; // Tu URL
    
    // Construimos la URL final. Usamos el prefijo 'UserSettings.'
    // Esto le dice a AppSheet: "Establece el valor de esta configuración de usuario al iniciar".
    const finalUrl = `${baseUrl}#appName=Compras-46482564&UserSettings.ActiveProfileId=${profile.id_usuario}`;
    
    console.log("Cargando AppSheet con User Settings:", finalUrl);
    iframe.src = finalUrl;
}