/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     alimentacion.middleware.js
Autor:       Felipe Salas
Fecha:       29/06/2026
Modulo:      Alimentacion
Descripcion:
Middleware de estructura del modulo de alimentacion.
Su unica responsabilidad es verificar que el body
exista y contenga los campos minimos requeridos.
No valida el contenido de los campos — eso lo hace
el servicio.
//////////////////////////////////////////////////////////
*/
 
/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
 
Common
*/
 
import { error } from '../../../common/respuestaJson.js';
 
/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
 
Campos que deben estar presentes en el body.
Los campos opcionales (presentacion, proveedor,
tipoAlimento, observaciones) no se listan aqui.
*/
 
const CAMPOS_REQUERIDOS = [
    'finca',
    'estanque',
    'fecha',
    'hora',
    'metodo',
    'cantidadKg',
];
 
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/
 
export function validarBodyAlimentacion(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y que contenga
    todos los campos minimos requeridos para un registro
    de alimentacion. No valida el valor de los campos,
    solo su presencia.
 
    Parametros:
    - req:  Objeto request de Express.
    - res:  Objeto response de Express.
    - next: Funcion para continuar al siguiente middleware.
 
    Retorna:
    - next() si el body tiene la estructura correcta.
    - 400 si el body esta vacio o faltan campos.
    */
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacio.', null, 400);
 
    const faltantes = CAMPOS_REQUERIDOS.filter(
        campo => req.body[campo] === undefined
              || req.body[campo] === null
    );
 
    if (faltantes.length > 0)
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(', ')}.`,
            null,
            400
        );
 
    next();
}