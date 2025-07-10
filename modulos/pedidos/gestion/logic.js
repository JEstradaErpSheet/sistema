// Archivo: /modulos/pedidos/gestion/logic.js
// ...

async function loadPedidosAndActions(profileId) {
    const tableBody = document.getElementById('pedidos-table-body');
    const { data: pedidos, error } = await supabaseClient.rpc('get_gestion_pedidos_vista', { p_profile_id: profileId });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
        return;
    }
    if (pedidos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron pedidos.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = pedidos.map(pedido => {
        // --- INICIO DE LA LÓGICA MEJORADA ---

        // 1. Siempre empezamos con el botón "Ver Detalles"
        let actionsHtml = `<button class="btn btn-sm btn-info" data-action="view_details" data-id="${pedido.id_pedido}">Ver Detalles</button>`;

        // 2. Leemos las acciones de flujo de trabajo del backend
        const workflowActions = pedido.workflow_actions || []; // Usamos un array vacío si es null

        // 3. Añadimos los botones de flujo de trabajo a los que ya teníamos
        const workflowActionsHtml = workflowActions.map(action => 
            `<button class="btn btn-sm ${action.class}" data-action="${action.action_id}" data-id="${pedido.id_pedido}">${action.name}</button>`
        ).join(' ');

        // 4. Combinamos ambos, si hay acciones de flujo de trabajo
        if (workflowActionsHtml) {
            actionsHtml += ' ' + workflowActionsHtml;
        }

        // --- FIN DE LA LÓGICA MEJORADA ---

        return `
            <tr>
                <td>${pedido.nopedido || 'N/A'}</td>
                <td>${new Date(pedido.fechapedido + 'T00:00:00').toLocaleDateString()}</td>
                <td>${pedido.nombreusuario || 'N/A'}</td>
                <td>${pedido.observaciones || ''}</td>
                <td><span class="badge bg-secondary">${pedido.estadopedido || 'N/A'}</span></td>
                <td class="text-end">${actionsHtml}</td>
            </tr>
        `;
    }).join('');
}

// ...