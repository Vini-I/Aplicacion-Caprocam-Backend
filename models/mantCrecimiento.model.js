/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.model.js
Autor: Greivin Arguedas
Fecha: 28/06/2026
Modulo: Crecimiento
Descripcion:
Capa de datos del modulo de crecimiento.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
//////////////////////////////////////////////////////////
*/


/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
import pool from "../config/database.js";
*/


/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let fincas = [
    {
        id: 1,
        codigo: "FIN001",
        nombre: "Finca Central"
    },
    {
        id: 2,
        codigo: "FIN002",
        nombre: "Finca Norte"
    }
];

let estanques = [
    {
        id: 1,
        fincaId: 1,
        codigo: "EST001",
        nombre: "Estanque A",
        diasCultivo: 45,
        pesoActual: 180,
        estado: "ACTIVO"
    },
    {
        id: 2,
        fincaId: 1,
        codigo: "EST002",
        nombre: "Estanque B",
        diasCultivo: 60,
        pesoActual: 250,
        estado: "ACTIVO"
    },
    {
        id: 3,
        fincaId: 2,
        codigo: "EST003",
        nombre: "Estanque C",
        diasCultivo: 30,
        pesoActual: 120,
        estado: "ACTIVO"
    }
];

let crecimientos = [];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de crecimiento.
*/
export function obtenerFincas() {
    /*
    Descripcion:
    Obtiene todas los fincas.

    Parametros:
    No posee.

    Retorna:
    - fincas: Lista con todas las fincas.
    */

    return fincas;
}

export function obtenerEstanquesPorFinca(fincaId) {
    /*
    Descripcion:
    Obtiene todos los estanques para una finca específica.

    Parametros:
    - fincaId: ID de la finca.

    Retorna:
    - estanques: Lista con todos los estanques para la finca específica.
    */

    return estanques.filter(e => e.fincaId === Number(fincaId));
}

export function obtenerEstanquePorId(id) {
    /*
    Descripcion:
    Obtiene un estanque por su ID.

    Parametros:
    - id: ID del estanque.

    Retorna:
    - estanque: El estanque encontrado o null.
    */

    return estanques.find(e => e.id === Number(id)) || null;
}

export function guardarCrecimiento(datos){
    /*
    Descripcion:
    Guarda un nuevo registro de crecimiento.

    Parametros:
    - datos: Objeto con los datos del crecimiento.

    Retorna:
    - crecimientos: Lista con todos los registros de crecimiento.
    */

    const nuevo = {
        id: crecimientos.length + 1,
        ...datos
    };
    crecimientos.push(nuevo);
    return nuevo.id;
}

export function actualizarPesoEstanque(estanqueId,pesoActual){
    /*
    Descripcion:
    Actualiza el peso actual de un estanque específico.

    Parametros:
    - estanqueId: ID del estanque.
    - pesoActual: Nuevo peso actual del estanque.

    Retorna:
    - estanque: El estanque encontrado o null.
    */

    const estanque = obtenerEstanquePorId(estanqueId);
    if(estanque){
        estanque.pesoActual = pesoActual;
    }
}



/*
    export async function  obtenerFincas() {
        const [rows] = await pool.query(`
            SELECT id, codigo, nombre FROM finca WHERE estado = 'ACTIVA' ORDER BY nombre`);
        return rows;
    }

    export async function obtenerEstanquesPorFinca(fincaId) {
        const [rows] = await pool.query(`
            SELECT id, codigo, nombre, diasCultivo, pesoActual, estado FROM estanque
            WHERE fincaId = ? ORDER BY codigo`, [fincaId]);
        return rows;
    }

    export async function obtenerEstanquePorId(id) {
        const [rows] = await pool.query(`SELECT * FROM estanque WHERE id = ?`, [id]);
        return rows[0];
    }

    export async function guardarCrecimiento(datos) {
        const [result] = await pool.query(`
            INSERT INTO mantCrecimiento (estanqueId,pesoAnterior,pesoActual,incremento,
                fechaRegistro,observacion) VALUES (?, ?, ?, ?, ?, ?)`, 
        [
            datos.estanqueId,
            datos.pesoAnterior,
            datos.pesoActual,
            datos.incremento,
            datos.fechaRegistro,
            datos.observacion
        ]);
        return result.insertId;
    }

    export async function actualizarPesoEstanque(estanqueId, pesoActual) {
        await pool.query(`UPDATE estanque SET pesoActual = ? WHERE id = ?`, 
            [pesoActual, estanqueId]);
    }
*/