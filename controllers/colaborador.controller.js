/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.controller.js
Autor: Marco Vásquez
Fecha: 28/06/2026
Modulo: Colaboradores
Descripcion:
Recibe las peticiones HTTP, delega al servicio y modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/
import { ColaboradorDTO, RolColaborador } from '../dtos/colaborador.dto.js';

// Servicios
import { isEmail, isPhone, isEmpty } from '../services/colaborador.service.js';

// Modelos
import * as ColaboradorModel from '../models/colaborador.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

La funcion createColaborador() y updateColaborador()
dependen de esta funcion para trabajar.
*/

function validarCuerpo({ nombre, apellidos, telefono, email, rol }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - nombre, apellidos, telefono, email, rol: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(nombre) || isEmpty(apellidos))
        return error(res, 'Nombre y apellidos son requeridos.', null, 400);

    if (!isEmail(email))
        return error(res, 'El email no tiene un formato válido.', null, 422);

    if (telefono && !isPhone(telefono))
        return error(res, 'El teléfono debe tener 8 dígitos.', null, 422);

    if (!Object.values(RolColaborador).includes(rol))
        return error(res, `Rol inválido. Opciones: ${Object.values(RolColaborador).join(', ')}`, null, 422);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de colaboradores.
*/

export function getColaboradores(req, res) {
    /*
    Descripcion:
    Obtiene todos los colaboradores.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de colaboradores
    */
    const data = ColaboradorModel.findAll();
    return exito(res, 'Colaboradores obtenidos correctamente.', data);
}

export function getColaboradorById(req, res) {
    /*
    Descripcion:
    Obtiene un colaborador por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el colaborador encontrado
    - 404 si no existe
    */
    const colaborador = ColaboradorModel.findById(req.params.id);

    if (!colaborador)
        return error(res, 'Colaborador no encontrado.', null, 404);

    return exito(res, 'Colaborador obtenido correctamente.', colaborador);
}

export function createColaborador(req, res) {
    /*
    Descripcion:
    Crea un nuevo colaborador.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el colaborador creado
    - 400/422 si hay errores de validacion
    */
    const { nombre, apellidos, telefono, email, rol } = req.body;

    const err = validarCuerpo({ nombre, apellidos, telefono, email, rol }, res);
    if (err) return err;

    const dto   = new ColaboradorDTO({ nombre, apellidos, telefono, email, rol });
    const nuevo = ColaboradorModel.create(dto);

    return exito(res, 'Colaborador creado correctamente.', nuevo, 201);
}

export function updateColaborador(req, res) {
    /*
    Descripcion:
    Actualiza un colaborador existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el colaborador actualizado
    - 400/422 si hay errores de validacion
    - 404 si no existe
    */
    const { nombre, apellidos, telefono, email, rol } = req.body;

    const err = validarCuerpo({ nombre, apellidos, telefono, email, rol }, res);
    if (err) return err;

    const dto         = new ColaboradorDTO({ nombre, apellidos, telefono, email, rol });
    const actualizado = ColaboradorModel.update(req.params.id, dto);

    if (!actualizado)
        return error(res, 'Colaborador no encontrado.', null, 404);

    return exito(res, 'Colaborador actualizado correctamente.', actualizado);
}

export function deleteColaborador(req, res) {
    /*
    Descripcion:
    Elimina un colaborador por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el colaborador eliminado
    - 404 si no existe
    */
    const eliminado = ColaboradorModel.remove(req.params.id);

    if (!eliminado)
        return error(res, 'Colaborador no encontrado.', null, 404);

    return exito(res, 'Colaborador eliminado correctamente.', eliminado);
}