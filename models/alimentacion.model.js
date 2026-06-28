export default class Alimentacion {
  constructor({
    id,
    fecha,
    hora,
    finca,
    estanque,
    tipo,
    presentacion,
    metodo,
    cantidad,
    proveedor,
    notas,
  }) {
    this.id = id;
    this.fecha = fecha;
    this.hora = hora;
    this.finca = finca;
    this.estanque = estanque;
    this.tipo = tipo;
    this.presentacion = presentacion;
    this.metodo = metodo;
    this.cantidad = cantidad;
    this.proveedor = proveedor;
    this.notas = notas;
  }
}

export const alimentacionDB = [];