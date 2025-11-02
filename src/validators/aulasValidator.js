import { validarString, validarNumero } from "../utils/validaciones.js";

export const validarCrearAula = (data) => {
  const { nombre, capacidad, ubicacion, codigo_qr } = data;

  // Validar nombre
  const validacionNombre = validarString(nombre, "Nombre del aula");
  if (!validacionNombre.valido) {
    return validacionNombre;
  }

  // Validar capacidad
  const validacionCapacidad = validarNumero(capacidad, "Capacidad");
  if (!validacionCapacidad.valido) {
    return validacionCapacidad;
  }

  // Ubicación es opcional, pero si viene debe ser string
  if (ubicacion && typeof ubicacion !== "string") {
    return { valido: false, mensaje: "Ubicación debe ser texto" };
  }

  return { valido: true };
};