/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     loginUsuarios.services.js
Autor:       Rodolfo Chaves
Fecha:       28/06/2026
Modulo:      Login
Descripcion:
Capa de servicio del modulo de login. Contiene toda la
logica de negocio y validaciones de reglas. No maneja
req/res ni codigos HTTP, y no aplica DTOs. Devuelve
objetos crudos del model al Controller. Si una regla de
negocio falla, lanza { codigo, mensaje } para que el
Controller lo convierta en respuesta HTTP.
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
IMPORTS
//////////////////////////////////////////////////////////

Modelos / servicios
*/
import * as usuariosModel from '../models/loginUsuarios.model.js';
import * as rolesModel    from '../models/loginRoles.model.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Todas las funciones de este archivo son exportadas y
utilizadas por loginUsuarios.controller.js.
*/

export async function loginAdmin(identificador, contrasena) {
    /*
    Descripcion:
    Valida las credenciales de un administrador web.
    Verifica que el usuario exista, sea de tipo
    administrador y que la contrasena coincida con el hash.

    Parametros:
    - identificador: String con el usuario o correo.
    - contrasena:    String con la contrasena en texto plano.

    Retorna:
    { usuario, rol } - objetos crudos sin mapear por DTO.
    El Controller aplica el DTO antes de responder.
    */
    const usuario = usuariosModel.findByUsuarioOCorreo(identificador);

    if (!usuario || usuario.tipo !== 'administrador')
        throw { codigo: 404, mensaje: 'Usuario no encontrado.' };

    const contrasenaValida = await bcrypt.compare(
        contrasena,
        usuario.contrasenaHash
    );
    if (!contrasenaValida)
        throw { codigo: 401, mensaje: 'Credenciales incorrectas.' };

    const rol = rolesModel.findById(usuario.rolId);
    return { usuario, rol };
}

export async function registrarAdmin(datos) {
    /*
    Descripcion:
    Registra un nuevo administrador web. Valida longitud
    minima de contrasena, unicidad de correo y usuario,
    y existencia del rol indicado. Hashea la contrasena
    antes de guardar.

    Parametros:
    - datos: { nombre, apellidos, correo, usuario,
               contrasena, rolId }

    Retorna:
    { usuario, rol } - objetos crudos sin mapear por DTO.
    */
    const {
        nombre, apellidos, correo,
        usuario, contrasena, rolId
    } = datos;

    if (contrasena.length < 8)
        throw {
            codigo:  422,
            mensaje: 'La contrasena debe tener minimo 8 caracteres.'
        };

    if (usuariosModel.findByCorreo(correo))
        throw { codigo: 409, mensaje: 'El correo ya esta registrado.' };

    if (usuariosModel.findByUsuario(usuario))
        throw { codigo: 409, mensaje: 'El nombre de usuario ya existe.' };

    const rol = rolesModel.findById(rolId);
    if (!rol)
        throw { codigo: 422, mensaje: 'El rol indicado no existe.' };

    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const nuevo = usuariosModel.create({
        nombre, apellidos, correo, usuario,
        contrasenaHash, rolId, tipo: 'administrador'
    });

    return { usuario: nuevo, rol };
}

export async function registrarOperario(datos) {
    /*
    Descripcion:
    Registra un nuevo operario de campo, creado por un
    administrador desde la plataforma web. Valida que el
    PIN tenga exactamente 4 digitos numericos y que el
    rol exista. Hashea el PIN antes de guardar.

    Parametros:
    - datos: { nombre, rolId, pin }

    Retorna:
    { operario, rol } - objetos crudos sin mapear por DTO.
    */
    const { nombre, rolId, pin } = datos;

    if (!/^\d{4}$/.test(String(pin)))
        throw {
            codigo:  422,
            mensaje: 'El PIN debe tener exactamente 4 digitos numericos.'
        };

    const rol = rolesModel.findById(rolId);
    if (!rol)
        throw { codigo: 422, mensaje: 'El rol indicado no existe.' };

    const pinHash  = await bcrypt.hash(String(pin), 10);
    const operario = usuariosModel.create({
        nombre,
        apellidos: '',
        correo:    null,
        usuario:   null,
        pinHash,
        rolId,
        tipo: 'operario'
    });

    return { operario, rol };
}

export async function verificarPin(operarioId, pin) {
    /*
    Descripcion:
    Verifica el PIN de un operario de campo en la app
    movil. Valida formato del PIN, existencia del operario
    y coincidencia del PIN con el hash guardado.

    Parametros:
    - operarioId: Numero con el ID del operario seleccionado.
    - pin:        String o numero con el PIN de 4 digitos.

    Retorna:
    { operario, rol } - objetos crudos sin mapear por DTO.
    */
    const pinStr = String(pin);

    if (!/^\d{4}$/.test(pinStr))
        throw {
            codigo:  422,
            mensaje: 'El PIN debe tener exactamente 4 digitos numericos.'
        };

    const operario = usuariosModel.findById(operarioId);
    if (!operario || operario.tipo !== 'operario')
        throw { codigo: 404, mensaje: 'Operario no encontrado.' };

    const pinValido = await bcrypt.compare(pinStr, operario.pinHash);
    if (!pinValido)
        throw { codigo: 401, mensaje: 'PIN incorrecto.' };

    const rol = rolesModel.findById(operario.rolId);
    return { operario, rol };
}

export function obtenerOperariosParaSincronizar() {
    /*
    Descripcion:
    Devuelve todos los operarios activos junto con su rol
    para que el movil los guarde en su SQLite local y
    pueda autenticar PINs sin conexion a internet.

    Parametros:
    No posee.

    Retorna:
    Arreglo de { operario, rol } - objetos crudos.
    El Controller aplica el DTO a cada elemento.
    */
    const operarios = usuariosModel.findAllOperarios();
    return operarios.map((operario) => {
        const rol = rolesModel.findById(operario.rolId);
        return { operario, rol };
    });
}

export function obtenerPorId(id) {
    /*
    Descripcion:
    Busca un usuario por su ID numerico.

    Parametros:
    - id: Numero o string numerico con el ID del usuario.

    Retorna:
    { usuario, rol } - objetos crudos sin mapear por DTO.
    */
    const usuario = usuariosModel.findById(id);
    if (!usuario)
        throw { codigo: 404, mensaje: 'Usuario no encontrado.' };

    const rol = rolesModel.findById(usuario.rolId);
    return { usuario, rol };
}