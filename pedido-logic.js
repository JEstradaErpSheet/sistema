// Dentro de pedido-logic.js

/**
 * Función principal para obtener los pedidos desde el backend y dibujarlos en la tabla.
 */
async function loadPedidos() {
    showLoading(true);
    pedidosTableBody.innerHTML = '';

    // Obtenemos el perfil de localStorage, igual que para la barra de navegación
    const profile = JSON.parse(localStorage.getItem('selectedProfile'));
    if (!profile) {
        showError('Error crítico: No se pudo encontrar el perfil seleccionado.');
        return;
    }

    // CAMBIO CLAVE: Pasamos el id_usuario como parámetro a la RPC
    const { data, error } = await supabaseClient.rpc('get_pedidos_vista', { 
        p_profile_id: profile.id_usuario 
    });

    showLoading(false);
    if (error) {
        // El error "Acceso denegado" ya no debería aparecer.
        showError('Error al cargar los pedidos: ' + error.message);
        console.error(error);
        return;
    }
    // ... el resto de la función permanece igual ...
    if (data.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }

    data.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pedido.nopedido || 'N/A'}</td>
            <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
            <td>${pedido.nombreusuario || 'N/A'}</td>
            <td>${pedido.observaciones || ''}</td>
            <td><span class="badge ${getStatusClass(pedido.estadopedido)}">${pedido.estadopedido}</span></td>
            <td class="text-end">
                ${generateActionButtons(pedido)}
            </td>
        `;
        pedidosTableBody.appendChild(tr);
    });
}