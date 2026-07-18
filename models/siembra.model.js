/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.model.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Capa de datos para lotes de larva y pre-crias.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import * as proveedorModel from "./proveedor.model.js";

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
*/

let lotes = [
    {
        id: 1,
        codigo_lote: "LOT-2026-01",
        proveedor: "Alimentos del Pacífico",
        laboratorio: "LabMar",
        procedencia: "Nacional",
        certificado_larva: "CERT-092",
        pl_inicial: 10,
        cantidad_inicial: 100000,
        fecha_ingreso: "2026-06-25",
        activo: true
    }
];

let precrias = [
    {
        id: 1,
        id_lote_larva: 1,
        id_finca: 1,
        unidad_precria: "Precria A",
        fecha_inicio: "2026-06-26",
        cantidad_inicial: 100000,
        pl_inicial: 10,
        estado: "ACTIVA",
        fecha_fin: null,
        cantidad_final: null,
        pl_final: null,
        activo: true
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES - LOTES DE LARVA
//////////////////////////////////////////////////////////
*/

export function findLotesAll() {
    /*
    Descripcion:
    Obtiene todos los lotes de larva activos.
    */
    return lotes.filter(l => l.activo === true);
}

export function findLoteById(id) {
    /*
    Descripcion:
    Busca un lote de larva activo por su ID.
    */
    const lote = lotes.find(l => l.id === Number(id));
    if (!lote || lote.activo === false) return null;
    return lote;
}

export function findLoteByCodigo(codigo) {
    /*
    Descripcion:
    Busca un lote activo por su codigo (case-insensitive).
    */
    const cod = String(codigo).trim().toLowerCase();
    return lotes.find(l => 
        l.codigo_lote.trim().toLowerCase() === cod && l.activo === true
    ) || null;
}

export function findLoteByCodigoIgnorandoId(codigo, id) {
    /*
    Descripcion:
    Busca un lote por codigo ignorando un ID especifico.
    */
    const cod = String(codigo).trim().toLowerCase();
    const numeroId = Number(id);
    return lotes.find(l => 
        l.codigo_lote.trim().toLowerCase() === cod && 
        l.activo === true && 
        l.id !== numeroId
    ) || null;
}

export function createLote(dto) {
    /*
    Descripcion:
    Crea un nuevo lote de larva.
    */
    const nuevo = {
        ...dto,
        id: lotes.length + 1,
        activo: true
    };
    lotes.push(nuevo);
    return nuevo;
}

export function updateLote(id, dto) {
    /*
    Descripcion:
    Actualiza un lote de larva activo.
    */
    const index = lotes.findIndex(l => l.id === Number(id));
    if (index === -1 || lotes[index].activo === false) return null;
    lotes[index] = {
        ...lotes[index],
        ...dto
    };
    return lotes[index];
}

export function removeLote(id) {
    /*
    Descripcion:
    Borrado logico de un lote de larva.
    */
    const index = lotes.findIndex(l => l.id === Number(id));
    if (index === -1 || lotes[index].activo === false) return null;
    lotes[index].activo = false;
    return lotes[index];
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES - PRE-CRIAS
//////////////////////////////////////////////////////////
*/

export function findPrecriasAll() {
    /*
    Descripcion:
    Obtiene todas las pre-crias activas.
    */
    return precrias.filter(p => p.activo === true);
}

export function findPrecriaById(id) {
    /*
    Descripcion:
    Busca una pre-cria activa por su ID.
    */
    const pc = precrias.find(p => p.id === Number(id));
    if (!pc || pc.activo === false) return null;
    return pc;
}

export function createPrecria(dto) {
    /*
    Descripcion:
    Crea una nueva pre-cria.
    */
    const nuevo = {
        ...dto,
        id: precrias.length + 1,
        activo: true
    };
    precrias.push(nuevo);
    return nuevo;
}

export function updatePrecria(id, dto) {
    /*
    Descripcion:
    Actualiza una pre-cria activa.
    */
    const index = precrias.findIndex(p => p.id === Number(id));
    if (index === -1 || precrias[index].activo === false) return null;
    precrias[index] = {
        ...precrias[index],
        ...dto
    };
    return precrias[index];
}

export function removePrecria(id) {
    /*
    Descripcion:
    Borrado logico de una pre-cria.
    */
    const index = precrias.findIndex(p => p.id === Number(id));
    if (index === -1 || precrias[index].activo === false) return null;
    precrias[index].activo = false;
    return precrias[index];
}

export function verificarProveedorExiste(nombre) {
    /*
    Descripcion:
    Verifica que el nombre del proveedor exista en el modulo de proveedores.
    */
    const p = proveedorModel.findByName(nombre);
    return p !== null;
}