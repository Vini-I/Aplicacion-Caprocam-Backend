/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     loginRoles.model.js
Autor:       Rodolfo Chaves
Fecha:       28/06/2026
Modulo:      Login
Descripcion:
Capa de datos del modulo de login para roles.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la tabla roles.
Cuando se conecte una DB real, esta seccion desaparece.
pantallasPermitidas controla que vistas muestra la app
movil segun el rol del operario que valido su PIN.
*/

const roles = [
    {
        id: 1,
        nombre: 'Administrador',
        pantallasPermitidas: ['dashboard', 'usuarios', 'reportes']
    },
    {
        id: 2,
        nombre: 'Operario de alimentacion',
        pantallasPermitidas: [
            'registro-alimentacion',
            'historial-estanques'
        ]
    },
    {
        id: 3,
        nombre: 'Supervisor de estanques',
        pantallasPermitidas: [
            'registro-alimentacion',
            'historial-estanques',
            'supervision',
            'reportes-campo'
        ]
    },
    {
        id: 4,
        nombre: 'Tecnico de calidad',
        pantallasPermitidas: ['muestras', 'laboratorio', 'reportes-campo']
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de login para roles.
*/

export function findById(id) {
    /*
    Descripcion:
    Busca un rol por su ID numerico.

    Parametros:
    - id: ID del rol (numero o string numerico).

    Retorna:
    - El objeto rol si existe, o null si no se encuentra.
    */
    return roles.find((r) => r.id === Number(id)) ?? null;
}

export function findAll() {
    /*
    Descripcion:
    Devuelve todos los roles disponibles en el sistema.

    Parametros:
    No posee.

    Retorna:
    - Copia del arreglo completo de roles.
    */
    return [...roles];
}