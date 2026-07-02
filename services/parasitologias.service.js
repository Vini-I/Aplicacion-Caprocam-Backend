/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.service.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Define las reglas de negocio, calculos y validaciones del
modulo de parasitologias.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import parasitologiasModel from "../models/parasitologias.model.js";

// DTOs
import {
    listaParasitologiasSalidaDTO,
    parasitologiaSalidaDTO,
    resumenParasitologiasDTO
} from "../dtos/parasitologias.dto.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Catalogo de parasitos permitidos dentro del modulo.
*/

const PARASITOS_CATALOGO = [
    {
        label: "Gregarina",
        value: "gregarina"
    },
    {
        label: "Nematodo",
        value: "nematodo"
    },
    {
        label: "Epicomensal",
        value: "epicomensal"
    },
    {
        label: "Protozoario",
        value: "protozoario"
    },
    {
        label: "Otro",
        value: "otro"
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones que utiliza el controller para
realizar operaciones del modulo de parasitologias.
*/

async function obtenerParasitologias(filtros) {
    /*
    Descripcion:
    Obtiene todos los registros de parasitologias y aplica
    filtros opcionales enviados por query params.

    Parametros:
    - filtros: Objeto con finca, estanque, parasito y fechaReporte

    Retorna:
    - Lista de parasitologias transformadas para la respuesta
    */
    const registros = await parasitologiasModel.findAll(filtros);
    const data = listaParasitologiasSalidaDTO(registros);

    return data;
}

async function obtenerParasitologiaPorId(id) {
    /*
    Descripcion:
    Busca un registro de parasitologia por su ID.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro encontrado transformado para la respuesta

    Lanza:
    - Error 400 si el id no es valido
    - Error 404 si el registro no existe
    */
    if (isIdValido(id) === false) {
        throw crearError("El id de la parasitologia no es valido", 400);
    }

    const registro = await parasitologiasModel.findById(id);

    if (registro === null) {
        throw crearError("Registro de parasitologia no encontrado", 404);
    }

    return parasitologiaSalidaDTO(registro);
}

async function crearParasitologia(datos) {
    /*
    Descripcion:
    Crea un nuevo registro de parasitologia con sus calculos
    automaticos de porcentaje y grado de infeccion.

    Parametros:
    - datos: Datos normalizados desde el DTO de entrada

    Retorna:
    - Registro creado transformado para la respuesta
    */
    const datosCreacion = construirDatosParasitologia(datos);
    const registro = await parasitologiasModel.create(datosCreacion);

    return parasitologiaSalidaDTO(registro);
}

async function actualizarParasitologia(id, datos) {
    /*
    Descripcion:
    Actualiza un registro de parasitologia existente.

    Parametros:
    - id: Identificador del registro
    - datos: Datos normalizados desde el DTO de entrada

    Retorna:
    - Registro actualizado transformado para la respuesta

    Lanza:
    - Error 400 si el id no es valido
    - Error 404 si el registro no existe
    */
    if (isIdValido(id) === false) {
        throw crearError("El id de la parasitologia no es valido", 400);
    }

    const registroActual = await parasitologiasModel.findById(id);

    if (registroActual === null) {
        throw crearError("Registro de parasitologia no encontrado", 404);
    }

    const datosActualizacion = construirDatosParasitologia(datos);
    const registro = await parasitologiasModel.update(id, datosActualizacion);

    return parasitologiaSalidaDTO(registro);
}

async function eliminarParasitologia(id) {
    /*
    Descripcion:
    Elimina logicamente un registro de parasitologia por su ID.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro eliminado transformado para la respuesta

    Lanza:
    - Error 400 si el id no es valido
    - Error 404 si el registro no existe
    */
    if (isIdValido(id) === false) {
        throw crearError("El id de la parasitologia no es valido", 400);
    }

    const registroActual = await parasitologiasModel.findById(id);

    if (registroActual === null) {
        throw crearError("Registro de parasitologia no encontrado", 404);
    }

    const registro = await parasitologiasModel.remove(id);

    return parasitologiaSalidaDTO(registro);
}

async function obtenerResumenParasitologias(filtros) {
    /*
    Descripcion:
    Genera un resumen general de parasitologias con totales,
    promedio de infeccion y frecuencias.

    Parametros:
    - filtros: Objeto con filtros opcionales

    Retorna:
    - Resumen transformado para la respuesta
    */
    const registros = await parasitologiasModel.findAll(filtros);
    const resumen = construirResumenParasitologias(registros);
    const data = resumenParasitologiasDTO(resumen);

    return data;
}

function obtenerCatalogoParasitos() {
    /*
    Descripcion:
    Retorna el catalogo de parasitos disponibles.

    Parametros:
    - No recibe parametros

    Retorna:
    - Lista de parasitos con label y value
    */
    return PARASITOS_CATALOGO;
}

function validarDatosParasitologia(body) {
    /*
    Descripcion:
    Valida los datos requeridos para crear o actualizar
    una parasitologia.

    Parametros:
    - body: Datos recibidos en el request body

    Retorna:
    - Objeto con valido y lista de errores
    */
    const errores = [];
    const datos = body || {};

    validarCampoObligatorio(datos.finca, "finca", errores);
    validarCampoObligatorio(datos.estanque, "estanque", errores);
    validarCampoObligatorio(datos.fechaReporte, "fechaReporte", errores);
    validarCampoObligatorio(datos.parasito, "parasito", errores);
    validarTextoValido(datos.finca, "finca", errores);
    validarTextoValido(datos.estanque, "estanque", errores);
    validarTextoValido(datos.parasito, "parasito", errores);
    validarFechaValida(datos.fechaReporte, "fechaReporte", errores);

    validarNumeroMayorCero(
        datos.camaronesMuestreados,
        "camaronesMuestreados",
        errores
    );

    validarNumeroMayorIgualCero(
        datos.camaronesInfectados,
        "camaronesInfectados",
        errores
    );

    validarInfectadosContraMuestreados(
        datos.camaronesMuestreados,
        datos.camaronesInfectados,
        errores
    );

    return {
        valido: errores.length === 0,
        errores: errores
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas para calculos, validaciones y
construccion de objetos de negocio.
*/

function construirDatosParasitologia(datos) {
    /*
    Descripcion:
    Construye el objeto completo de parasitologia incluyendo
    
    campos calculados.

    Parametros:
    - datos: Datos normalizados recibidos desde el DTO

    Retorna:
    - Objeto listo para guardar en el modelo
    */
    const porcentajeInfeccion = calcularPorcentajeInfeccion(
        datos.camaronesMuestreados,
        datos.camaronesInfectados
    );

    const gradoInfeccion = calcularGradoInfeccion(porcentajeInfeccion);
    const gradoInfeccionNombre = obtenerNombreGradoInfeccion(gradoInfeccion);

    return {
        tipoRegistro: "parasitologia",
        finca: datos.finca,
        fincaNombre: datos.fincaNombre,
        estanque: datos.estanque,
        fechaReporte: datos.fechaReporte,
        responsable: datos.responsable,
        parasito: datos.parasito,
        parasitoNombre: obtenerNombreParasito(datos.parasito),
        camaronesMuestreados: datos.camaronesMuestreados,
        camaronesInfectados: datos.camaronesInfectados,
        porcentajeInfeccion: porcentajeInfeccion,
        gradoInfeccion: gradoInfeccion,
        gradoInfeccionNombre: gradoInfeccionNombre,
        observaciones: datos.observaciones
    };
}

function calcularPorcentajeInfeccion(camaronesMuestreados, camaronesInfectados) {
    /*
    Descripcion:
    Calcula el porcentaje de infeccion con base en camarones
    muestreados e infectados.

    Parametros:
    - camaronesMuestreados: Total de camarones revisados
    - camaronesInfectados: Total de camarones infectados

    Retorna:
    - Porcentaje de infeccion con dos decimales
    */
    let porcentaje = 0;

    if (Number(camaronesMuestreados) > 0) {
        porcentaje = (
            Number(camaronesInfectados) / Number(camaronesMuestreados)
        ) * 100;
    }

    return Number(porcentaje.toFixed(2));
}

function calcularGradoInfeccion(porcentajeInfeccion) {
    /*
    Descripcion:
    Determina el grado de infeccion segun el porcentaje calculado.

    Parametros:
    - porcentajeInfeccion: Porcentaje calculado

    Retorna:
    - bajo, medio o alto
    */
    let grado = "bajo";

    if (porcentajeInfeccion >= 30) {
        grado = "medio";
    }

    if (porcentajeInfeccion >= 60) {
        grado = "alto";
    }

    return grado;
}

function obtenerNombreGradoInfeccion(grado) {
    /*
    Descripcion:
    Convierte el valor tecnico del grado en un nombre visible.

    Parametros:
    - grado: Valor bajo, medio o alto

    Retorna:
    - Nombre del grado para mostrar en la respuesta
    */
    let nombre = "Bajo";

    if (grado === "medio") {
        nombre = "Medio";
    }

    if (grado === "alto") {
        nombre = "Alto";
    }

    return nombre;
}

function obtenerNombreParasito(valor) {
    /*
    Descripcion:
    Busca el nombre visible de un parasito usando el catalogo.

    Parametros:
    - valor: Valor interno del parasito

    Retorna:
    - Nombre visible del parasito
    */
    let nombre = valor;

    for (let i = 0; i < PARASITOS_CATALOGO.length; i++) {
        if (PARASITOS_CATALOGO[i].value === valor) {
            nombre = PARASITOS_CATALOGO[i].label;
        }
    }

    return nombre;
}

function construirResumenParasitologias(registros) {
    /*
    Descripcion:
    Calcula los totales, promedio y frecuencias de los registros
    de parasitologias.

    Parametros:
    - registros: Lista de registros filtrados

    Retorna:
    - Objeto resumen del modulo
    */
    const resumen = {
        totalRegistros: registros.length,
        totalCamaronesMuestreados: 0,
        totalCamaronesInfectados: 0,
        promedioInfeccion: 0,
        gradosFrecuentes: [],
        parasitosFrecuentes: []
    };

    const contadorGrados = {};
    const contadorParasitos = {};
    let sumaPorcentajeInfeccion = 0;

    for (let i = 0; i < registros.length; i++) {
        const registro = registros[i];

        resumen.totalCamaronesMuestreados =
            resumen.totalCamaronesMuestreados +
            Number(registro.camaronesMuestreados);

        resumen.totalCamaronesInfectados =
            resumen.totalCamaronesInfectados +
            Number(registro.camaronesInfectados);

        sumaPorcentajeInfeccion =
            sumaPorcentajeInfeccion + Number(registro.porcentajeInfeccion);

        contarValor(contadorGrados, registro.gradoInfeccion);
        contarValor(contadorParasitos, registro.parasito);
    }

    if (registros.length > 0) {
        resumen.promedioInfeccion = sumaPorcentajeInfeccion / registros.length;
        resumen.promedioInfeccion = Number(resumen.promedioInfeccion.toFixed(2));
    }

    resumen.gradosFrecuentes = construirListaContador(contadorGrados);
    resumen.parasitosFrecuentes = construirListaContador(contadorParasitos);

    return resumen;
}

function contarValor(contador, valor) {
    /*
    Descripcion:
    Suma una ocurrencia dentro de un objeto contador.

    Parametros:
    - contador: Objeto usado para contar valores
    - valor: Valor que se desea contar

    Retorna:
    - No retorna valor, modifica el contador recibido
    */
    if (isEmpty(valor) === true) {
        return;
    }

    if (contador[valor] === undefined) {
        contador[valor] = 0;
    }

    contador[valor] = contador[valor] + 1;
}

function construirListaContador(contador) {
    /*
    Descripcion:
    Convierte un objeto contador en una lista ordenada por cantidad.

    Parametros:
    - contador: Objeto con valores y cantidades

    Retorna:
    - Arreglo de objetos con valor y cantidad
    */
    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];

        lista.push({
            valor: clave,
            cantidad: contador[clave]
        });
    }

    lista.sort(function (a, b) {
        return b.cantidad - a.cantidad;
    });

    return lista;
}

function crearError(mensaje, status) {
    /*
    Descripcion:
    Crea un error con status HTTP personalizado.

    Parametros:
    - mensaje: Mensaje del error
    - status: Codigo HTTP del error

    Retorna:
    - Objeto Error con propiedad status
    */
    const error = new Error(mensaje);
    error.status = status;

    return error;
}

function validarCampoObligatorio(valor, campo, errores) {
    /*
    Descripcion:
    Valida que un campo obligatorio tenga contenido.

    Parametros:
    - valor: Valor recibido
    - campo: Nombre del campo
    - errores: Arreglo donde se agregan los errores

    Retorna:
    - No retorna valor, modifica el arreglo errores
    */
    if (isEmpty(valor) === true) {
        errores.push("El campo " + campo + " es obligatorio");
    }
}

function validarTextoValido(valor, campo, errores) {
    /*
    Descripcion:
    Valida que un campo de texto no venga vacio.

    Parametros:
    - valor: Valor recibido
    - campo: Nombre del campo
    - errores: Arreglo donde se agregan los errores

    Retorna:
    - No retorna valor, modifica el arreglo errores
    */
    if (isEmpty(valor) === true) {
        return;
    }

    if (String(valor).trim().length < 1) {
        errores.push("El campo " + campo + " no es valido");
    }
}

function validarFechaValida(valor, campo, errores) {
    /*
    Descripcion:
    Valida que una fecha tenga formato yyyy-mm-dd o dd/mm/aaaa.

    Parametros:
    - valor: Fecha recibida
    - campo: Nombre del campo
    - errores: Arreglo donde se agregan los errores

    Retorna:
    - No retorna valor, modifica el arreglo errores
    */
    if (isEmpty(valor) === true) {
        return;
    }

    const fechaTexto = String(valor).trim();
    const patronIso = /^\d{4}-\d{2}-\d{2}$/;
    const patronLocal = /^\d{2}\/\d{2}\/\d{4}$/;

    if (patronIso.test(fechaTexto) === true) {
        return;
    }

    if (patronLocal.test(fechaTexto) === true) {
        return;
    }

    errores.push(
        "El campo " + campo + " debe tener formato yyyy-mm-dd o dd/mm/aaaa"
    );
}

function validarNumeroMayorCero(valor, campo, errores) {
    /*
    Descripcion:
    Valida que un campo sea numerico y mayor que cero.

    Parametros:
    - valor: Valor recibido
    - campo: Nombre del campo
    - errores: Arreglo donde se agregan los errores

    Retorna:
    - No retorna valor, modifica el arreglo errores
    */
    if (isEmpty(valor) === true) {
        errores.push("El campo " + campo + " es obligatorio");
        return;
    }

    if (isNumero(valor) === false) {
        errores.push("El campo " + campo + " debe ser numerico");
        return;
    }

    if (Number(valor) <= 0) {
        errores.push("El campo " + campo + " debe ser mayor a cero");
    }
}

function validarNumeroMayorIgualCero(valor, campo, errores) {
    /*
    Descripcion:
    Valida que un campo sea numerico y mayor o igual que cero.

    Parametros:
    - valor: Valor recibido
    - campo: Nombre del campo
    - errores: Arreglo donde se agregan los errores

    Retorna:
    - No retorna valor, modifica el arreglo errores
    */
    if (isEmpty(valor) === true) {
        errores.push("El campo " + campo + " es obligatorio");
        return;
    }

    if (isNumero(valor) === false) {
        errores.push("El campo " + campo + " debe ser numerico");
        return;
    }

    if (Number(valor) < 0) {
        errores.push("El campo " + campo + " no puede ser negativo");
    }
}

function validarInfectadosContraMuestreados(
    camaronesMuestreados,
    camaronesInfectados,
    errores
) {
    /*
    Descripcion:
    Valida que los camarones infectados no superen los
    camarones muestreados.

    Parametros:
    - camaronesMuestreados: Total de camarones revisados
    - camaronesInfectados: Total de camarones infectados
    - errores: Arreglo donde se agregan los errores

    Retorna:
    - No retorna valor, modifica el arreglo errores
    */
    if (isNumero(camaronesMuestreados) === false) {
        return;
    }

    if (isNumero(camaronesInfectados) === false) {
        return;
    }

    if (Number(camaronesInfectados) > Number(camaronesMuestreados)) {
        errores.push(
            "Los camarones infectados no pueden ser mayores que los muestreados"
        );
    }
}

function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio.

    Parametros:
    - valor: Valor a revisar

    Retorna:
    - true si esta vacio, false si tiene contenido
    */
    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (String(valor).trim() === "") {
        return true;
    }

    return false;
}

function isIdValido(id) {
    /*
    Descripcion:
    Valida que un id tenga contenido.

    Parametros:
    - id: Id recibido por parametro

    Retorna:
    - true si es valido, false si no
    */
    if (isEmpty(id) === true) {
        return false;
    }

    if (String(id).trim().length < 1) {
        return false;
    }

    return true;
}

function isNumero(valor) {
    /*
    Descripcion:
    Valida que un valor pueda convertirse a numero.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - true si es numerico, false si no
    */
    const numero = Number(valor);

    if (Number.isNaN(numero) === true) {
        return false;
    }

    return true;
}

function isNumeroMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor que cero.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - true si es valido, false si no
    */
    if (isNumero(valor) === false) {
        return false;
    }

    if (Number(valor) <= 0) {
        return false;
    }

    return true;
}

function isNumeroMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor o igual que cero.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - true si es valido, false si no
    */
    if (isNumero(valor) === false) {
        return false;
    }

    if (Number(valor) < 0) {
        return false;
    }

    return true;
}

function isFechaValida(valor) {
    /*
    Descripcion:
    Valida que una fecha tenga formato permitido.

    Parametros:
    - valor: Fecha recibida

    Retorna:
    - true si es valida, false si no
    */
    const errores = [];

    validarFechaValida(valor, "fecha", errores);

    if (errores.length > 0) {
        return false;
    }

    return true;
}

function isTextoValido(valor) {
    /*
    Descripcion:
    Valida que un texto tenga contenido.

    Parametros:
    - valor: Texto recibido

    Retorna:
    - true si es valido, false si no
    */
    if (isEmpty(valor) === true) {
        return false;
    }

    return true;
}

/*
//////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////
*/

export default {
    obtenerParasitologias,
    obtenerParasitologiaPorId,
    crearParasitologia,
    actualizarParasitologia,
    eliminarParasitologia,
    obtenerResumenParasitologias,
    obtenerCatalogoParasitos,
    validarDatosParasitologia,
    isEmpty,
    isIdValido,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isFechaValida,
    isTextoValido
};