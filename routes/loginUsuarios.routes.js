/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.routes.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 28/06/2026
Modulo: Login
Descripcion:
Define las rutas HTTP del modulo de login de usuarios.
Incluye rutas de JWT (refresh y logout).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import { Router } from 'express';

// Middlewares
import { verificarAuth } from '../middlewares/auth.middleware.js';
import {
    validarBodyLogin,
    validarBodyRegistro,
    validarBodyRegistroOperario,
    validarBodyVerificarPin,
} from '../middlewares/loginCampos.middleware.js';

// Controladores
import {
    login,
    registrar,
    registrarOperario,
    verificarPin,
    sincronizar,
    obtenerPorId,
    refresh,
    logout,
} from '../controllers/loginUsuarios.controller.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const router = Router();

/*
//////////////////////////////////////////////////////////
RUTAS
//////////////////////////////////////////////////////////
*/

// --- JWT ---
router.post('/refresh', refresh);
router.post('/logout',  logout);

// --- Web (administradores) ---
router.post('/',         validarBodyLogin,                             login);
router.post('/registro', verificarAuth, validarBodyRegistro,           registrar);

// --- Movil (operarios de campo) ---
router.post('/registro-operario', verificarAuth, validarBodyRegistroOperario, registrarOperario);
router.post('/verificar-pin',     validarBodyVerificarPin,             verificarPin);
router.get('/sincronizar',        verificarAuth,                       sincronizar);

// --- Genericas ---
router.get('/:id', verificarAuth, obtenerPorId);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;