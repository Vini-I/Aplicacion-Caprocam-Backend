/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.controller.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 08/08/2026
Modulo: Login / Usuarios
Descripcion:
Recibe las peticiones HTTP, consulta los modelos,
delega validaciones al servicio, aplica DTOs y gestiona
usuarios con control jerarquico de grupo_datos (sin roles).
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
} from '../services/loginUsuarios.services.js';

// Modelos
import * as UsuariosModel      from '../models/loginUsuarios.model.js';
import * as RefreshTokensModel from '../models/refreshTokens.model.js';

// Config
import {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES,
} from '../config/jwt.js';

// Common
import { exito } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function generarTokens(payload) {
    /*
    Descripcion:
    Genera un Access Token y un Refresh Token firmados.

    Parametros:
    - payload: Objeto con id, grupoDatos, nombre y accesoGlobal.

    Retorna:
    - Objeto con accessToken, refreshToken y expiraEn.
    */
    const accessToken  = jwt.sign(payload, JWT_SECRET,         { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });

    const decoded  = jwt.decode(refreshToken);
    const expiraEn = new Date(decoded.exp * 1000);

    return { accessToken, refreshToken, expiraEn };
}

function normalizarEmail(valor) {
    return String(valor ?? '').trim();
}

function normalizarNombreUsuario(valor) {
    return String(valor ?? '').trim();
}

function errorLogin(res, mensaje, err, codigo = 500, opciones = {}) {
    const status = Number.isInteger(codigo) ? codigo : 500;
    const code = opciones.code ?? 'ERROR';
    const details = opciones.details ?? null;

    return res.status(status).json({
        success: false,
        message: mensaje,
        code,
        details,
        error: err?.message ?? err ?? null,
    });
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function login(req, res) {
    try {
        const identificador = req.body.usuario    ??
                              req.body.correo      ??
                              req.body.email       ??
                              req.body.nombreUsuario;
        const contrasena    = req.body.contrasena;

        if (!identificador || !contrasena)
            return errorLogin(res, 'Debe ingresar su usuario o correo y su contrasena.', null, 400, {
                code: 'LOGIN_FIELDS_REQUIRED',
                details: {
                    fields: ['usuario|correo', 'contrasena'],
                },
            });

        const estadoBloqueo = estaBloqueado(identificador);
        if (estadoBloqueo.bloqueado) {
            const msg = `Tu cuenta ha sido bloqueada temporalmente por multiples intentos fallidos. ` +
                        `Intenta de nuevo en ${estadoBloqueo.tiempoRestanteMinutos} minuto(s).`;
            return errorLogin(res, msg, null, 429, {
                code: 'ACCOUNT_TEMPORARILY_LOCKED',
                details: {
                    tiempoRestanteMinutos: estadoBloqueo.tiempoRestanteMinutos,
                },
            });
        }

        const usuarioEncontrado = await UsuariosModel.findUsuarioByIdentificador(identificador);

        if (!usuarioEncontrado)
            return errorLogin(res, 'No existe una cuenta con ese usuario o correo electronico.', null, 404, {
                code: 'LOGIN_USER_NOT_FOUND',
            });

        const contrasenaOk = await isContrasenaValida(contrasena, usuarioEncontrado.passwordHash);

        if (!contrasenaOk) {
            const resultadoIntento = registrarIntentoFallido(identificador);
            if (resultadoIntento.bloqueado) {
                return errorLogin(res, 'Has superado el limite de 5 intentos fallidos. Tu cuenta estara bloqueada por 15 minutos.', null, 429, {
                    code: 'ACCOUNT_TEMPORARILY_LOCKED',
                    details: {
                        tiempoRestanteMinutos: 15,
                    },
                });
            }
            const msg = `Contrasena incorrecta. Te quedan ${resultadoIntento.intentosRestantes} intento(s) antes de bloquear la cuenta.`;
            return errorLogin(res, msg, null, 401, {
                code: 'LOGIN_PASSWORD_INVALID',
                details: {
                    intentosRestantes: resultadoIntento.intentosRestantes,
                },
            });
        }

        resetearIntentosLogin(identificador);

        const esCaprocam = Number(usuarioEncontrado.grupoDatos) === 22776226;
        
        const payload = {
            id:           usuarioEncontrado.id,
            grupoDatos:   usuarioEncontrado.grupoDatos,
            nombre:       usuarioEncontrado.nombre,
            accesoGlobal: esCaprocam, // true si es 22776226, false para fincas normales
            esColaborador: false,
        };

        const { accessToken, refreshToken, expiraEn } = generarTokens(payload);
        await RefreshTokensModel.guardar(refreshToken, expiraEn, usuarioEncontrado.id, null);

        return exito(res, 'Inicio de sesion exitoso.', {
            accessToken,
            refreshToken,
            usuario: new LoginAdminDTO(usuarioEncontrado),
        });
    } catch (err) {
        return errorLogin(res, 'Ocurrio un error al iniciar sesion. Intentalo de nuevo mas tarde.', err, 500, {
            code: 'LOGIN_UNEXPECTED_ERROR',
        });
    }
}

export async function registrar(req, res) {
    try {
        const nombre        = req.body.nombre;
        const apellidos     = req.body.apellidos;
        const email         = normalizarEmail(req.body.email ?? req.body.correo);
        const nombreUsuario = normalizarNombreUsuario(req.body.nombreUsuario ?? req.body.usuario);
        const contrasena    = req.body.contrasena;
        const telefono      = req.body.telefono;

        const { grupoDatos } = obtenerContextoPeticion(req);

        if (!isContrasenaSegura(contrasena)) {
            const msgErr = 'La contrasena no es segura. Debe contener al menos 8 caracteres, ' +
                           'una letra mayuscula, una letra minuscula, un numero y un simbolo especial (ej. !, @, #).';
            return errorLogin(res, msgErr, null, 422, {
                code: 'REGISTER_PASSWORD_WEAK',
                details: {
                    field: 'contrasena',
                },
            });
        }

        const correoExistente = await UsuariosModel.findUsuarioByCorreo(email);
        if (correoExistente)
            return errorLogin(res, 'Este correo electronico ya esta registrado. Usa otro correo o inicia sesion.', null, 409, {
                code: 'REGISTER_EMAIL_CONFLICT',
                details: {
                    field: 'correo',
                },
            });

        const usuarioExistente = await UsuariosModel.findUsuarioByNombreUsuario(nombreUsuario);
        if (usuarioExistente)
            return errorLogin(res, 'Este nombre de usuario ya esta en uso. Por favor elige uno diferente.', null, 409, {
                code: 'REGISTER_USERNAME_CONFLICT',
                details: {
                    field: 'usuario',
                },
            });

        const passwordHash = await hashContrasena(contrasena);

        const nuevo = await UsuariosModel.createUsuario({
            grupoDatos,
            nombre,
            apellidos,
            email,
            nombreUsuario,
            passwordHash,
            telefono,
        });

        return exito(res, 'Administrador registrado correctamente.', new LoginAdminDTO(nuevo), 201);
    } catch (err) {
        return errorLogin(res, 'Ocurrio un error al registrar el administrador. Intentalo de nuevo.', err, 500, {
            code: 'REGISTER_UNEXPECTED_ERROR',
        });
    }
}

export async function registrarOperario(req, res) {
    try {
        const nombre          = req.body.nombre;
        const apellidos       = req.body.apellidos;
        const nombreUsuario   = normalizarNombreUsuario(req.body.nombreUsuario ?? req.body.usuario);
        const email           = req.body.email ?? req.body.correo ?? null;
        const telefono        = req.body.telefono ?? null;
        const fincaId         = req.body.fincaId ?? null;
        const pin             = req.body.pin;
        const tipoColaborador = req.body.tipoColaborador ?? 'external_collab';

        const { grupoDatos }  = obtenerContextoPeticion(req);

        if (!isPin(pin))
            return errorLogin(res, 'El PIN debe ser un numero de exactamente 4 digitos (ej. 1234).', null, 422, {
                code: 'OPERARIO_PIN_INVALID_FORMAT',
                details: {
                    field: 'pin',
                },
            });

        const pinHash = await hashPin(pin);

        const operario = await UsuariosModel.createColaborador({
            grupoDatos,
            fincaId,
            nombre,
            apellidos,
            telefono,
            email,
            nombreUsuario,
            pinHash,
            tipoColaborador,
        });

        return exito(res, 'Operario registrado correctamente.', new LoginOperarioDTO(operario), 201);
    } catch (err) {
        return errorLogin(res, 'Ocurrio un error al registrar el operario. Intentalo de nuevo.', err, 500, {
            code: 'OPERARIO_REGISTER_UNEXPECTED_ERROR',
        });
    }
}

export async function verificarPin(req, res) {
    try {
        const { operarioId, pin } = req.body;

        if (!isPin(pin))
            return errorLogin(res, 'El PIN debe ser un numero de exactamente 4 digitos.', null, 422, {
                code: 'VERIFY_PIN_INVALID_FORMAT',
                details: {
                    field: 'pin',
                },
            });

        const operario = await UsuariosModel.findColaboradorById(operarioId);

        if (!operario)
            return errorLogin(res, 'No se encontro ningun operario con ese identificador.', null, 404, {
                code: 'VERIFY_PIN_OPERARIO_NOT_FOUND',
            });

        const pinOk = await isPinValido(pin, operario.pinHash);

        if (!pinOk)
            return errorLogin(res, 'PIN incorrecto. Verifica tu PIN e intentalo de nuevo.', null, 401, {
                code: 'VERIFY_PIN_INVALID',
                details: {
                    field: 'pin',
                },
            });

        const payload = {
            id:           operario.id,
            grupoDatos:   operario.grupoDatos,
            nombre:       operario.nombre,
            accesoGlobal: false,
            esColaborador: true,
        };

        const { accessToken, refreshToken, expiraEn } = generarTokens(payload);
        await RefreshTokensModel.guardar(refreshToken, expiraEn, null, operario.id);

        return exito(res, 'PIN verificado correctamente.', {
            accessToken,
            refreshToken,
            colaborador: new LoginOperarioDTO(operario),
        });
    } catch (err) {
        return errorLogin(res, 'Ocurrio un error al verificar el PIN. Intentalo de nuevo.', err, 500, {
            code: 'VERIFY_PIN_UNEXPECTED_ERROR',
        });
    }
}

export async function sincronizar(req, res) {
    try {
        const operarios = await UsuariosModel.findAllColaboradores();

        const data = operarios.map(operario => new LoginSincronizacionDTO(operario));

        return exito(res, 'Lista de operarios obtenida correctamente.', data);
    } catch (err) {
        return errorLogin(res, 'Error al sincronizar los operarios.', err, 500, {
            code: 'SYNC_OPERARIOS_ERROR',
        });
    }
}

export async function obtenerPorId(req, res) {
    try {
        const usuario = await UsuariosModel.findUsuarioById(req.params.id);

        if (usuario) {
            return exito(res, 'Usuario obtenido correctamente.', new LoginAdminDTO(usuario));
        }

        const operario = await UsuariosModel.findColaboradorById(req.params.id);

        if (operario) {
            return exito(res, 'Usuario obtenido correctamente.', new LoginOperarioDTO(operario));
        }

        return errorLogin(res, 'Usuario no encontrado.', null, 404, {
            code: 'USER_NOT_FOUND',
        });
    } catch (err) {
        return errorLogin(res, 'Error al obtener el usuario.', err, 500, {
            code: 'GET_USER_ERROR',
        });
    }
}

export async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return errorLogin(res, 'Refresh token requerido.', null, 400, {
                code: 'REFRESH_TOKEN_REQUIRED',
                details: {
                    field: 'refreshToken',
                },
            });

        const registro = await RefreshTokensModel.buscar(refreshToken);

        if (!registro)
            return errorLogin(res, 'Refresh token invalido o expirado.', null, 403, {
                code: 'REFRESH_TOKEN_INVALID',
            });

        const decoded    = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const payload    = {
            id:           decoded.id,
            grupoDatos:   decoded.grupoDatos,
            nombre:       decoded.nombre,
            accesoGlobal: Boolean(decoded.accesoGlobal),
            esColaborador: Boolean(decoded.esColaborador),
        };
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return exito(res, 'Token renovado correctamente.', { accessToken });
    } catch (err) {
        const { refreshToken } = req.body;
        if (refreshToken) await RefreshTokensModel.eliminar(refreshToken);
        return errorLogin(res, 'Refresh token invalido o expirado.', null, 403, {
            code: 'REFRESH_TOKEN_INVALID',
        });
    }
}

export async function logout(req, res) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return errorLogin(res, 'Refresh token requerido.', null, 400, {
                code: 'LOGOUT_REFRESH_TOKEN_REQUIRED',
                details: {
                    field: 'refreshToken',
                },
            });

        await RefreshTokensModel.eliminar(refreshToken);
        return exito(res, 'Sesion cerrada correctamente.', null);
    } catch (err) {
        return errorLogin(res, 'Error al cerrar sesion.', err, 500, {
            code: 'LOGOUT_ERROR',
        });
    }
}
