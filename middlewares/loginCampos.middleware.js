/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.middleware.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
Middlewares de validacion de body para el modulo de
login.
//////////////////////////////////////////////////////////
*/
/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos minimos requeridos por endpoint del modulo login.
El body acepta "usuario" O "correo" en el login web;
solo se exige "contrasena" porque el Service decide
cual identificador usar.
*/
const camposLogin = [
    ["usuario", "correo", "email", "nombreUsuario"],
    ["contrasena"]
];

const camposRegistro = [
    ["nombre"],
    ["apellidos"],
    ["correo", "email"],
    ["usuario", "nombreUsuario"],
    ["contrasena"],
    ["rolId"],
];

const camposRegistroOperario = [
    ["nombre"],
    ["apellidos"],
    ["usuario", "nombreUsuario"],
    ["rolId"],
    ["pin"],
];

const camposVerificarPin = [["operarioId"], ["pin"]];

/*
Mensajes personalizados por campo. La clave es el nombre
principal del grupo (primer elemento del array de aliases).
*/
const mensajesCampoFaltante = {
    // Login
    usuario: "Debe ingresar su usuario o correo electronico.",
    contrasena: "La contrasena es obligatoria.",

    // Registro administrador
    nombre: "El nombre es obligatorio.",
    apellidos: "Los apellidos son obligatorios.",
    correo: "El correo electronico es obligatorio.",
    nombreUsuario: "El nombre de usuario es obligatorio.",
    rolId: "Debe seleccionar un rol para el usuario.",

    // Registro operario
    pin: "El PIN de 4 digitos es obligatorio.",

    // Verificar PIN
    operarioId: "El identificador del operario es obligatorio.",
};

function errorLogin(res, mensaje, codigo, code, details = null, err = null) {
    return res.status(codigo).json({
        success: false,
        message: mensaje,
        code,
        details,
        error: err?.message ?? err
    });
}
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de login.
*/
export function validarBodyLogin(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para el login web.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return errorLogin(
            res,
            "Debe ingresar su usuario o correo y contrasena para iniciar sesion.",
            400,
            "LOGIN_FIELDS_REQUIRED",
            {
                fields: ["usuario|correo", "contrasena"],
            }
        );
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposLogin);

    if (faltantes.length > 0) {
        const mensajes = faltantes.map((campo) => mensajesCampoFaltante[campo] ?? `El campo '${campo}' es obligatorio.`);
        return errorLogin(
            res,
            mensajes.length === 1 ? mensajes[0] : mensajes.join(" "),
            400,
            "LOGIN_FIELDS_REQUIRED",
            {
                fields: faltantes,
            }
        );
    }

    next();
}

export function validarBodyRegistro(req, res, next) {
    /*
  Descripcion:
  Verifica que el body no este vacio y contenga
  los campos minimos requeridos para registrar un
  administrador web.

  Parametros:
  - req:  Objeto request de Express
  - res:  Objeto response de Express
  - next: Funcion para pasar al siguiente middleware

  Retorna:
  - next() si el body es valido
  - 400 si el body esta vacio o faltan campos
  */
    if (!req.body || Object.keys(req.body).length === 0) {
        return errorLogin(res, "Complete todos los campos requeridos.", 400, "REGISTER_FIELDS_REQUIRED", {
            fields: ["nombre", "apellidos", "correo", "usuario", "contrasena", "rolId"],
        });
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposRegistro);

    if (faltantes.length > 0) {
        const mensajes = faltantes.map((campo) => mensajesCampoFaltante[campo] ?? `El campo '${campo}' es obligatorio.`);
        return errorLogin(
            res,
            mensajes.length === 1 ? mensajes[0] : `Faltan campos obligatorios: ${mensajes.join(" ")}`,
            400,
            "REGISTER_FIELDS_REQUIRED",
            {
                fields: faltantes,
            }
        );
    }

    next();
}

export function validarBodyRegistroOperario(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para registrar un
    operario de campo.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return errorLogin(res, "Complete todos los campos requeridos.", 400, "OPERARIO_REGISTER_FIELDS_REQUIRED", {
            fields: ["nombre", "apellidos", "usuario", "rolId", "pin"],
        });
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposRegistroOperario);

    if (faltantes.length > 0) {
        const mensajes = faltantes.map((campo) => mensajesCampoFaltante[campo] ?? `El campo '${campo}' es obligatorio.`);
        return errorLogin(
            res,
            mensajes.length === 1 ? mensajes[0] : `Faltan campos obligatorios: ${mensajes.join(" ")}`,
            400,
            "OPERARIO_REGISTER_FIELDS_REQUIRED",
            {
                fields: faltantes,
            }
        );
    }

    next();
}

export function validarBodyVerificarPin(req, res, next) {
    /*
   Descripcion:
   Verifica que el body no este vacio y contenga
   los campos minimos requeridos para verificar el
   PIN de un operario de campo en la app movil.

   Parametros:
   - req:  Objeto request de Express
   - res:  Objeto response de Express
   - next: Funcion para pasar al siguiente middleware

   Retorna:
   - next() si el body es valido
   - 400 si el body esta vacio o faltan campos
   */
    if (!req.body || Object.keys(req.body).length === 0) {
        return errorLogin(res, "Debe proporcionar el identificador del operario y su PIN.", 400, "VERIFY_PIN_FIELDS_REQUIRED", {
            fields: ["operarioId", "pin"],
        });
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposVerificarPin);

    if (faltantes.length > 0) {
        const mensajes = faltantes.map((campo) => mensajesCampoFaltante[campo] ?? `El campo '${campo}' es obligatorio.`);
        return errorLogin(
            res,
            mensajes.length === 1 ? mensajes[0] : mensajes.join(" "),
            400,
            "VERIFY_PIN_FIELDS_REQUIRED",
            {
                fields: faltantes,
            }
        );
    }

    next();
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function obtenerCamposFaltantes(body, grupos) {
    const faltantes = [];

    for (let i = 0; i < grupos.length; i++) {
        const grupo = grupos[i];
        const tieneCampo = grupo.some((campo) => valorPresente(body[campo]));

        if (!tieneCampo) {
            faltantes.push(grupo[0]);
        }
    }

    return faltantes;
}

function valorPresente(valor) {
    if (valor === undefined || valor === null) {
        return false;
    }

    if (typeof valor === "string" && valor.trim().length === 0) {
        return false;
    }

    return true;
}
