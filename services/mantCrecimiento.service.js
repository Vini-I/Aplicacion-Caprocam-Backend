/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.service.js
Autor: Greivin Arguedas
Fecha: 28/06/2026
Modulo: Crecimiento
Descripcion:
Define las reglas de negocio de crecimiento.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import {obtenerFincas, obtenerEstanquesPorFinca, obtenerEstanquePorId,
    guardarCrecimiento, actualizarPesoEstanque
} from "../models/mantCrecimiento.model.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el controller para verificar los datos.
*/

export async function listarFincas() {
    /*
    Descripcion:
    Obtiene la lista de fincas desde el modelo.

    Parametros:
    No posee.

    Retorna:
    - Array de fincas
    */
    return await obtenerFincas();
}

export async function listarEstanquesPorFinca(fincaId) {
    /*
    Descripcion:
    Obtiene la lista de estanques para una finca específica.

    Parametros:
    - fincaId: ID de la finca.

    Retorna:
    - Array de estanques por finca
    */
    return await obtenerEstanquesPorFinca(fincaId);
}

export async function obtenerInformacionEstanque(estanqueId) {
    /*
    Descripcion:
    Obtiene la información de un estanque específico.

    Parametros:
    - estanqueId: ID del estanque.

    Retorna:
    - Objeto con la información del estanque
    */
    const estanque = await obtenerEstanquePorId(estanqueId);

    if (!estanque) {
        throw new Error("El estanque no existe.");
    }

    return {
        id: estanque.id,
        codigo: estanque.codigo,
        nombre: estanque.nombre,
        diasCultivo: estanque.diasCultivo,
        pesoAnterior: estanque.pesoActual,
        estado: estanque.estado
    };
}

export async function registrarCrecimiento(datos) {
    /*
    Descripcion:
    Registra un nuevo crecimiento para un estanque específico.

    Parametros:
    - datos: Objeto con los datos del crecimiento (estanqueId, pesoActual, observacion).

    Retorna:
    - Objeto con el ID del crecimiento registrado.
    */

    const estanque = await obtenerEstanquePorId(datos.estanqueId);

    if (!estanque) {
        throw new Error("El estanque no existe.");
    }

    if (datos.pesoActual <= 0) {
        throw new Error("El peso actual debe ser mayor que cero.");
    }

    const pesoAnterior = Number(estanque.pesoActual);
    const pesoActual = Number(datos.pesoActual);

    const incremento = Number((pesoActual - pesoAnterior).toFixed(2));

    const crecimiento = {
        estanqueId: datos.estanqueId,
        pesoAnterior,
        pesoActual,
        incremento,
        fechaRegistro: new Date(),
        observacion: datos.observacion || null
    };

    const id = await guardarCrecimiento(crecimiento);

    await actualizarPesoEstanque(datos.estanqueId,pesoActual);

    return {id, ...crecimiento};
}