/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: contextoPeticion.js
Autor: Marco Vásquez
Fecha: 30/07/2026
Modulo: Common
Descripcion:
Helper estandar para extraer de forma segura el grupo_datos,
creadoPorUsuarioId y creadoPorColaboradorId del JWT.
Soporta req.user (usuarios web) y req.colaborador (APK).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export const GRUPO_DATOS_CAPROCAM = 1;

export function obtenerContextoPeticion(req) {
    const user        = req.user ?? null;
    const colaborador = req.colaborador ?? null;

    // Detecta si es Administrador Caprocam por el numero de grupo 22776226 o flag
    const esGlobal = Boolean(
        user?.accesoGlobal || Number(user?.grupoDatos) === GRUPO_DATOS_CAPROCAM
    );

    // Si es Caprocam, acepta req.body.grupoDatos si viene en la peticion (ej: 101).
    // Si es usuario de finca normal (ej: 101), fuerza su grupo de sesion (101).
    const grupoDatos = esGlobal && req.body?.grupoDatos
        ? Number(req.body.grupoDatos)
        : Number(user?.grupoDatos ?? colaborador?.grupoDatos);

    return {
        grupoDatos,
        creadoPorUsuarioId:     colaborador ? null : (user?.id ?? null),
        creadoPorColaboradorId: colaborador ? colaborador.id : null,
    };
}