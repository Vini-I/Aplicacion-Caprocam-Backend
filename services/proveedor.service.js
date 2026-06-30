/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.service.js
Autor: Joan
Fecha: 29/06/2026
Modulo: Proveedores
Descripcion:
Logica de negocio para el modulo de proveedores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import * as proveedorModel from "../models/proveedor.model.js";
import { proveedorDTO, proveedoresDTO } from "../dtos/proveedor.dto.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES AUXILIARES
//////////////////////////////////////////////////////////
*/

function generarIniciales(nombre) {
    /*
    Descripcion:
    Genera las iniciales de un proveedor a partir de su nombre.

    Parametros:
    - nombre: Nombre del proveedor.

    Retorna:
    - Las primeras letras de cada palabra del nombre.
    */
    if (!nombre) return "";
    return nombre
        .split(" ")
        .filter(word => word.length > 0)
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 3);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function listarProveedores() {
    /*
    Descripcion:
    Obtiene todos los proveedores activos aplicando DTO.

    Parametros:
    No posee.

    Retorna:
    - Lista de proveedores convertida a DTO.
    */
    const proveedores = proveedorModel.findAll();
    return proveedoresDTO(proveedores);
}

export function obtenerProveedor(id) {
    /*
    Descripcion:
    Obtiene un proveedor por su ID aplicando DTO.

    Parametros:
    - id: ID del proveedor a buscar.

    Retorna:
    - Proveedor convertido a DTO, o null si no se encuentra.
    */
    const proveedor = proveedorModel.findById(id);
    if (!proveedor) return null;
    return proveedorDTO(proveedor);
}

export function crearProveedor(datos) {
    /*
    Descripcion:
    Crea un proveedor y valida que no este duplicado.

    Parametros:
    - datos: Datos del nuevo proveedor.

    Retorna:
    - El proveedor creado convertido a DTO.
    */
    const duplicado = proveedorModel.findByName(datos.nombre);
    if (duplicado) {
        throw new Error("Ya existe un proveedor activo con ese nombre.");
    }

    const iniciales = generarIniciales(datos.nombre);
    const completo = {
        ...datos,
        iniciales
    };

    const creado = proveedorModel.create(completo);
    return proveedorDTO(creado);
}

export function actualizarProveedor(id, datos) {
    /*
    Descripcion:
    Actualiza un proveedor por su ID y valida el nombre si cambia.

    Parametros:
    - id: ID del proveedor.
    - datos: Datos a actualizar.

    Retorna:
    - El proveedor actualizado convertido a DTO.
    */
    const existente = proveedorModel.findById(id);
    if (!existente) {
        throw new Error("Proveedor no encontrado.");
    }

    if (datos.nombre && datos.nombre !== existente.nombre) {
        const duplicado = proveedorModel.findByName(datos.nombre);
        if (duplicado) {
            throw new Error("Ya existe otro proveedor con ese nombre.");
        }
    }

    const nuevosDatos = { ...datos };
    if (datos.nombre) {
        nuevosDatos.iniciales = generarIniciales(datos.nombre);
    }

    const actualizado = proveedorModel.update(id, nuevosDatos);
    return proveedorDTO(actualizado);
}

export function eliminarProveedor(id) {
    /*
    Descripcion:
    Elimina (borrado logico) un proveedor.

    Parametros:
    - id: ID del proveedor a eliminar.

    Retorna:
    - El proveedor eliminado convertido a DTO.
    */
    const eliminado = proveedorModel.remove(id);
    if (!eliminado) {
        throw new Error("Proveedor no encontrado o ya inactivo.");
    }
    return proveedorDTO(eliminado);
}
