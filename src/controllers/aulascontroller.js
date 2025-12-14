import { Aula } from "../models/Aula.js";
import { validarCrearAula } from "../validators/aulasValidator.js";
import { pool } from "../config/db.js";

// GET: Obtener todas las aulas
export const obtenerAulas = async (req, res) => {
  try {
    const aulas = await Aula.obtenerTodas();
    res.json(aulas);
  } catch (error) {
    console.error("Error obteniendo aulas:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// GET: Obtener aula por ID
export const obtenerAulaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const aula = await Aula.obtenerPorId(id);

    if (!aula) {
      return res.status(404).json({ mensaje: "Aula no encontrada" });
    }

    res.json(aula);
  } catch (error) {
    console.error("Error obteniendo aula:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// POST: Crear aula (solo admin)
export const crearAula = async (req, res) => {
  try {
    const { nombre, capacidad, ubicacion, codigo_qr } = req.body;

    // Validar
    const validacion = validarCrearAula({ nombre, capacidad, ubicacion, codigo_qr });
    if (!validacion.valido) {
      return res.status(400).json({ mensaje: validacion.mensaje });
    }

    // Verificar que no existe aula con ese nombre
    const [aulasExistentes] = await pool.query(
      "SELECT id FROM aulas WHERE nombre = ?",
      [nombre]
    );

    if (aulasExistentes.length > 0) {
      return res.status(400).json({ mensaje: "❌ Ya existe un aula con ese nombre" });
    }

    const aula = await Aula.crear(nombre, capacidad, ubicacion, codigo_qr);

    res.status(201).json({
      mensaje: "✅ Aula creada correctamente",
      aula,
    });
  } catch (error) {
    console.error("Error creando aula:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// DELETE: Eliminar aula (solo admin)
export const eliminarAula = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const aula = await Aula.obtenerPorId(id);
    if (!aula) {
      return res.status(404).json({ mensaje: "Aula no encontrada" });
    }

    // ← NUEVO: Verificar que no tiene reservas
    const [reservas] = await pool.query(
      "SELECT COUNT(*) as count FROM reservas WHERE aula_id = ? AND estado = 'confirmada'",
      [id]
    );

    if (reservas[0].count > 0) {
      return res.status(400).json({
        mensaje: `❌ No se puede eliminar. El aula tiene ${reservas[0].count} reserva(s) confirmada(s)`,
      });
    }

    await Aula.eliminar(id);

    res.json({
      mensaje: "✅ Aula eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando aula:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// PUT: Actualizar aula (solo admin)
export const actualizarAula = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, capacidad, ubicacion, codigo_qr, estado } = req.body;

    const aula = await Aula.obtenerPorId(id);
    if (!aula) {
      return res.status(404).json({ mensaje: "Aula no encontrada" });
    }

    // Si el estado cambia a "mantenimiento", cancelar reservas
    let reservasCanceladas = 0;
    if (estado === "mantenimiento" && aula.estado !== "mantenimiento") {
      const [result] = await pool.query(
        "UPDATE reservas SET estado = 'cancelada' WHERE aula_id = ? AND estado = 'confirmada'",
        [id]
      );
      reservasCanceladas = result.affectedRows;
    }

    // Actualizar en BD
    const [result] = await pool.query(
      "UPDATE aulas SET nombre = ?, capacidad = ?, ubicacion = ?, codigo_qr = ?, estado = ? WHERE id = ?",
      [nombre || aula.nombre, capacidad || aula.capacidad, ubicacion || aula.ubicacion, codigo_qr || aula.codigo_qr, estado || aula.estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ mensaje: "No se pudo actualizar el aula" });
    }

    const aulasActualizada = await Aula.obtenerPorId(id);

    res.json({
      mensaje: reservasCanceladas > 0 
        ? `✅ Aula actualizada. ${reservasCanceladas} reserva(s) cancelada(s)`
        : "✅ Aula actualizada correctamente",
      aula: aulasActualizada,
    });
  } catch (error) {
    console.error("Error actualizando aula:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};