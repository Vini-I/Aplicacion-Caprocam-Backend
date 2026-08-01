/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.controller.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 30/07/2026
Modulo: Login / Usuarios
Descripcion:
Recibe las peticiones HTTP, consulta los modelos,
delega validaciones al servicio, aplica DTOs y gestiona
usuarios con control jerarquico de grupo_datos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import jwt from 'jsonwebtoken';

// DTOs
import { LoginAdminDTO }          from '../dtos/loginAdmin.dto.js';
import { LoginOperarioDTO }       from '../dtos/loginOperario.dto.js';
import { LoginSincronizacionDTO } from '../dtos/loginSincronizacion.dto.js';

// Servicios
import {
    isContrasenaValida,
    hashContrasena,
    hashPin,
    isPinValido,
    isPin,
    isContrasenaSegura,
    estaBloqueado,
    registrarIntentoFallido,
    resetearIntentosLogin,
    obtenerPantallasPermitidas,
} from '../services/loginUsuarios.services.js';

// Modelos
import * as UsuariosModel      from '../models/loginUsuarios.model.js';
import * as RolesModel         from '../models/loginRoles.model.js';
import * as RefreshTokensModel from '../models/refreshTokens.model.js';

// Config
import {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES,
} from '../config/jwt.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

login() depende de generarTokens() y cargarRolConPantallas().
refresh() depende de cargarRolConPantallas().
registrar() y registrarOperario() dependen de cargarRolConPantallas().
verificarPin() depende de cargarRolConPantallas().
sincronizar() depende de cargarRolConPantallas().
*/

function generarTokens(payload) {
    /*
    Descripcion:
    Genera un Access Token y un Refresh Token firmados.

    Parametros:
    - payload: Objeto con id, grupoDatos, rolId, nombre y accesoGlobal.

    Retorna:
    - Objeto con accessToken, refreshToken y expiraEn.
    */
    const accessToken  = jwt.sign(payload, JWT_SECRET,         { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });

    const decoded  = jwt.decode(refreshToken);
    const expiraEn = new Date(decoded.exp * 1000);

    return { accessToken, refreshToken, expiraEn };
}

async function cargarRolConPantallas(rolId) {
    /*
    Descripcion:
    Busca un rol por ID y le adjunta las pantallas permitidas.

    Parametros:
    - rolId: ID numerico del rol.

    Retorna:
    - Objeto rol con pantallasPermitidas, o null si no existe.
    */
    const rol = await RolesModel.findById(rolId);
    if (!rol) return null;
    return { ...rol, pantallasPermitidas: obtenerPantallasPermitidas(rol.nombre) };
}

function normalizarEmail(valor) {
    return String(valor ?? '').trim();
}

function normalizarNombreUsuario(valor) {
    return String(valor ?? '').trim();
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de login y usuarios.
*/

export async function login(req, res) {
    /*
    Descripcion:
    Autentica un administrador web por usuario o correo
    y contrasena. Aplica limite de 5 intentos fallidos.
    Genera y persiste tokens JWT.

    Parametros:
    - req.body: { usuario?, correo?, contrasena }

    Retorna:
    - 200 con tokens y datos del administrador
    - 404 si el usuario no existe
    - 401 si la contrasena es incorrecta (muestra intentos restantes)
    - 429 si la cuenta esta bloqueada por superar 5 intentos
    */
    try {
        const identificador = req.body.usuario    ??
                              req.body.correo      ??
                              req.body.email       ??
                              req.body.nombreUsuario;
        const contrasena    = req.body.contrasena;

        if (!identificador || !contrasena)
            return error(res, 'Usuario y contrasena son requeridos.', null, 400);

        // Verificacion de bloqueo por 5 intentos fallidos
        const estadoBloqueo = estaBloqueado(identificador);
        if (estadoBloqueo.bloqueado) {
            const msg = `Cuenta bloqueada por superar 5 intentos. ` +
                        `Intente de nuevo en ${estadoBloqueo.tiempoRestanteMinutos} min.`;
            return error(res, msg, null, 429);
        }

        const usuarioEncontrado = await UsuariosModel.findUsuarioByIdentificador(identificador);

        if (!usuarioEncontrado)
            return error(res, 'Usuario no encontrado.', null, 404);

        const contrasenaOk = await isContrasenaValida(contrasena, usuarioEncontrado.passwordHash);

        if (!contrasenaOk) {
            const resultadoIntento = registrarIntentoFallido(identificador);
            if (resultadoIntento.bloqueado) {
                return error(res, 'Ha superado el maximo de 5 intentos. Cuenta bloqueada 15 min.', null, 429);
            }
            const msg = `Credenciales incorrectas. Intentos restantes: ${resultadoIntento.intentosRestantes}.`;
            return error(res, msg, null, 401);
        }

        // Login exitoso: se resetea el contador de intentos fallidos
        resetearIntentosLogin(identificador);

        const rol = await cargarRolConPantallas(usuarioEncontrado.rolId);

        const payload = {
            id:           usuarioEncontrado.id,
            grupoDatos:   usuarioEncontrado.grupoDatos,
            rolId:        usuarioEncontrado.rolId,
            nombre:       usuarioEncontrado.nombre,
            accesoGlobal: Boolean(rol?.accesoGlobal),
            esColaborador: false,
        };

        const { accessToken, refreshToken, expiraEn } = generarTokens(payload);
        await RefreshTokensModel.guardar(refreshToken, expiraEn, usuarioEncontrado.id, null);

        return exito(res, 'Login exitoso.', {
            accessToken,
            refreshToken,
            usuario: new LoginAdminDTO(usuarioEncontrado, rol),
        });
    } catch (err) {
        return error(res, 'Error al iniciar sesion.', err);
    }
}

export async function registrar(req, res) {
    /*
    Descripcion:
    Registra un nuevo administrador/usuario web.
    Jerarquia: Valida grupo_datos mediante obtenerContextoPeticion().
    Solo superadministradores pueden elegir grupo_datos de otros.

    Parametros:
    - req.body: { nombre, apellidos, correo, usuario, contrasena, rolId, grupoDatos? }

    Retorna:
    - 201 con los datos del administrador creado
    - 409 si el correo o usuario ya existen
    - 422 si la contrasena no cumple politicas o rol invalido
    */
    try {
        const nombre        = req.body.nombre;
        const apellidos     = req.body.apellidos;
        const email         = normalizarEmail(req.body.email ?? req.body.correo);
        const nombreUsuario = normalizarNombreUsuario(req.body.nombreUsuario ?? req.body.usuario);
        const contrasena    = req.body.contrasena;
        const rolId         = req.body.rolId;
        const telefono      = req.body.telefono;

        // Jerarquia: Extrae grupoDatos de forma segura (solo accesoGlobal puede cambiarlo)
        const { grupoDatos } = obtenerContextoPeticion(req);

        if (!isContrasenaSegura(contrasena)) {
            const msgErr = 'La contrasena debe tener al menos 8 caracteres, ' +
                           'una mayuscula, una minuscula, un numero y un simbolo.';
            return error(res, msgErr, null, 422);
        }

        const correoExistente = await UsuariosModel.findUsuarioByCorreo(email);
        if (correoExistente)
            return error(res, 'El correo ya esta registrado.', null, 409);

        const usuarioExistente = await UsuariosModel.findUsuarioByNombreUsuario(nombreUsuario);
        if (usuarioExistente)
            return error(res, 'El nombre de usuario ya existe.', null, 409);

        const rol = await cargarRolConPantallas(rolId);
        if (!rol)
            return error(res, 'El rol indicado no existe.', null, 422);

        const passwordHash = await hashContrasena(contrasena);

        const nuevo = await UsuariosModel.createUsuario({
            grupoDatos,
            rolId,
            nombre,
            apellidos,
            email,
            nombreUsuario,
            passwordHash,
            telefono,
        });

        return exito(res, 'Administrador registrado correctamente.', new LoginAdminDTO(nuevo, rol), 201);
    } catch (err) {
        return error(res, 'Error al registrar el administrador.', err);
    }
}

export async function registrarOperario(req, res) {
    /*
    Descripcion:
    Registra un nuevo operario de campo con PIN de 4 digitos.
    Solo accesible por usuarios autenticados. Usa contexto seguro.

    Parametros:
    - req.body: { nombre, apellidos, nombreUsuario, rolId, pin }

    Retorna:
    - 201 con los datos del operario creado (sin pinHash)
    - 422 si el PIN no tiene 4 digitos o el rol no existe
    */
    try {
        const nombre          = req.body.nombre;
        const apellidos       = req.body.apellidos;
        const nombreUsuario   = normalizarNombreUsuario(req.body.nombreUsuario ?? req.body.usuario);
        const email           = req.body.email ?? req.body.correo ?? null;
        const telefono        = req.body.telefono ?? null;
        const fincaId         = req.body.fincaId ?? null;
        const rolId           = req.body.rolId;
        const pin             = req.body.pin;
        const tipoColaborador = req.body.tipoColaborador ?? 'external_collab';

        const { grupoDatos }  = obtenerContextoPeticion(req);

        if (!isPin(pin))
            return error(res, 'El PIN debe tener exactamente 4 digitos numericos.', null, 422);

        const rol = await cargarRolConPantallas(rolId);
        if (!rol)
            return error(res, 'El rol indicado no existe.', null, 422);

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
            tipoColaborador,
        });

        return exito(res, 'Operario registrado correctamente.', new LoginOperarioDTO(operario, rol), 201);
    } catch (err) {
        return error(res, 'Error al registrar el operario.', err);
    }
}

export async function verificarPin(req, res) {
    /*
    Descripcion:
    Verifica el PIN de un operario/colaborador desde la app movil.
    Genera tokens JWT con esColaborador: true y los devuelve
    junto al rol y pantallasPermitidas.

    Parametros:
    - req.body: { operarioId, pin }

    Retorna:
    - 200 con tokens, datos del colaborador y su rol
    - 404 si el operario no existe
    - 401 si el PIN es incorrecto
    - 422 si el PIN no tiene formato de 4 digitos
    */
    try {
        const { operarioId, pin } = req.body;

        if (!isPin(pin))
            return error(res, 'El PIN debe tener exactamente 4 digitos numericos.', null, 422);

        const operario = await UsuariosModel.findColaboradorById(operarioId);

        if (!operario)
            return error(res, 'Operario no encontrado.', null, 404);

        const pinOk = await isPinValido(pin, operario.pinHash);

        if (!pinOk)
            return error(res, 'PIN incorrecto.', null, 401);

        const rol = await cargarRolConPantallas(operario.rolId);

        // Generar JWT para el Colaborador de campo
        const payload = {
            id:           operario.id,
            grupoDatos:   operario.grupoDatos,
            rolId:        operario.rolId,
            nombre:       operario.nombre,
            accesoGlobal: false,
            esColaborador: true,
        };

        const { accessToken, refreshToken, expiraEn } = generarTokens(payload);
        await RefreshTokensModel.guardar(refreshToken, expiraEn, null, operario.id);

        return exito(res, 'PIN verificado correctamente.', {
            accessToken,
            refreshToken,
            colaborador: new LoginOperarioDTO(operario, rol),
        });
    } catch (err) {
        return error(res, 'Error al verificar el PIN.', err);
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

        return exito(res, 'Lista de operarios obtenida correctamente.', data);
    } catch (err) {
        return error(res, 'Error al sincronizar los operarios.', err);
    }
}

export async function obtenerPorId(req, res) {
    /*
    Descripcion:
    Obtiene un usuario o colaborador por su ID.
    Busca primero en usuarios web, luego en operarios.

    Parametros:
    - req.params.id: ID numerico del usuario.

    Retorna:
    - 200 con los datos del usuario encontrado
    - 404 si no existe en ninguna tabla
    */
    try {
        const usuario = await UsuariosModel.findUsuarioById(req.params.id);

        if (usuario) {
            const rol = await cargarRolConPantallas(usuario.rolId);
            return exito(res, 'Usuario obtenido correctamente.', new LoginAdminDTO(usuario, rol));
        }

        const operario = await UsuariosModel.findColaboradorById(req.params.id);

        if (operario) {
            const rol = await cargarRolConPantallas(operario.rolId);
            return exito(res, 'Usuario obtenido correctamente.', new LoginOperarioDTO(operario, rol));
        }

        return error(res, 'Usuario no encontrado.', null, 404);
    } catch (err) {
        return error(res, 'Error al obtener el usuario.', err);
    }
}

export async function refresh(req, res) {
    /*
    Descripcion:
    Genera un nuevo Access Token usando un Refresh Token
    valido persistido en la DB.

    Parametros:
    - req.body: { refreshToken }

    Retorna:
    - 200 con nuevo accessToken
    - 400 si no se envia refreshToken
    - 403 si el refreshToken no existe, expiro o fue invalidado
    */
    try {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return error(res, 'Refresh token requerido.', null, 400);

        const registro = await RefreshTokensModel.buscar(refreshToken);

        if (!registro)
            return error(res, 'Refresh token invalido o expirado.', null, 403);

        const decoded    = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const payload    = {
            id:           decoded.id,
            grupoDatos:   decoded.grupoDatos,
            rolId:        decoded.rolId,
            nombre:       decoded.nombre,
            accesoGlobal: Boolean(decoded.accesoGlobal),
            esColaborador: Boolean(decoded.esColaborador),
        };
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return exito(res, 'Token renovado correctamente.', { accessToken });
    } catch (err) {
        const { refreshToken } = req.body;
        if (refreshToken) await RefreshTokensModel.eliminar(refreshToken);
        return error(res, 'Refresh token invalido o expirado.', null, 403);
    }
}

export async function logout(req, res) {
    /*
    Descripcion:
    Invalida el Refresh Token mediante borrado logico en DB.

    Parametros:
    - req.body: { refreshToken }

    Retorna:
    - 200 si el logout fue exitoso
    - 400 si no se envia refreshToken
    */
    try {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return error(res, 'Refresh token requerido.', null, 400);

        await RefreshTokensModel.eliminar(refreshToken);
        return exito(res, 'Sesion cerrada correctamente.', null);
    } catch (err) {
        return error(res, 'Error al cerrar sesion.', err);
    }
}