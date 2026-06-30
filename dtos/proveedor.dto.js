/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.Dto.js
Autor: Oscar Mario Alvarez
Fecha: 29/06/2026
Modulo: proveedores
Descripcion:
Modulo de tranferencia de datos dto para proveedor,
caparazon para almacenar datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo tipo productos.
*/

export const tipoProductos = Object.freeze({
    ALIMENTO:        'alimento',
    ANTIBIOTICO:  'antibiotico',
    FERTILIZANTES:   'fertilizantes',
    PROBIOTICOS:     'probioticos',
    EQUIPOS:          'equipos',

});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de proveedores.
*/


export class proveedorDto {
  constructor({ id, nombre, tipoProducto, telefono, correo, direccion, notas }) {
    /*
        Descripcion:
        Construye un objeto proveedorDto con los datos recibidos.

        Parametros:
        - id:           Identificador unico (opcional en creacion)
        - nombre:       Nombre del colaborador (requerido)
        - tipoProducto: producto del proveedor (requerido, usar tipoProductos)
        - telefono:     Telefono de 8 digitos (opcional)
        - correo:       Correo electronico (requerido, validar regex)
        - direccion:    direccion del proveedor (opcional)
        - notas:        notas del proveedor (opcional)
        */

    this.id = id;
    this.nombre = nombre;
    this.tipoProducto = tipoProducto;
    this.telefono = telefono;
    this.correo = correo;
    this.direccion = direccion;
    this.notas = notas;
  }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
Contiene las funciones exportables de mapeo del DTO.
*/

/**
 * Convierte un objeto de proveedor en su DTO.
 * @param {object} proveedor - Objeto del modelo.
 * @returns {proveedorDto} Objeto filtrado.
 */
export function proveedorDTO(proveedor) {
    if (!proveedor) return null;
    return new proveedorDto({
        id:           proveedor.id,
        nombre:       proveedor.nombre,
        tipoProducto: proveedor.tipoProducto,
        telefono:     proveedor.telefono,
        correo:       proveedor.correo,
        direccion:    proveedor.direccion,
        notas:        proveedor.notas
    });
}

/**
 * Convierte una lista de proveedores en sus DTOs.
 * @param {Array} proveedores - Lista de proveedores.
 * @returns {Array<proveedorDto>} Lista filtrada.
 */
export function proveedoresDTO(proveedores) {
    if (!proveedores) return [];
    return proveedores.map(p => proveedorDTO(p));
}