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

import {
    TipoEnfermedad,
    SeveridadEnfermedad
} from '../dtos/enfermedades.dto.js';

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

export function normalizarDatosEnfermedad(
    body,
    grupoDatos
) {
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

    const enfermedad =
        normalizarEnfermedad(
            body.enfermedad
        );

    const severidad =
        normalizarSeveridad(
            body.severidad
        );

    return {
        grupoDatos:
            normalizarEntero(
                grupoDatos
            ),

        fincaId:
            normalizarEntero(
                body.fincaId
            ),

        estanqueId:
            normalizarEntero(
                body.estanqueId
            ),

        tipoRegistro:
            'enfermedad',

        fechaReporte:
            limpiarTexto(
                body.fechaReporte
            ),

        responsable:
            limpiarTextoOpcional(
                body.responsable
            ),

        enfermedad:
            enfermedad,

        enfermedadNombre:
            obtenerNombreEnfermedad(
                enfermedad
            ),

        severidad:
            severidad,

        severidadNombre:
            obtenerNombreSeveridad(
                severidad
            ),

        reporte:
            limpiarTextoOpcional(
                body.reporte
            ),
    };
}

export function normalizarFiltrosEnfermedad(
    query,
    grupoDatos
) {
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
        grupoDatos:
            normalizarEntero(
                grupoDatos
            ),

        fincaId:
            normalizarEnteroOpcional(
                query.fincaId
            ),

        estanqueId:
            normalizarEnteroOpcional(
                query.estanqueId
            ),

        enfermedad:
            normalizarEnfermedad(
                query.enfermedad
            ),

        severidad:
            normalizarSeveridad(
                query.severidad
            ),

        fechaReporte:
            limpiarTextoOpcional(
                query.fechaReporte
            ),
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

    validarEnteroMayorCero(
        datos.grupoDatos,
        'grupoDatos',
        errores
    );

    validarEnteroMayorCero(
        datos.fincaId,
        'fincaId',
        errores
    );

    validarEnteroMayorCero(
        datos.estanqueId,
        'estanqueId',
        errores
    );

    validarFechaReporte(
        datos.fechaReporte,
        errores
    );

    validarEnfermedad(
        datos.enfermedad,
        errores
    );

    validarSeveridad(
        datos.severidad,
        errores
    );

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

    validarEnteroMayorCero(
        filtros.grupoDatos,
        'grupoDatos',
        errores
    );

    if (filtros.fincaId !== null) {
        validarEnteroMayorCero(
            filtros.fincaId,
            'fincaId',
            errores
        );
    }

    if (filtros.estanqueId !== null) {
        validarEnteroMayorCero(
            filtros.estanqueId,
            'estanqueId',
            errores
        );
    }

    if (
        !isEmpty(filtros.fechaReporte) &&
        !isFechaValida(filtros.fechaReporte)
    ) {
        errores.push(
            'El campo fechaReporte debe tener formato yyyy-mm-dd.'
        );
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

    for (
        let i = 0;
        i < catalogoEnfermedades.length;
        i++
    ) {
        if (
            catalogoEnfermedades[i].value ===
            enfermedad
        ) {
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

    for (
        let i = 0;
        i < catalogoSeveridades.length;
        i++
    ) {
        if (
            catalogoSeveridades[i].value ===
            severidad
        ) {
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
        totalRegistros:
            registros.length,
        enfermedadesFrecuentes: [],
        severidadesFrecuentes: [],
    };

    const contadorEnfermedades = {};
    const contadorSeveridades = {};

    for (
        let i = 0;
        i < registros.length;
        i++
    ) {
        const registro =
            registros[i];

        contarValor(
            contadorEnfermedades,
            registro.enfermedad
        );

        contarValor(
            contadorSeveridades,
            registro.severidad
        );
    }

    resumen.enfermedadesFrecuentes =
        construirListaEnfermedades(
            contadorEnfermedades
        );

    resumen.severidadesFrecuentes =
        construirListaSeveridades(
            contadorSeveridades
        );

    return resumen;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas usadas para normalizar, validar y
construir resumenes.
*/

function isFechaValida(fecha) {
    /*
    Descripcion:
    Valida que una fecha tenga el formato yyyy-mm-dd
    y corresponda a una fecha real del calendario.

    Parametros:
    - fecha: Fecha a validar.

    Retorna:
    - true si la fecha es valida.
    - false si no es valida.
    */

    if (isEmpty(fecha)) {
        return false;
    }

    const fechaTexto =
        String(fecha).trim();

    const patronIso =
        /^\d{4}-\d{2}-\d{2}$/;

    if (
        patronIso.test(fechaTexto) === false
    ) {
        return false;
    }

    const partes =
        fechaTexto.split('-');

    const anio =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    const dia =
        Number(partes[2]);

    const fechaValidar =
        new Date(
            anio,
            mes - 1,
            dia
        );

    if (
        fechaValidar.getFullYear() !== anio ||
        fechaValidar.getMonth() !== mes - 1 ||
        fechaValidar.getDate() !== dia
    ) {
        return false;
    }

    return true;
}

function isFechaFutura(fecha) {
    /*
    Descripcion:
    Determina si una fecha valida es posterior al dia
    actual segun la fecha configurada en el servidor.

    Parametros:
    - fecha: Fecha en formato yyyy-mm-dd.

    Retorna:
    - true si la fecha es futura.
    - false si corresponde a hoy o una fecha anterior.
    */

    if (
        isFechaValida(fecha) === false
    ) {
        return false;
    }

    const partes =
        String(fecha)
            .trim()
            .split('-');

    const fechaReporte =
        new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

    const ahora =
        new Date();

    const fechaServidor =
        new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );

    return (
        fechaReporte >
        fechaServidor
    );
}

function normalizarEnfermedad(enfermedad) {
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

    const texto =
        String(enfermedad).trim();

    const codigo =
        texto.toLowerCase();

    if (
        texto === TipoEnfermedad.WSSV ||
        codigo === 'wssv'
    ) {
        return TipoEnfermedad.WSSV;
    }

    if (
        texto === TipoEnfermedad.AHPND ||
        codigo === 'ahpnd'
    ) {
        return TipoEnfermedad.AHPND;
    }

    if (
        texto === TipoEnfermedad.VIBRIOSIS ||
        codigo === 'vibriosis'
    ) {
        return TipoEnfermedad.VIBRIOSIS;
    }

    if (
        texto === TipoEnfermedad.IHHNV ||
        codigo === 'ihhnv'
    ) {
        return TipoEnfermedad.IHHNV;
    }

    if (
        texto === TipoEnfermedad.NHP ||
        codigo === 'nhp'
    ) {
        return TipoEnfermedad.NHP;
    }

    if (
        texto === TipoEnfermedad.OTRO ||
        codigo === 'otro'
    ) {
        return TipoEnfermedad.OTRO;
    }

    return '';
}

function normalizarSeveridad(severidad) {
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

    const texto =
        String(severidad)
            .trim()
            .toLowerCase();

    if (
        texto === 'bajo' ||
        texto === 'baja'
    ) {
        return SeveridadEnfermedad.BAJO;
    }

    if (
        texto === 'medio' ||
        texto === 'media'
    ) {
        return SeveridadEnfermedad.MEDIO;
    }

    if (
        texto === 'alto' ||
        texto === 'alta'
    ) {
        return SeveridadEnfermedad.ALTO;
    }

    if (
        texto === 'critica' ||
        texto === 'crítica'
    ) {
        return SeveridadEnfermedad.CRITICA;
    }

    return '';
}

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

    if (
        String(valor)
            .trim()
            .length === 0
    ) {
        return null;
    }

    return String(
        valor
    ).trim();
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

    return Number(
        valor
    );
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

    if (
        String(valor)
            .trim()
            .length === 0
    ) {
        return null;
    }

    return Number(
        valor
    );
}

function validarEnteroMayorCero(
    valor,
    campo,
    errores
) {
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

    if (
        Number.isNaN(
            Number(valor)
        )
    ) {
        errores.push(
            'El campo ' +
            campo +
            ' debe ser numerico.'
        );

        return;
    }

    if (
        Number(valor) <= 0
    ) {
        errores.push(
            'El campo ' +
            campo +
            ' debe ser mayor que cero.'
        );
    }
}

function validarFechaReporte(
    fechaReporte,
    errores
) {
    /*
    Descripcion:
    Valida la fecha de reporte.
    Permite la fecha actual y fechas anteriores.
    No permite registrar fechas futuras.

    Parametros:
    - fechaReporte: Fecha recibida.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (isEmpty(fechaReporte)) {
        errores.push(
            'El campo fechaReporte es requerido.'
        );

        return;
    }

    if (
        !isFechaValida(
            fechaReporte
        )
    ) {
        errores.push(
            'El campo fechaReporte debe tener formato yyyy-mm-dd.'
        );

        return;
    }

    if (
        isFechaFutura(
            fechaReporte
        )
    ) {
        errores.push(
            'El campo fechaReporte no puede ser una fecha futura.'
        );
    }
}

function validarEnfermedad(
    enfermedad,
    errores
) {
    /*
    Descripcion:
    Valida la enfermedad.

    Parametros:
    - enfermedad: Enfermedad recibida.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (
        isEmpty(
            enfermedad
        )
    ) {
        errores.push(
            'El campo enfermedad no es valido.'
        );
    }
}

function validarSeveridad(
    severidad,
    errores
) {
    /*
    Descripcion:
    Valida la severidad.

    Parametros:
    - severidad: Severidad recibida.
    - errores: Lista donde se agregan los errores.

    Retorna:
    No retorna valor.
    */

    if (
        isEmpty(
            severidad
        )
    ) {
        errores.push(
            'El campo severidad no es valido.'
        );
    }
}

function contarValor(
    contador,
    valor
) {
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

    if (
        contador[valor] ===
        undefined
    ) {
        contador[valor] = 0;
    }

    contador[valor] =
        contador[valor] + 1;
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

    const claves =
        Object.keys(
            contador
        );

    for (
        let i = 0;
        i < claves.length;
        i++
    ) {
        const clave =
            claves[i];

        lista.push({
            valor:
                clave,

            nombre:
                obtenerNombreEnfermedad(
                    clave
                ),

            cantidad:
                contador[clave],
        });
    }

    lista.sort(
        function (a, b) {
            return (
                b.cantidad -
                a.cantidad
            );
        }
    );

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

    const claves =
        Object.keys(
            contador
        );

    for (
        let i = 0;
        i < claves.length;
        i++
    ) {
        const clave =
            claves[i];

        lista.push({
            valor:
                clave,

            nombre:
                obtenerNombreSeveridad(
                    clave
                ),

            cantidad:
                contador[clave],
        });
    }

    lista.sort(
        function (a, b) {
            return (
                b.cantidad -
                a.cantidad
            );
        }
    );

    return lista;
}