import { validarNumero, validarString } from "../utils/validaciones.js";

export const validarCrearReserva = (data) => {
  const { usuario_id, aula_id, fecha, hora_inicio, hora_fin } = data;

  // Validar usuario_id
  const validacionUsuario = validarNumero(usuario_id, "usuario_id");
  if (!validacionUsuario.valido) {
    return validacionUsuario;
  }

  // Validar aula_id
  const validacionAula = validarNumero(aula_id, "aula_id");
  if (!validacionAula.valido) {
    return validacionAula;
  }

  // Validar fecha (formato YYYY-MM-DD)
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return {
      valido: false,
      mensaje: "Fecha debe estar en formato YYYY-MM-DD",
    };
  }

  // Validar que la fecha no sea en el pasado
  const fechaReserva = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaReserva < hoy) {
    return {
      valido: false,
      mensaje: "No puedes reservar en fechas pasadas",
    };
  }

  // Validar horarios (formato HH:MM)
  if (!hora_inicio || !/^\d{2}:\d{2}$/.test(hora_inicio)) {
    return {
      valido: false,
      mensaje: "hora_inicio debe estar en formato HH:MM",
    };
  }

  if (!hora_fin || !/^\d{2}:\d{2}$/.test(hora_fin)) {
    return {
      valido: false,
      mensaje: "hora_fin debe estar en formato HH:MM",
    };
  }

  // Validar que hora_fin sea después de hora_inicio
  if (hora_fin <= hora_inicio) {
    return {
      valido: false,
      mensaje: "La hora de fin debe ser después de la hora de inicio",
    };
  }

  return { valido: true };
};