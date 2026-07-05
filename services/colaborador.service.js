/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.service.js
Autor: Marco Vásquez
Fecha: 28/06/2026
Modulo: Colaboradores
Descripcion:
Define las reglas de negocio de colaboradores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Expresiones regulares para validacion de campos.
*/

const emailRegex  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const phoneRegex  = /^\d{8}$/;
const cedulaRegex = /^\d{9}$/;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
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
    return emailRegex.test(email.trim());
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
    return phoneRegex.test(phone.trim());
}

export function isCedula(cedula) {
    /*
    Descripcion:
    Valida que un string sea una cedula de 9 digitos.

    Parametros:
    - cedula: String a validar.

    Retorna:
    - true si es una cedula valida, false si no.
    */
    return cedulaRegex.test(cedula.trim());
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
    return string.trim().length === 0;
}