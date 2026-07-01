/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     loginUsuarios.controller.js
Autor:       Rodolfo Chaves
Fecha:       28/06/2026
Modulo:      Login
Descripcion:
Recibe las peticiones HTTP, delega al servicio,
aplica el DTO correspondiente sobre los datos crudos
y devuelve la respuesta JSON estandarizada al cliente.
Toda la logica de negocio vive en el service, no aqui.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/
import { LoginAdminDTO }          from '../dtos/loginAdmin.dto.js';
import { LoginOperarioDTO }       from '../dtos/loginOperario.dto.js';
import { LoginSincronizacionDTO } from '../dtos/loginSincronizacion.dto.js';

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos / servicios
*/
import * as loginService from '../services/loginUsuarios.services.js';

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de login.
*/

export async function login(req, res) {
    /*
    Descripcion:
    Maneja el login web de administradores. Acepta usuario
    o correo como identificador junto con la contrasena.
    Aplica LoginAdminDTO sobre los datos crudos del service.

    Parametros:
    - req.body: { usuario?, correo?, contrasena }

    Retorna:
    - 200 con los datos del administrador (sin contrasenaHash)
    - 404 si el usuario no existe
    - 401 si la contrasena es incorrecta
    */
    try {
        const { usuario, correo, contrasena } = req.body;
        const identificador = usuario || correo;

        const { usuario: u, rol } = await loginService.loginAdmin(
            identificador,
            contrasena
        );

        return exito(res, 'Login exitoso.', new LoginAdminDTO(u, rol.nombre));
    } catch (err) {
        return error(res, err.mensaje ?? 'Error en login.', null, err.codigo ?? 500);
    }
}

export async function registrar(req, res) {
    /*
    Descripcion:
    Registra un nuevo administrador desde la plataforma
    web. Aplica LoginAdminDTO sobre los datos crudos del
    service.

    Parametros:
    - req.body: { nombre, apellidos, correo,
                  usuario, contrasena, rolId }

    Retorna:
    - 201 con los datos del administrador creado
    - 409 si el correo o usuario ya existen
    - 422 si la contrasena tiene menos de 8 caracteres
          o el rol no existe
    */
    try {
        const { usuario: u, rol } = await loginService.registrarAdmin(
            req.body
        );

        return exito(
            res,
            'Administrador registrado correctamente.',
            new LoginAdminDTO(u, rol.nombre),
            201
        );
    } catch (err) {
        return error(
            res,
            err.mensaje ?? 'Error al registrar.',
            null,
            err.codigo ?? 500
        );
    }
}

export async function registrarOperario(req, res) {
    /*
    Descripcion:
    Registra un nuevo operario de campo. Solo el
    administrador usa este endpoint desde la web.
    Aplica LoginOperarioDTO sobre los datos crudos del
    service.

    Parametros:
    - req.body: { nombre, rolId, pin }

    Retorna:
    - 201 con los datos del operario creado (sin pinHash)
    - 422 si el PIN no tiene 4 digitos o el rol no existe
    */
    try {
        const { operario, rol } = await loginService.registrarOperario(
            req.body
        );

        return exito(
            res,
            'Operario registrado correctamente.',
            new LoginOperarioDTO(operario, rol),
            201
        );
    } catch (err) {
        return error(
            res,
            err.mensaje ?? 'Error al registrar operario.',
            null,
            err.codigo ?? 500
        );
    }
}

export async function verificarPin(req, res) {
    /*
    Descripcion:
    Verifica el PIN de un operario de campo desde la app
    movil. Aplica LoginOperarioDTO que incluye las
    pantallasPermitidas para controlar las vistas del
    movil segun el rol.

    Parametros:
    - req.body: { operarioId, pin }

    Retorna:
    - 200 con los datos del operario y su rol (sin pinHash)
    - 404 si el operario no existe
    - 401 si el PIN es incorrecto
    - 422 si el PIN no tiene formato de 4 digitos
    */
    try {
        const { operarioId, pin } = req.body;

        const { operario, rol } = await loginService.verificarPin(
            operarioId,
            pin
        );

        return exito(
            res,
            'PIN verificado correctamente.',
            new LoginOperarioDTO(operario, rol)
        );
    } catch (err) {
        return error(
            res,
            err.mensaje ?? 'Error al verificar PIN.',
            null,
            err.codigo ?? 500
        );
    }
}

export function sincronizar(req, res) {
    /*
    Descripcion:
    Devuelve la lista completa de operarios activos para
    que la app movil la guarde en su SQLite local.
    Aplica LoginSincronizacionDTO que incluye el pinHash
    para verificacion offline.

    Parametros:
    No posee (GET sin body).

    Retorna:
    - 200 con el arreglo de operarios (incluye pinHash)
    */
    try {
        const lista = loginService.obtenerOperariosParaSincronizar();

        const data = lista.map(({ operario, rol }) =>
            new LoginSincronizacionDTO(operario, rol.nombre)
        );

        return exito(res, 'Lista de operarios obtenida correctamente.', data);
    } catch (err) {
        return error(
            res,
            err.mensaje ?? 'Error de sincronizacion.',
            null,
            err.codigo ?? 500
        );
    }
}

export function obtenerPorId(req, res) {
    /*
    Descripcion:
    Obtiene un usuario por su ID. Aplica LoginAdminDTO
    sobre los datos crudos del service.

    Parametros:
    - req.params.id: ID numerico del usuario.

    Retorna:
    - 200 con los datos del usuario (sin campos sensibles)
    - 404 si el usuario no existe
    */
    try {
        const { usuario, rol } = loginService.obtenerPorId(req.params.id);

        return exito(
            res,
            'Usuario obtenido correctamente.',
            new LoginAdminDTO(usuario, rol.nombre)
        );
    } catch (err) {
        return error(
            res,
            err.mensaje ?? 'Error al obtener usuario.',
            null,
            err.codigo ?? 500
        );
    }
}