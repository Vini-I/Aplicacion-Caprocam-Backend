/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantFinca.middleware.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Finca
Descripcion:
Archivo de middleware para el modulo de finca.
Se encarga de validar los datos recibidos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarMantFinca(req, res, next) {
  /*
    Descripcion:
    Valida los datos recibidos para la creacion o actualizacion de un registro de finca.

    Parametros:
    - req: Objeto de solicitud HTTP.
    - res: Objeto de respuesta HTTP.
    - next: Funcion para pasar al siguiente middleware.

    Retorna:
    - Llama a next() si los datos son validos.
    - Retorna un error si los datos son invalidos.
    */
  
  if (req.user && req.user.grupoDatos) {
    req.body.grupoDatos = req.user.grupoDatos;
  }

  const {
    grupoDatos,
    idCBO,
    nombreFinca,
    provincia,
    canton,
    distrito,
    otrasSenas,
    propietarioResponsable,
    telefono,
    areaTotal,
    espejosAgua,
  } = req.body;

  if (!grupoDatos) {
    return error(res, "El grupo de datos es obligatorio.", null, 400);
  }

  if (!idCBO || String(idCBO).trim() === "") {
    return error(res, "El ID CBO es obligatorio.", null, 400);
  }

  if (!nombreFinca || String(nombreFinca).trim() === "") {
    return error(res, "El nombre de la finca es obligatorio.", null, 400);
  }

  if (!provincia || String(provincia).trim() === "") {
    return error(res, "La provincia es obligatoria.", null, 400);
  }

  if (!canton || String(canton).trim() === "") {
    return error(res, "El cantón es obligatorio.", null, 400);
  }

  if (!distrito || String(distrito).trim() === "") {
    return error(res, "El distrito es obligatorio.", null, 400);
  }

  if (!otrasSenas || String(otrasSenas).trim() === "") {
    return error(res, "Las otras señas son obligatorias.", null, 400);
  }

  if (!propietarioResponsable || String(propietarioResponsable).trim() === "") {
    return error(res, "El propietario responsable es obligatorio.", null, 400);
  }

  if (!telefono || String(telefono).trim() === "") {
    return error(res, "El teléfono es obligatorio.", null, 400);
  }

  if (areaTotal === undefined || isNaN(areaTotal) || Number(areaTotal) <= 0) {
    return error(res, "El área total debe ser mayor que cero.", null, 400);
  }

  if (
    espejosAgua === undefined ||
    isNaN(espejosAgua) ||
    Number(espejosAgua) <= 0
  ) {
    return error(
      res,
      "El área de espejos de agua debe ser mayor que cero.",
      null,
      400,
    );
  }

  next();
}