import { validarString, validarNumero } from "../utils/validaciones.js";

export const validarCrearIncidencia = (data) => {
  const { aula_id, descripcion, tipo } = data;

  // Validar aula_id
  const validacionAula = validarNumero(aula_id, "aula_id");
  if (!validacionAula.valido) {
    return validacionAula;
  }

  // Validar descripción
  const validacionDescripcion = validarString(descripcion, "Descripción");
  if (!validacionDescripcion.valido) {
    return validacionDescripcion;
  }

  if (descripcion.length < 10) {
    return {
      valido: false,
      mensaje: "La descripción debe tener al menos 10 caracteres",
    };
  }

  // Validar tipo (opcional pero si viene debe ser válido)
  const tiposValidos = ["electrica", "informatica", "estructural", "limpieza", "otro"];
  if (tipo && !tiposValidos.includes(tipo)) {
    return {
      valido: false,
      mensaje: `Tipo debe ser uno de: ${tiposValidos.join(", ")}`,
    };
  }

  return { valido: true };
};