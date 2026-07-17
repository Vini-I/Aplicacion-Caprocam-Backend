/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: jwt.js
Autor: Marco Vásquez
Fecha: 15/07/2026
Modulo: Config
Descripcion:
Constantes de configuracion para JSON Web Tokens.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

export const JWT_SECRET          = process.env.JWT_SECRET          || 'caprocam_secret_dev';
export const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET  || 'caprocam_refresh_secret_dev';
export const JWT_EXPIRES_IN      = process.env.JWT_EXPIRES_IN      || '15m';
export const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';