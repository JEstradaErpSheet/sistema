// select-profile-logic.js - VERSIÓN FINAL CON SEGURIDAD JWT

document.addEventListener('DOMContentLoaded', async () => {
    // ... (El código para obtener y mostrar los perfiles no cambia, déjalo como está)
    // ... Asegúrate de que tu lógica para crear los botones y abrir el modal siga aquí ...

    const passwordModal = document.getElementById('passwordModal');
    const passwordForm = document.getElementById('passwordForm');
    const selectedProfileIdInput = document.getElementById('selectedProfileId');
    const statusMessage = document.getElementById('statusMessage');

    // Esta función se llama cuando se hace clic en un botón de perfil
    window.openPasswordModal = (profileId, profileLabel) => {
        selectedProfileIdInput.value = profileId;
        document.getElementById('profileLabel').textContent = profileLabel;
        statusMessage.textContent = '';
        passwordModal.style.display = 'block';
    };

    // Manejar el envío del formulario de contraseña
    passwordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusMessage.textContent = 'Verificando...';

        const profileId = selectedProfileIdInput.value;
        const password = document.getElementById('passwordInput').value;

        // 1. Verificar la contraseña del perfil
        const { data: isValid, error: passError } = await supabaseClient.rpc('verificar_contrasena_citfsa', {
            p_id_usuario: profileId,
            p_contrasena_ingresada: password
        });

        if (passError || !isValid) {
            statusMessage.textContent = 'Contraseña incorrecta. Inténtelo de nuevo.';
            console.error('Error de contraseña:', passError);
            return;
        }

        // --- INICIO DE LA NUEVA LÓGICA DE SEGURIDAD ---
        // 2. Si la contraseña es correcta, "sellamos" el pasaporte del usuario.
        // Añadimos el ID del perfil a los metadatos del usuario.
        console.log(`Contraseña correcta. Sellando pasaporte con profile_id: ${profileId}`);
        const { data: user, error: updateError } = await supabaseClient.auth.updateUser({
            data: {
                // El nombre de esta propiedad DEBE COINCIDIR con lo que busca la función get_profile_id()
                profile_id: profileId 
            }
        });

        if (updateError) {
            statusMessage.textContent = 'Error crítico al configurar la sesión. Por favor, contacte a soporte.';
            console.error('Error al actualizar metadatos del usuario:', updateError);
            return;
        }
        
        // 3. Guardar el perfil completo en localStorage para uso en el frontend
        // (Esto es opcional si ya tienes la lógica, pero asegúrate de que se haga)
        const profileData = { id_usuario: profileId /* ...otros datos del perfil que necesites...*/ };
        localStorage.setItem('selectedProfile', JSON.stringify(profileData));
        
        // 4. Redirigir al home
        statusMessage.textContent = '¡Acceso concedido! Redirigiendo...';
        window.location.href = '/home.html';
        // --- FIN DE LA NUEVA LÓGICA DE SEGURIDAD ---
    });

    // ... (El resto de tu lógica para cerrar el modal, etc., puede permanecer) ...
});