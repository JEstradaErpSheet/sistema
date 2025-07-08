-- Función SQL final y correcta que debe estar en tu base de datos
CREATE OR REPLACE FUNCTION public.get_allowed_modules_citfsa()
RETURNS TABLE(id_modulo TEXT, etiqueta TEXT, url_pagina TEXT, icono TEXT)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
    v_id_rol_del_usuario TEXT;
BEGIN
    SELECT u.id_rol INTO v_id_rol_del_usuario
    FROM erp_sistema.usuario u
    WHERE u.id_usuario = public.get_profile_id();

    IF v_id_rol_del_usuario IS NOT NULL THEN
        RETURN QUERY
        SELECT 
            m.id_modulos,
            m.etiqueta,
            m.url_pagina,
            m.imagen_etiqueta_url -- Mapeamos imagen_etiqueta_url a la columna de salida 'icono'
        FROM erp_sistema.permiso p
        JOIN erp_sistema.modulo m ON p.id_modulo = m.id_modulos 
        WHERE p.id_rol = v_id_rol_del_usuario
        ORDER BY m.id_modulos;
    END IF;
END;
$$;