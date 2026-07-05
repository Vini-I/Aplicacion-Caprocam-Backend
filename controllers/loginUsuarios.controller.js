/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.controller.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
Recibe las peticiones HTTP, consulta los modelos,
delega validaciones al servicio, aplica el DTO
correspondiente y devuelve la respuesta JSON al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/
import { LoginAdminDTO }          from "../dtos/loginAdmin.dto.js";
import { LoginOperarioDTO }       from "../dtos/loginOperario.dto.js";
import { LoginSincronizacionDTO } from "../dtos/loginSincronizacion.dto.js";

// Servicios
import {
    isContrasenaValida,
    hashContrasena,
    hashPin,
    isPinValido,
    isPin,
    isContrasenaSegura,
} from "../services/loginUsuarios.services.js";

// Modelos
import * as UsuariosModel from "../models/loginUsuarios.model.js";
import * as RolesModel    from "../models/loginRoles.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

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
    Autentica un administrador web por usuario o correo
    y contrasena.

    Parametros:
    - req.body: { usuario?, correo?, contrasena }

    Retorna:
    - 200 con los datos del administrador (sin contrasenaHash)
    - 404 si el usuario no existe
    - 401 si la contrasena es incorrecta
    */
    const { usuario, correo, contrasena } = req.body;
    const identificador = usuario || correo;

    const usuarioEncontrado = UsuariosModel.findByUsuarioOCorreo(identificador);

    if (!usuarioEncontrado || usuarioEncontrado.tipo !== "administrador")
        return error(res, "Usuario no encontrado.", null, 404);

    const contrasenaOk = await isContrasenaValida(
        contrasena,
        usuarioEncontrado.contrasenaHash
    );
    if (!contrasenaOk)
        return error(res, "Credenciales incorrectas.", null, 401);

    const rol = RolesModel.findById(usuarioEncontrado.rolId);

    return exito(res, "Login exitoso.", new LoginAdminDTO(usuarioEncontrado, rol.nombre));
}

export async function registrar(req, res) {
    /*
    Descripcion:
    Registra un nuevo administrador web.

    Parametros:
    - req.body: { nombre, apellidos, correo,
                  usuario, contrasena, rolId }

    Retorna:
    - 201 con los datos del administrador creado
    - 409 si el correo o usuario ya existen
    - 422 si la contrasena tiene menos de 8 caracteres
          o el rol no existe
    */
    const { nombre, apellidos, correo, usuario, contrasena, rolId } = req.body;

    if (!isContrasenaSegura(contrasena))
        return error(res, "La contrasena debe tener minimo 8 caracteres.", null, 422);

    if (UsuariosModel.findByCorreo(correo))
        return error(res, "El correo ya esta registrado.", null, 409);

    if (UsuariosModel.findByUsuario(usuario))
        return error(res, "El nombre de usuario ya existe.", null, 409);

    const rol = RolesModel.findById(rolId);
    if (!rol)
        return error(res, "El rol indicado no existe.", null, 422);

    const contrasenaHash = await hashContrasena(contrasena);
    const nuevo = UsuariosModel.create({
        nombre, apellidos, correo, usuario,
        contrasenaHash, rolId, tipo: "administrador"
    });

    return exito(
        res,
        "Administrador registrado correctamente.",
        new LoginAdminDTO(nuevo, rol.nombre),
        201
    );
}

export async function registrarOperario(req, res) {
    /*
    Descripcion:
    Registra un nuevo operario de campo con PIN de
    4 digitos. Solo accesible por administradores.

    Parametros:
    - req.body: { nombre, rolId, pin }

    Retorna:
    - 201 con los datos del operario creado (sin pinHash)
    - 422 si el PIN no tiene 4 digitos o el rol no existe
    */
    const { nombre, rolId, pin } = req.body;

    if (!isPin(pin))
        return error(
            res, "El PIN debe tener exactamente 4 digitos numericos.", null, 422
        );

    const rol = RolesModel.findById(rolId);
    if (!rol)
        return error(res, "El rol indicado no existe.", null, 422);

    const pinHash  = await hashPin(pin);
    const operario = UsuariosModel.create({
        nombre, apellidos: "", correo: null,
        usuario: null, pinHash, rolId, tipo: "operario"
    });

    return exito(
        res,
        "Operario registrado correctamente.",
        new LoginOperarioDTO(operario, rol),
        201
    );
}

export async function verificarPin(req, res) {
    /*
    Descripcion:
    Verifica el PIN de un operario desde la app movil.
    Devuelve el rol y pantallasPermitidas para controlar
    las vistas del dispositivo.

    Parametros:
    - req.body: { operarioId, pin }

    Retorna:
    - 200 con los datos del operario y su rol (sin pinHash)
    - 404 si el operario no existe
    - 401 si el PIN es incorrecto
    - 422 si el PIN no tiene formato de 4 digitos
    */
    const { operarioId, pin } = req.body;

    if (!isPin(pin))
        return error(
            res, "El PIN debe tener exactamente 4 digitos numericos.", null, 422
        );

    const operario = UsuariosModel.findById(operarioId);
    if (!operario || operario.tipo !== "operario")
        return error(res, "Operario no encontrado.", null, 404);

    const pinOk = await isPinValido(pin, operario.pinHash);
    if (!pinOk)
        return error(res, "PIN incorrecto.", null, 401);

    const rol = RolesModel.findById(operario.rolId);

    return exito(
        res, "PIN verificado correctamente.", new LoginOperarioDTO(operario, rol)
    );
}

export function sincronizar(req, res) {
    /*
    Descripcion:
    Devuelve todos los operarios activos con su pinHash
    para que la app movil los guarde en SQLite y pueda
    autenticar sin conexion a internet.

    Parametros:
    No posee (GET sin body).

    Retorna:
    - 200 con el arreglo de operarios (incluye pinHash)
    */
    const operarios = UsuariosModel.findAllOperarios();

    const data = operarios.map((operario) => {
        const rol = RolesModel.findById(operario.rolId);
        return new LoginSincronizacionDTO(operario, rol.nombre);
    });

    return exito(res, "Lista de operarios obtenida correctamente.", data);
}

export function obtenerPorId(req, res) {
    /*
    Descripcion:
    Obtiene un usuario por su ID.

    Parametros:
    - req.params.id: ID numerico del usuario.

    Retorna:
    - 200 con los datos del usuario (sin campos sensibles)
    - 404 si el usuario no existe
    */
    const usuario = UsuariosModel.findById(req.params.id);

    if (!usuario)
        return error(res, "Usuario no encontrado.", null, 404);

    const rol = RolesModel.findById(usuario.rolId);

    return exito(
        res, "Usuario obtenido correctamente.", new LoginAdminDTO(usuario, rol.nombre)
    );
}