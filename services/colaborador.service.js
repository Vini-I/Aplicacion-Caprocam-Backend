/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.service.js
Autor: Marco Vásquez
Fecha: 29/07/2026
Modulo: Colaboradores
Descripcion:
Define las reglas de negocio, validaciones y hasheo
de PINs para el modulo de colaboradores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/
import bcrypt from 'bcrypt';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Expresiones regulares para validacion de campos.
*/

const emailRegex  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const phoneRegex  = /^\d{8}$/;
const cedulaRegex = /^\d{9,12}$/;
const pinRegex    = /^\d{4}$/;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion y cifrado
que utiliza el controller para verificar los datos.
*/

export function isEmail(email) {
    /*
    Descripcion:
    Valida que un string tenga formato de email.

    Parametros:
    - email: String a validar.

    Retorna:
    - true si es un email valido, false si no.
    */
    return emailRegex.test(String(email ?? '').trim());
}

export function isPhone(phone) {
    /*
    Descripcion:
    Valida que un string sea un telefono de 8 digitos.

    Parametros:
    - phone: String a validar.

    Retorna:
    - true si es un telefono valido, false si no.
    */
    return phoneRegex.test(String(phone ?? '').trim());
}

export function isCedula(cedula) {
    /*
    Descripcion:
    Valida que un string sea una cedula valida (9 a 12 digitos).

    Parametros:
    - cedula: String a validar.

    Retorna:
    - true si es una cedula valida, false si no.
    */
    return cedulaRegex.test(String(cedula ?? '').trim());
}

export function isPin(pin) {
    /*
    Descripcion:
    Valida que un valor sea un PIN de exactamente 4 digitos.

    Parametros:
    - pin: String o numero a validar.

    Retorna:
    - true si es un PIN valido, false si no.
    */
    return pinRegex.test(String(pin ?? '').trim());
}

export async function hashPin(pin) {
    /*
    Descripcion:
    Genera un hash bcrypt a partir de un PIN de 4 digitos.

    Parametros:
    - pin: String o numero con el PIN a cifrar.

    Retorna:
    - El hash bcrypt generado.
    */
    return await bcrypt.hash(String(pin), 10);
}

export async function isPinValido(pin, hash) {
    /*
    Descripcion:
    Compara un PIN en texto plano con su hash bcrypt.

    Parametros:
    - pin:  String con el PIN en texto plano.
    - hash: Hash almacenado del colaborador.

    Retorna:
    - true si el PIN es correcto, false si no.
    */
    return await bcrypt.compare(String(pin), hash);
}

export function isEmpty(string) {
    /*
    Descripcion:
    Verifica si un string esta vacio o solo tiene espacios.

    Parametros:
    - string: String a verificar.

    Retorna:
    - true si esta vacio, false si tiene contenido.
    */
    return String(string ?? '').trim().length === 0;
}