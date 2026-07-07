/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     loginUsuarios.model.js
Autor:       Rodolfo Chaves
Fecha:       28/06/2026
Modulo:      Login
Descripcion:
Capa de datos del modulo de login para usuarios.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
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
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la tabla usuarios.
Las contrasenas/PINs en texto plano se indican en cada
comentario unicamente para facilitar las pruebas en
Postman. No usar estos valores en produccion.
*/

const usuarios = [
    {
        id:             1,
        nombre:         'Marco',
        apellidos:      'Vasquez',
        correo:         'marco@caprocam.com',
        usuario:        'admin01',
        contrasenaHash: bcrypt.hashSync('Admin1234', 10), // texto: Admin1234
        rolId:          1,
        tipo:           'administrador'
    },
    {
        id:        2,
        nombre:    'Carlos Mendoza',
        apellidos: '',
        correo:    null,
        usuario:   null,
        pinHash:   bcrypt.hashSync('1984', 10), // PIN: 1984
        rolId:     2,
        tipo:      'operario'
    },
    {
        id:        3,
        nombre:    'Ana Solis',
        apellidos: '',
        correo:    null,
        usuario:   null,
        pinHash:   bcrypt.hashSync('4521', 10), // PIN: 4521
        rolId:     3,
        tipo:      'operario'
    }
];

let siguienteId = 4;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de login para usuarios.
*/

export function findByUsuarioOCorreo(identificador) {
    /*
    Descripcion:
    Busca un usuario por su campo usuario o correo.
    Usado en el login web donde el admin puede ingresar
    cualquiera de los dos como identificador.

    Parametros:
    - identificador: String con el usuario o correo.

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    return usuarios.find(
        (u) => u.usuario === identificador
            || u.correo  === identificador
    ) ?? null;
}

export function findById(id) {
    /*
    Descripcion:
    Busca un usuario por su ID numerico.

    Parametros:
    - id: ID del usuario (numero o string numerico).

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    return usuarios.find((u) => u.id === Number(id)) ?? null;
}

export function findByCorreo(correo) {
    /*
    Descripcion:
    Busca un usuario por su correo electronico.
    Usada para validar unicidad al registrar un admin.

    Parametros:
    - correo: String con el correo a buscar.

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    return usuarios.find((u) => u.correo === correo) ?? null;
}

export function findByUsuario(usuario) {
    /*
    Descripcion:
    Busca un usuario por su nombre de usuario.
    Usada para validar unicidad al registrar un admin.

    Parametros:
    - usuario: String con el nombre de usuario a buscar.

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    return usuarios.find((u) => u.usuario === usuario) ?? null;
}

export function findAllOperarios() {
    /*
    Descripcion:
    Devuelve todos los usuarios de tipo operario.
    Usada por el endpoint de sincronizacion movil.

    Parametros:
    No posee.

    Retorna:
    - Arreglo con todos los objetos de tipo operario.
    */
    return usuarios.filter((u) => u.tipo === 'operario');
}

export function create(nuevoUsuario) {
    /*
    Descripcion:
    Agrega un nuevo usuario al arreglo en memoria y le
    asigna un ID autoincremental.

    Parametros:
    - nuevoUsuario: Objeto con los campos del usuario
                    a crear (sin el campo id).

    Retorna:
    - El objeto usuario recien creado, incluyendo su id.
    */
    const registro = { ...nuevoUsuario, id: siguienteId++ };
    usuarios.push(registro);
    return registro;
}