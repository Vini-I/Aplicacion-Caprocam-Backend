/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.services.js
Autor: Rodolfo Chaves
Fecha: 29/07/2026
Modulo: Login
Descripcion:
Define las reglas de negocio y validaciones del modulo
de login. Maneja regex de contrasenas, bcrypt (costo 12)
y control de 5 intentos maximo de autenticacion.
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

Expresiones regulares para validacion de campos y limites.
*/

const BCRYPT_SALT_ROUNDS = 12;

const pinRegex = /^\d{4}$/;

// Regex: minimo 8 caracteres, 1 mayuscula, 1 minuscula, 1 numero y 1 simbolo
const contrasenaRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

const MAX_INTENTOS_LOGIN = 5;
const TIEMPO_BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos de bloqueo

// Mapa en memoria para seguimiento de intentos de login
const intentosLogin = new Map();

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
    Genera un hash bcrypt con costo 12 a partir de contrasena.

    Parametros:
    - contrasena: String en texto plano a hashear.

    Retorna:
    - El hash generado con costo 12.
    */
    return await bcrypt.hash(contrasena, BCRYPT_SALT_ROUNDS);
}

export async function hashPin(pin) {
    /*
    Descripcion:
    Genera un hash bcrypt con costo 12 a partir de PIN de 4 digitos.

    Parametros:
    - pin: String o numero de 4 digitos a hashear.

    Retorna:
    - El hash generado con costo 12.
    */
    return await bcrypt.hash(String(pin), BCRYPT_SALT_ROUNDS);
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
    return pinRegex.test(String(pin ?? ""));
}

export function isContrasenaSegura(contrasena) {
    /*
    Descripcion:
    Valida que una contrasena cumpla la politica de seguridad:
    minimo 8 caracteres, al menos una mayuscula, una minuscula,
    un numero y un caracter especial (@$!%*?&._-#).

    Parametros:
    - contrasena: String a validar.

    Retorna:
    - true si cumple con la politica de seguridad, false si no.
    */
    return contrasenaRegex.test(String(contrasena ?? ""));
}

export function estaBloqueado(identificador) {
    /*
    Descripcion:
    Verifica si un usuario ha sido bloqueado por superar
    el limite de 5 intentos fallidos de login.

    Parametros:
    - identificador: Nombre de usuario o correo.

    Retorna:
    - Objeto { bloqueado: boolean, tiempoRestanteMinutos: number }
    */
    const clave = String(identificador ?? "").toLowerCase();
    const registro = intentosLogin.get(clave);

    if (!registro) return { bloqueado: false, tiempoRestanteMinutos: 0 };

    const ahora = Date.now();
    if (registro.bloqueadoHasta && ahora < registro.bloqueadoHasta) {
        const tiempoRestante = Math.ceil(
            (registro.bloqueadoHasta - ahora) / (60 * 1000)
        );
        return { bloqueado: true, tiempoRestanteMinutos: tiempoRestante };
    }

    if (registro.bloqueadoHasta && ahora >= registro.bloqueadoHasta) {
        intentosLogin.delete(clave);
        return { bloqueado: false, tiempoRestanteMinutos: 0 };
    }

    return { bloqueado: false, tiempoRestanteMinutos: 0 };
}

export function registrarIntentoFallido(identificador) {
    /*
    Descripcion:
    Registra un intento fallido de login. Bloquea si
    se alcanzan 5 intentos fallidos.

    Parametros:
    - identificador: Nombre de usuario o correo.

    Retorna:
    - Objeto { bloqueado: boolean, intentosRestantes: number }
    */
    const clave = String(identificador ?? "").toLowerCase();
    const ahora = Date.now();
    let registro = intentosLogin.get(clave) || { intentos: 0, bloqueadoHasta: null };

    registro.intentos += 1;

    if (registro.intentos >= MAX_INTENTOS_LOGIN) {
        registro.bloqueadoHasta = ahora + TIEMPO_BLOQUEO_MS;
        intentosLogin.set(clave, registro);
        return { bloqueado: true, intentosRestantes: 0 };
    }

    intentosLogin.set(clave, registro);
    const intentosRestantes = MAX_INTENTOS_LOGIN - registro.intentos;
    return { bloqueado: false, intentosRestantes };
}

export function resetearIntentosLogin(identificador) {
    /*
    Descripcion:
    Limpia los intentos fallidos tras un login exitoso.

    Parametros:
    - identificador: Nombre de usuario o correo.

    Retorna:
    - No retorna valor.
    */
    const clave = String(identificador ?? "").toLowerCase();
    intentosLogin.delete(clave);
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