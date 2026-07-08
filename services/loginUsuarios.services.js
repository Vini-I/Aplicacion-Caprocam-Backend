/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.services.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
Define las reglas de negocio y validaciones del modulo
de login. No maneja req/res, modelos ni DTOs.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/
import bcrypt from "bcrypt";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Expresiones regulares para validacion de campos.
*/

const pinRegex = /^\d{4}$/;

const pantallasPorRol = {
    administrador: ["dashboard", "usuarios", "reportes"],
    "operario de alimentacion": ["registro-alimentacion", "historial-estanques"],
    "supervisor de estanques": [
        "registro-alimentacion",
        "historial-estanques",
        "supervision",
        "reportes-campo"
    ],
    "tecnico de calidad": ["muestras", "laboratorio", "reportes-campo"]
};

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el controller para verificar los datos.
*/

export async function isContrasenaValida(contrasena, hash) {
    /*
    Descripcion:
    Compara una contrasena en texto plano con su hash.

    Parametros:
    - contrasena: String en texto plano ingresado por el usuario.
    - hash:       Hash almacenado del usuario.

    Retorna:
    - true si la contrasena coincide, false si no.
    */
    return await bcrypt.compare(contrasena, hash);
}

export async function hashContrasena(contrasena) {
    /*
    Descripcion:
    Genera un hash bcrypt a partir de una contrasena.

    Parametros:
    - contrasena: String en texto plano a hashear.

    Retorna:
    - El hash generado.
    */
    return await bcrypt.hash(contrasena, 10);
}

export async function hashPin(pin) {
    /*
    Descripcion:
    Genera un hash bcrypt a partir de un PIN de 4 digitos.

    Parametros:
    - pin: String o numero de 4 digitos a hashear.

    Retorna:
    - El hash generado.
    */
    return await bcrypt.hash(String(pin), 10);
}

export async function isPinValido(pin, hash) {
    /*
    Descripcion:
    Compara un PIN en texto plano con su hash almacenado.

    Parametros:
    - pin:  String o numero con el PIN ingresado.
    - hash: Hash almacenado del operario.

    Retorna:
    - true si el PIN coincide, false si no.
    */
    return await bcrypt.compare(String(pin), hash);
}

export function isPin(pin) {
    /*
    Descripcion:
    Valida que un valor sea un PIN de exactamente
    4 digitos numericos.

    Parametros:
    - pin: String o numero a validar.

    Retorna:
    - true si es un PIN valido, false si no.
    */
    return pinRegex.test(String(pin));
}

export function isContrasenaSegura(contrasena) {
    /*
    Descripcion:
    Valida que una contrasena tenga al menos 8 caracteres.

    Parametros:
    - contrasena: String a validar.

    Retorna:
    - true si cumple el minimo, false si no.
    */
    return String(contrasena ?? "").length >= 8;
}

export function obtenerPantallasPermitidas(nombreRol) {
    /*
    Descripcion:
    Devuelve la lista de pantallas permitidas segun el
    nombre del rol recibido desde la base de datos.

    Parametros:
    - nombreRol: Nombre del rol en texto plano.

    Retorna:
    - Arreglo con las pantallas permitidas para ese rol.
    */
    const clave = normalizarTexto(nombreRol);

    return pantallasPorRol[clave] ? [...pantallasPorRol[clave]] : [];
}

function normalizarTexto(valor) {
    return String(valor ?? "")
        .trim()
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
