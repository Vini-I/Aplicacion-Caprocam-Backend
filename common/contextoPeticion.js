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

export function obtenerContextoPeticion(req) {
    /*
    Descripcion:
    Analiza req.user y req.colaborador para retornar el contexto
    seguro de ejecucion de la peticion HTTP.

    Parametros:
    - req: Objeto request de Express autenticado con verificarAuth.

    Retorna:
    - Objeto { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId }
    */
    const user        = req.user ?? null;
    const colaborador = req.colaborador ?? null;

    // Jerarquia: Solo si un usuario web tiene accesoGlobal = true se respeta req.body
    const grupoDatos = user?.accesoGlobal && req.body?.grupoDatos
        ? Number(req.body.grupoDatos)
        : Number(user?.grupoDatos ?? colaborador?.grupoDatos);

    // Identidad de Creador (Dualidad):
    const esColab = Boolean(colaborador || user?.esColaborador);

    const creadoPorUsuarioId = esColab
        ? null
        : (user?.id ?? null);

    const creadoPorColaboradorId = colaborador
        ? colaborador.id
        : (user?.esColaborador ? user.id : null);

    return {
        grupoDatos,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
    };
}