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
import { LoginAdminDTO } from "../dtos/loginAdmin.dto.js";
import { LoginOperarioDTO } from "../dtos/loginOperario.dto.js";
import { LoginSincronizacionDTO } from "../dtos/loginSincronizacion.dto.js";
import {
    isContrasenaValida,
    hashContrasena,
    hashPin,
    isPinValido,
    isPin,
    isContrasenaSegura,
    obtenerPantallasPermitidas
} from "../services/loginUsuarios.services.js";
import * as UsuariosModel from "../models/loginUsuarios.model.js";
import * as RolesModel from "../models/loginRoles.model.js";
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de login.
*/
async function cargarRolConPantallas(rolId) {
    const rol = await RolesModel.findById(rolId);

    if (!rol) {
        return null;
    }

    return {
        ...rol,
        pantallasPermitidas: obtenerPantallasPermitidas(rol.nombre)
    };
}

function normalizarEmail(valor) {
    return String(valor ?? "").trim();
}

function normalizarNombreUsuario(valor) {
    return String(valor ?? "").trim();
}

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
    try {
        const identificador = req.body.usuario ?? req.body.correo ?? req.body.email ?? req.body.nombreUsuario;
        const contrasena = req.body.contrasena;

        const usuarioEncontrado = await UsuariosModel.findUsuarioByIdentificador(identificador);

        if (!usuarioEncontrado) {
            return error(res, "Usuario no encontrado.", null, 404);
        }

        const contrasenaOk = await isContrasenaValida(
            contrasena,
            usuarioEncontrado.passwordHash
        );

        if (!contrasenaOk) {
            return error(res, "Credenciales incorrectas.", null, 401);
        }

        const rol = await cargarRolConPantallas(usuarioEncontrado.rolId);

        return exito(
            res,
            "Login exitoso.",
            new LoginAdminDTO(usuarioEncontrado, rol)
        );
    } catch (err) {
        return error(res, "Error al iniciar sesion.", null, 500);
    }
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
    try {
        const nombre = req.body.nombre;
        const apellidos = req.body.apellidos;
        const email = normalizarEmail(req.body.email ?? req.body.correo);
        const nombreUsuario = normalizarNombreUsuario(req.body.nombreUsuario ?? req.body.usuario);
        const contrasena = req.body.contrasena;
        const rolId = req.body.rolId;
        const grupoDatos = req.body.grupoDatos;
        const telefono = req.body.telefono;

        if (!isContrasenaSegura(contrasena)) {
            return error(res, "La contrasena debe tener minimo 8 caracteres.", null, 422);
        }

        const correoExistente = await UsuariosModel.findUsuarioByCorreo(email);
        if (correoExistente) {
            return error(res, "El correo ya esta registrado.", null, 409);
        }

        const usuarioExistente = await UsuariosModel.findUsuarioByNombreUsuario(nombreUsuario);
        if (usuarioExistente) {
            return error(res, "El nombre de usuario ya existe.", null, 409);
        }

        const rol = await cargarRolConPantallas(rolId);
        if (!rol) {
            return error(res, "El rol indicado no existe.", null, 422);
        }

        const passwordHash = await hashContrasena(contrasena);

        const nuevo = await UsuariosModel.createUsuario({
            grupoDatos,
            rolId,
            nombre,
            apellidos,
            email,
            nombreUsuario,
            passwordHash,
            telefono
        });

        return exito(
            res,
            "Administrador registrado correctamente.",
            new LoginAdminDTO(nuevo, rol),
            201
        );
    } catch (err) {
        return error(res, "Error al registrar el administrador.", null, 500);
    }
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
    try {
        const nombre = req.body.nombre;
        const apellidos = req.body.apellidos;
        const nombreUsuario = normalizarNombreUsuario(req.body.nombreUsuario ?? req.body.usuario);
        const email = req.body.email ?? req.body.correo ?? null;
        const telefono = req.body.telefono ?? null;
        const grupoDatos = req.body.grupoDatos;
        const fincaId = req.body.fincaId ?? null;
        const rolId = req.body.rolId;
        const pin = req.body.pin;
        const tipoColaborador = req.body.tipoColaborador ?? "external_collab";

        if (!isPin(pin)) {
            return error(res, "El PIN debe tener exactamente 4 digitos numericos.", null, 422);
        }

        const rol = await cargarRolConPantallas(rolId);
        if (!rol) {
            return error(res, "El rol indicado no existe.", null, 422);
        }

        const pinHash = await hashPin(pin);

        const operario = await UsuariosModel.createColaborador({
            grupoDatos,
            fincaId,
            rolId,
            nombre,
            apellidos,
            telefono,
            email,
            nombreUsuario,
            pinHash,
            tipoColaborador
        });

        return exito(
            res,
            "Operario registrado correctamente.",
            new LoginOperarioDTO(operario, rol),
            201
        );
    } catch (err) {
        return error(res, "Error al registrar el operario.", null, 500);
    }
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
    try {
        const { operarioId, pin } = req.body;

        if (!isPin(pin)) {
            return error(res, "El PIN debe tener exactamente 4 digitos numericos.", null, 422);
        }

        const operario = await UsuariosModel.findColaboradorById(operarioId);

        if (!operario) {
            return error(res, "Operario no encontrado.", null, 404);
        }

        const pinOk = await isPinValido(pin, operario.pinHash);

        if (!pinOk) {
            return error(res, "PIN incorrecto.", null, 401);
        }

        const rol = await cargarRolConPantallas(operario.rolId);

        return exito(
            res,
            "PIN verificado correctamente.",
            new LoginOperarioDTO(operario, rol)
        );
    } catch (err) {
        return error(res, "Error al verificar el PIN.", null, 500);
    }
}

export async function sincronizar(req, res) {
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
    try {
        const operarios = await UsuariosModel.findAllColaboradores();

        const data = await Promise.all(
            operarios.map(async (operario) => {
                const rol = await cargarRolConPantallas(operario.rolId);
                return new LoginSincronizacionDTO(operario, rol);
            })
        );

        return exito(res, "Lista de operarios obtenida correctamente.", data);
    } catch (err) {
        return error(res, "Error al sincronizar los operarios.", null, 500);
    }
}

export async function obtenerPorId(req, res) {
    try {
        const usuario = await UsuariosModel.findUsuarioById(req.params.id);

        if (usuario) {
            const rol = await cargarRolConPantallas(usuario.rolId);
            return exito(
                res,
                "Usuario obtenido correctamente.",
                new LoginAdminDTO(usuario, rol)
            );
        }

        const operario = await UsuariosModel.findColaboradorById(req.params.id);

        if (operario) {
            const rol = await cargarRolConPantallas(operario.rolId);
            return exito(
                res,
                "Usuario obtenido correctamente.",
                new LoginOperarioDTO(operario, rol)
            );
        }

        return error(res, "Usuario no encontrado.", null, 404);
    } catch (err) {
        return error(res, "Error al obtener el usuario.", null, 500);
    }
}
