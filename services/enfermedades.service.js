/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.service.js
Autor: Isaac Chaves
Fecha: 18/07/2026
Modulo: Enfermedades
Descripcion:
Define las reglas de negocio, validaciones, catalogos,
mapeos y resumenes del modulo de enfermedades.

Importante:
Este archivo NO usa el modelo. El acceso a la base de datos
se realiza desde el controller por medio del model.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { TipoEnfermedad, SeveridadEnfermedad } from '../dtos/enfermedades.dto.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Catalogos visibles del modulo de enfermedades.
El campo value usa el mismo valor que la base de datos.
El campo codigo ayuda al frontend a usar valores cortos.
*/

const catalogoEnfermedades = [
    {
        label: 'WSSV - Mancha Blanca',
        value: TipoEnfermedad.WSSV,
        codigo: 'wssv',
        tipo: 'viral',
    },
    {
        label: 'AHPND - Necrosis hepatopancreatica aguda',
        value: TipoEnfermedad.AHPND,
        codigo: 'ahpnd',
        tipo: 'bacteriana',
    },
    {
        label: 'Vibriosis',
        value: TipoEnfermedad.VIBRIOSIS,
        codigo: 'vibriosis',
        tipo: 'bacteriana',
    },
    {
        label: 'IHHNV',
        value: TipoEnfermedad.IHHNV,
        codigo: 'ihhnv',
        tipo: 'viral',
    },
    {
        label: 'NHP - Hepatobacter penaei',
        value: TipoEnfermedad.NHP,
        codigo: 'nhp',
        tipo: 'bacteriana',
    },
    {
        label: 'Otro',
        value: TipoEnfermedad.OTRO,
        codigo: 'otro',
        tipo: 'otro',
    },
];

const catalogoSeveridades = [
    {
        label: 'Bajo',
        value: SeveridadEnfermedad.BAJO,
    },
    {
        label: 'Medio',
        value: SeveridadEnfermedad.MEDIO,
    },
    {
        label: 'Alto',
        value: SeveridadEnfermedad.ALTO,
    },
    {
        label: 'Critica',
        value: SeveridadEnfermedad.CRITICA,
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion,
normalizacion, catalogo y resumen que utiliza el controller.
*/

export function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio, es null, undefined
    o solo contiene espacios.

    Parametros:
    - valor: Valor a verificar.

    Retorna:
    - true si esta vacio.
    - false si tiene contenido.
    */

    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    return String(valor).trim().length === 0;
}

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que un id sea numerico y mayor que cero.

    Parametros:
    - id: ID recibido por parametro.

    Retorna:
    - true si el id es valido.
    - false si no es valido.
    */

    const numero = Number(id);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero <= 0) {
        return false;
    }

    return true;
}

export function isNumeroMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor que cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si cumple la regla.
    - false si no cumple.
    */

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero <= 0) {
        return false;
    }

    return true;
}

export function isNumeroMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor o igual que cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si cumple la regla.
    - false si no cumple.
    */

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero < 0) {
        return false;
    }

    return true;
}

export function isFechaValida(fecha) {
    /*
    Descripcion:
    Valida que una fecha tenga el formato yyyy-mm-dd.

    Parametros:
    - fecha: Fecha a validar.

    Retorna:
    - true si la fecha es valida.
    - false si no es valida.
    */

    if (isEmpty(fecha)) {
        return false;
    }

    const fechaTexto = String(fecha).trim();
    const patronIso = /^\d{4}-\d{2}-\d{2}$/;

    if (patronIso.test(fechaTexto)) {
        return true;
    }

    return false;
}

export function normalizarEnfermedad(enfermedad) {
    /*
    Descripcion:
    Convierte una enfermedad recibida desde el frontend al valor
    exacto que espera el ENUM de MySQL.

    Parametros:
    - enfermedad: Enfermedad recibida.

    Retorna:
    - Valor valido para MySQL.
    - String vacio si no se reconoce.
    */

    if (isEmpty(enfermedad)) {
        return '';
    }

    const texto = String(enfermedad).trim();
    const codigo = texto.toLowerCase();

    if (texto === TipoEnfermedad.WSSV || codigo === 'wssv') {
        return TipoEnfermedad.WSSV;
    }

    if (texto === TipoEnfermedad.AHPND || codigo === 'ahpnd') {
        return TipoEnfermedad.AHPND;
    }

    if (texto === TipoEnfermedad.VIBRIOSIS || codigo === 'vibriosis') {
        return TipoEnfermedad.VIBRIOSIS;
    }

    if (texto === TipoEnfermedad.IHHNV || codigo === 'ihhnv') {
        return TipoEnfermedad.IHHNV;
    }

    if (texto === TipoEnfermedad.NHP || codigo === 'nhp') {
        return TipoEnfermedad.NHP;
    }

    if (texto === TipoEnfermedad.OTRO || codigo === 'otro') {
        return TipoEnfermedad.OTRO;
    }

    return '';
}

export function normalizarSeveridad(severidad) {
    /*
    Descripcion:
    Convierte una severidad recibida desde el frontend al valor
    exacto que espera el ENUM de MySQL.

    Parametros:
    - severidad: Severidad recibida.

    Retorna:
    - Valor valido para MySQL.
    - String vacio si no se reconoce.
    */

    if (isEmpty(severidad)) {
        return '';
    }

    const texto = String(severidad).trim().toLowerCase();

    if (texto === 'bajo' || texto === 'baja') {
        return SeveridadEnfermedad.BAJO;
    }

    if (texto === 'medio' || texto === 'media') {
        return SeveridadEnfermedad.MEDIO;
    }

    if (texto === 'alto' || texto === 'alta') {
        return SeveridadEnfermedad.ALTO;
    }

    if (texto === 'critica' || texto === 'crítica') {
        return SeveridadEnfermedad.CRITICA;
    }

    return '';
}

export function isEnfermedadValida(enfermedad) {
    /*
    Descripcion:
    Valida que la enfermedad exista dentro del catalogo permitido.

    Parametros:
    - enfermedad: Enfermedad recibida.

    Retorna:
    - true si es valida.
    - false si no es valida.
    */

    const enfermedadNormalizada = normalizarEnfermedad(enfermedad);

    if (isEmpty(enfermedadNormalizada)) {
        return false;
    }

    return Object.values(TipoEnfermedad).includes(enfermedadNormalizada);
}

export function isSeveridadValida(severidad) {
    /*
    Descripcion:
    Valida que la severidad exista dentro del catalogo permitido.

    Parametros:
    - severidad: Severidad recibida.

    Retorna:
    - true si es valida.
    - false si no es valida.
    */

    const severidadNormalizada = normalizarSeveridad(severidad);

    if (isEmpty(severidadNormalizada)) {
        return false;
    }

    return Object.values(SeveridadEnfermedad).includes(severidadNormalizada);
}

export function normalizarDatosEnfermedad(body, grupoDatos) {
    /*
    Descripcion:
    Construye un objeto normalizado para trabajar con la tabla
    enfermedades de MySQL.

    Parametros:
    - body: Cuerpo de la peticion.
    - grupoDatos: Grupo de datos obtenido del usuario o del body.

    Retorna:
    - Objeto normalizado.
    */

    return {
        grupoDatos: normalizarEntero(grupoDatos),
        fincaId: normalizarEntero(body.fincaId),
        estanqueId: normalizarEntero(body.estanqueId),
        colaboradorId: normalizarEnteroOpcional(body.colaboradorId),
        tipoRegistro: 'enfermedad',
        fechaReporte: limpiarTexto(body.fechaReporte),
        responsable: limpiarTextoOpcional(body.responsable),
        enfermedad: normalizarEnfermedad(body.enfermedad),
        enfermedadNombre: obtenerNombreEnfermedad(normalizarEnfermedad(body.enfermedad)),
        severidad: normalizarSeveridad(body.severidad),
        severidadNombre: obtenerNombreSeveridad(normalizarSeveridad(body.severidad)),
        mortalidadRegistrada: normalizarEnteroOpcional(body.mortalidadRegistrada),
        reporte: limpiarTextoOpcional(body.reporte),
    };
}

export function normalizarFiltrosEnfermedad(query, grupoDatos) {
    /*
    Descripcion:
    Construye los filtros de busqueda para consultar enfermedades.

    Parametros:
    - query: Query params recibidos.
    - grupoDatos: Grupo de datos del usuario o query.

    Retorna:
    - Objeto con filtros normalizados.
    */

    return {
        grupoDatos: normalizarEntero(grupoDatos),
        fincaId: normalizarEnteroOpcional(query.fincaId),
        estanqueId: normalizarEnteroOpcional(query.estanqueId),
        colaboradorId: normalizarEnteroOpcional(query.colaboradorId),
        enfermedad: normalizarEnfermedad(query.enfermedad),
        severidad: normalizarSeveridad(query.severidad),
        fechaReporte: limpiarTextoOpcional(query.fechaReporte),
    };
}

export function validarDatosEnfermedad(datos) {
    /*
    Descripcion:
    Valida las reglas de negocio para crear o actualizar
    un registro de enfermedad.

    Parametros:
    - datos: Datos normalizados.

    Retorna:
    - Lista de errores encontrados.
    */

    const errores = [];

    validarEnteroMayorCero(datos.grupoDatos, 'grupoDatos', errores);
    validarEnteroMayorCero(datos.fincaId, 'fincaId', errores);
    validarEnteroMayorCero(datos.estanqueId, 'estanqueId', errores);
    validarColaboradorOpcional(datos.colaboradorId, errores);
    validarFechaReporte(datos.fechaReporte, errores);
    validarEnfermedad(datos.enfermedad, errores);
    validarSeveridad(datos.severidad, errores);
    validarMortalidad(datos.mortalidadRegistrada, errores);

    return errores;
}

export function validarFiltrosEnfermedad(filtros) {
    /*
    Descripcion:
    Valida los filtros usados para consultar registros.

    Parametros:
    - filtros: Filtros normalizados.

    Retorna:
    - Lista de errores encontrados.
    */

    const errores = [];

    validarEnteroMayorCero(filtros.grupoDatos, 'grupoDatos', errores);

    if (filtros.fincaId !== null) {
        validarEnteroMayorCero(filtros.fincaId, 'fincaId', errores);
    }

    if (filtros.estanqueId !== null) {
        validarEnteroMayorCero(filtros.estanqueId, 'estanqueId', errores);
    }

    if (filtros.colaboradorId !== null) {
        validarEnteroMayorCero(filtros.colaboradorId, 'colaboradorId', errores);
    }

    if (!isEmpty(filtros.fechaReporte)) {
        if (!isFechaValida(filtros.fechaReporte)) {
            errores.push('El campo fechaReporte debe tener formato yyyy-mm-dd.');
        }
    }

    return errores;
}

export function obtenerNombreEnfermedad(enfermedad) {
    /*
    Descripcion:
    Obtiene el nombre visible de una enfermedad.

    Parametros:
    - enfermedad: Valor interno de la enfermedad.

    Retorna:
    - Nombre visible.
    */

    for (let i = 0; i < catalogoEnfermedades.length; i++) {
        if (catalogoEnfermedades[i].value === enfermedad) {
            return catalogoEnfermedades[i].label;
        }
    }

    return 'Otro';
}

export function obtenerNombreSeveridad(severidad) {
    /*
    Descripcion:
    Obtiene el nombre visible de una severidad.

    Parametros:
    - severidad: Valor interno de severidad.

    Retorna:
    - Nombre visible.
    */

    for (let i = 0; i < catalogoSeveridades.length; i++) {
        if (catalogoSeveridades[i].value === severidad) {
            return catalogoSeveridades[i].label;
        }
    }

    return 'Bajo';
}

export function obtenerCatalogoEnfermedades() {
    /*
    Descripcion:
    Obtiene el catalogo de enfermedades disponibles.

    Parametros:
    No posee.

    Retorna:
    - Lista de enfermedades.
    */

    return catalogoEnfermedades;
}

export function obtenerCatalogoSeveridades() {
    /*
    Descripcion:
    Obtiene el catalogo de severidades disponibles.

    Parametros:
    No posee.

    Retorna:
    - Lista de severidades.
    */

    return catalogoSeveridades;
}

export function construirResumenEnfermedades(registros) {
    /*
    Descripcion:
    Construye un resumen general de los registros de enfermedades.

    Parametros:
    - registros: Lista de registros.

    Retorna:
    - Objeto con totales y frecuencias.
    */

    const resumen = {
        totalRegistros: registros.length,
        totalMortalidadRegistrada: 0,
        enfermedadesFrecuentes: [],
        severidadesFrecuentes: [],
    };

    const contadorEnfermedades = {};
    const contadorSeveridades = {};

    for (let i = 0; i < registros.length; i++) {
        const registro = registros[i];

        sumarMortalidad(resumen, registro);
        contarValor(contadorEnfermedades, registro.enfermedad);
        contarValor(contadorSeveridades, registro.severidad);
    }

    resumen.enfermedadesFrecuentes = construirListaEnfermedades(contadorEnfermedades);
    resumen.severidadesFrecuentes = construirListaSeveridades(contadorSeveridades);

    return resumen;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas usadas para normalizar, validar y
construir resumenes.
*/

function limpiarTexto(valor) {
    /*
    Descripcion:
    Limpia un texto requerido.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Texto limpio.
    */

    if (valor === undefined) {
        return '';
    }

    if (valor === null) {
        return '';
    }

    return String(valor).trim();
}

function limpiarTextoOpcional(valor) {
    /*
    Descripcion:
    Limpia un texto opcional.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Texto limpio o null.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (String(valor).trim().length === 0) {
        return null;
    }

    return String(valor).trim();
}

function normalizarEntero(valor) {
    /*
    Descripcion:
    Convierte un valor a numero entero.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero entero o NaN.
    */

    return Number(valor);
}

function normalizarEnteroOpcional(valor) {
    /*
    Descripcion:
    Convierte un valor opcional a numero entero.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero entero o null.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (String(valor).trim().length === 0) {
        return null;
    }

    return Number(valor);
}

function validarEnteroMayorCero(valor, campo, errores) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor que cero.

    Parametros:
    - valor: Valor recibido.
    - campo: Nombre del campo.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (Number.isNaN(Number(valor))) {
        errores.push('El campo ' + campo + ' debe ser numerico.');
        return;
    }

    if (Number(valor) <= 0) {
        errores.push('El campo ' + campo + ' debe ser mayor que cero.');
    }
}

function validarColaboradorOpcional(valor, errores) {
    /*
    Descripcion:
    Valida el colaborador cuando viene informado.

    Parametros:
    - valor: Colaborador recibido.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (valor === null) {
        return;
    }

    validarEnteroMayorCero(valor, 'colaboradorId', errores);
}

function validarFechaReporte(fechaReporte, errores) {
    /*
    Descripcion:
    Valida la fecha de reporte.

    Parametros:
    - fechaReporte: Fecha recibida.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (isEmpty(fechaReporte)) {
        errores.push('El campo fechaReporte es requerido.');
        return;
    }

    if (!isFechaValida(fechaReporte)) {
        errores.push('El campo fechaReporte debe tener formato yyyy-mm-dd.');
    }
}

function validarEnfermedad(enfermedad, errores) {
    /*
    Descripcion:
    Valida la enfermedad.

    Parametros:
    - enfermedad: Enfermedad recibida.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (isEmpty(enfermedad)) {
        errores.push('El campo enfermedad no es valido.');
    }
}

function validarSeveridad(severidad, errores) {
    /*
    Descripcion:
    Valida la severidad.

    Parametros:
    - severidad: Severidad recibida.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (isEmpty(severidad)) {
        errores.push('El campo severidad no es valido.');
    }
}

function validarMortalidad(mortalidadRegistrada, errores) {
    /*
    Descripcion:
    Valida la mortalidad registrada.

    Parametros:
    - mortalidadRegistrada: Mortalidad recibida.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (mortalidadRegistrada === null) {
        return;
    }

    if (!isNumeroMayorIgualCero(mortalidadRegistrada)) {
        errores.push('El campo mortalidadRegistrada debe ser numerico y mayor o igual que cero.');
    }
}

function sumarMortalidad(resumen, registro) {
    /*
    Descripcion:
    Suma la mortalidad registrada al resumen.

    Parametros:
    - resumen: Objeto resumen.
    - registro: Registro actual.

    Retorna:
    No retorna valor.
    */

    const mortalidad = Number(registro.mortalidadRegistrada);

    if (Number.isNaN(mortalidad)) {
        return;
    }

    resumen.totalMortalidadRegistrada =
        resumen.totalMortalidadRegistrada + mortalidad;
}

function contarValor(contador, valor) {
    /*
    Descripcion:
    Suma una ocurrencia dentro de un objeto contador.

    Parametros:
    - contador: Objeto donde se almacenan cantidades.
    - valor: Valor que se desea contar.

    Retorna:
    No retorna valor.
    */

    if (isEmpty(valor)) {
        return;
    }

    if (contador[valor] === undefined) {
        contador[valor] = 0;
    }

    contador[valor] = contador[valor] + 1;
}

function construirListaEnfermedades(contador) {
    /*
    Descripcion:
    Convierte el contador de enfermedades en una lista.

    Parametros:
    - contador: Objeto contador.

    Retorna:
    - Lista ordenada.
    */

    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];

        lista.push({
            valor: clave,
            nombre: obtenerNombreEnfermedad(clave),
            cantidad: contador[clave],
        });
    }

    lista.sort(function (a, b) {
        return b.cantidad - a.cantidad;
    });

    return lista;
}

function construirListaSeveridades(contador) {
    /*
    Descripcion:
    Convierte el contador de severidades en una lista.

    Parametros:
    - contador: Objeto contador.

    Retorna:
    - Lista ordenada.
    */

    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];

        lista.push({
            valor: clave,
            nombre: obtenerNombreSeveridad(clave),
            cantidad: contador[clave],
        });
    }

    lista.sort(function (a, b) {
        return b.cantidad - a.cantidad;
    });

    return lista;
}
