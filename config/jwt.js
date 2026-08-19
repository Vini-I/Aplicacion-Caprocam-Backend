/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: jwt.js
Autor: Marco Vásquez
Fecha: 29/07/2026
Modulo: Config
Descripcion:
Constantes de configuracion para JSON Web Tokens.
Incluye umbral de renovacion continua de sesion.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

export const JWT_SECRET =
    process.env.JWT_SECRET

export const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET

export const JWT_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN || '15m';

export const JWT_REFRESH_EXPIRES =
    process.env.JWT_REFRESH_EXPIRES || '7d';

// Umbral en segundos (5 min) para auto-renovar el token si hay actividad continua
export const JWT_RENEW_THRESHOLD = 300;