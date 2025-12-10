import { Reserva } from "../models/Reserva.js";
import { validarCrearReserva } from "../validators/reservasValidator.js";
import { pool } from "../config/db.js";

// Crear nueva reserva
export const crearReserva = async (req, res) => {
  try {
    const { usuario_id, aula_id, fecha, hora_inicio, hora_fin } = req.body;

    // Asegurar que fecha es YYYY-MM-DD sin UTC
    // Validar que sea string en formato correcto
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({
        mensaje: "Fecha debe estar en formato YYYY-MM-DD",
      });
    }

    // Validar datos
    const validacion = validarCrearReserva({
      usuario_id,
      aula_id,
      fecha,
      hora_inicio,
      hora_fin,
    });

    if (!validacion.valido) {
      return res.status(400).json({ mensaje: validacion.mensaje });
    }

    // Verificar solapamiento de horarios ( por aula)
    const hay_solapamiento = await Reserva.verificarSolapamiento(
      aula_id,
      fecha,
      hora_inicio,
      hora_fin
    );

    if (hay_solapamiento) {
      return res.status(400).json({
        mensaje: "Ya existe una reserva en ese horario para esta aula",
      });
    }

    // Verificar que el profesor no tenga otra reserva
    const hay_solapamiento_usuario = await Reserva.verificarSolapamientoUsuario(
      usuario_id,
      fecha,
      hora_inicio,
      hora_fin
    );

    if (hay_solapamiento_usuario) {
      return res.status(400).json({
        mensaje: "❌ Ya tienes una reserva en otra aula en este horario",
      });
    }

    // Crear reserva
    const nuevaReserva = await Reserva.crear(
      usuario_id,
      aula_id,
      fecha,
      hora_inicio,
      hora_fin
    );

    res.status(201).json({
      mensaje: "✅ Reserva creada correctamente",
      reserva: nuevaReserva,
    });
  } catch (error) {
    console.error("Error en crearReserva:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener todas las reservas
export const obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.obtenerTodas();
    res.json(reservas);
  } catch (error) {
    console.error("Error en obtenerReservas:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener reservas del usuario autenticado
export const obtenerMisReservas = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const reservas = await Reserva.obtenerPorUsuario(usuario_id);
    res.json(reservas);
  } catch (error) {
    console.error("Error en obtenerMisReservas:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Cancelar reserva
export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    // Obtener reserva
    const reserva = await Reserva.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    // Verificar que el usuario sea el dueño o sea admin
    if (
      reserva.usuario_id !== usuario_id &&
      req.usuario.rol !== "administrador"
    ) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para cancelar esta reserva" });
    }

    // Cancelar
    const cancelado = await Reserva.cancelar(id);

    if (cancelado) {
      res.json({ mensaje: "✅ Reserva cancelada correctamente" });
    } else {
      res.status(400).json({ mensaje: "No se pudo cancelar la reserva" });
    }
  } catch (error) {
    console.error("Error en cancelarReserva:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// GET: Obtener TODAS las reservas (solo admin)
export const obtenerTodasReservas = async (req, res) => {
  try {
    const [reservas] = await pool.query(`
      SELECT r.*, a.nombre as aula_nombre, u.nombre as usuario_nombre 
      FROM reservas r
      JOIN aulas a ON r.aula_id = a.id
      JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.fecha DESC, r.hora_inicio ASC
    `);
    
    res.json(reservas);
  } catch (error) {
    console.error("Error obteniendo reservas:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener reserva por ID
export const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    res.json(reserva);
  } catch (error) {
    console.error("Error en obtenerReservaPorId:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener reservas de un usuario específico (solo admin)
export const obtenerReservasPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const reservas = await Reserva.obtenerPorUsuario(usuario_id);
    res.json(reservas);
  } catch (error) {
    console.error("Error obteniendo reservas del usuario:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener disponibilidad de un aula en una fecha
export const obtenerDisponibilidad = async (req, res) => {
  try {
    const { aula_id, fecha } = req.query;

    // Validar parámetros
    if (!aula_id || !fecha) {
      return res.status(400).json({
        mensaje: "Parámetros requeridos: aula_id y fecha (YYYY-MM-DD)",
      });
    }

    // Validar que aula_id sea número
    if (isNaN(aula_id)) {
      return res.status(400).json({
        mensaje: "aula_id debe ser un número",
      });
    }

    // Importar validaciones de festivos
    const { validarFechaReserva } = await import("../utils/festivos.js");

    // Validar fecha (no pasada, no domingo, no festivo)
    const validacion = await validarFechaReserva(fecha);
    if (!validacion.valido) {
      return res.status(400).json({
        mensaje: validacion.mensaje,
      });
    }

    // Obtener disponibilidad
    const disponibilidad = await Reserva.obtenerDisponibilidad(
      parseInt(aula_id),
      fecha
    );

    res.json({
      mensaje: "✅ Disponibilidad obtenida correctamente",
      disponibilidad,
    });
  } catch (error) {
    console.error("Error en obtenerDisponibilidad:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// ============================================
// NUEVO: Traspasar reserva a otra aula (solo admin)
// ============================================
export const traspasoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { aula_id } = req.body;

    // Validar que la reserva existe
    const reserva = await Reserva.obtenerPorId(id);
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }

    // Validar que la nueva aula_id se proporciona
    if (!aula_id || aula_id === reserva.aula_id) {
      return res.status(400).json({
        mensaje: "Debe proporcionar una aula_id diferente a la actual",
      });
    }

    // NUEVO: Verificar que NO hay solapamiento en la nueva aula
    const hay_solapamiento = await Reserva.verificarSolapamiento(
      aula_id,
      reserva.fecha,
      reserva.hora_inicio,
      reserva.hora_fin,
      id // Excluir esta reserva del chequeo
    );

    if (hay_solapamiento) {
      return res.status(400).json({
        mensaje:
          "❌ La nueva aula tiene una reserva en ese horario. Elige otra aula u horario",
      });
    }

    // NUEVO: Traspasar la reserva
    const reservaTraspasada = await Reserva.traspasar(id, aula_id);

    res.json({
      mensaje: "✅ Reserva traspasada correctamente",
      reserva: reservaTraspasada,
    });
  } catch (error) {
    console.error("Error en traspasoReserva:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};
