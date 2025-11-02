import { Incidencia } from "../models/Incidencia.js";
import { validarCrearIncidencia } from "../validators/incidenciasValidator.js";

// Crear incidencia
export const crearIncidencia = async (req, res) => {
  try {
    const { aula_id, descripcion, tipo } = req.body;
    const usuario_id = req.usuario.id;

    // Validar datos
    const validacion = validarCrearIncidencia({
      aula_id,
      descripcion,
      tipo,
    });

    if (!validacion.valido) {
      return res.status(400).json({ mensaje: validacion.mensaje });
    }

    // Crear incidencia
    const nuevaIncidencia = await Incidencia.crear(
      aula_id,
      usuario_id,
      descripcion,
      tipo
    );

    res.status(201).json({
      mensaje: "✅ Incidencia reportada correctamente",
      incidencia: nuevaIncidencia,
    });
  } catch (error) {
    console.error("Error en crearIncidencia:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener todas las incidencias
export const obtenerIncidencias = async (req, res) => {
  try {
    const incidencias = await Incidencia.obtenerTodas();
    res.json(incidencias);
  } catch (error) {
    console.error("Error en obtenerIncidencias:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener incidencias de un aula
export const obtenerIncidenciasAula = async (req, res) => {
  try {
    const { aula_id } = req.params;
    const incidencias = await Incidencia.obtenerPorAula(aula_id);
    res.json(incidencias);
  } catch (error) {
    console.error("Error en obtenerIncidenciasAula:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener incidencia por ID
export const obtenerIncidenciaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const incidencia = await Incidencia.obtenerPorId(id);

    if (!incidencia) {
      return res.status(404).json({ mensaje: "Incidencia no encontrada" });
    }

    res.json(incidencia);
  } catch (error) {
    console.error("Error en obtenerIncidenciaPorId:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Actualizar estado (solo admin)
export const actualizarEstadoIncidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ["pendiente", "en_revision", "resuelta"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: `Estado debe ser uno de: ${estadosValidos.join(", ")}`,
      });
    }

    // Verificar que sea admin
    if (req.usuario.rol !== "administrador") {
      return res
        .status(403)
        .json({ mensaje: "Solo administradores pueden actualizar incidencias" });
    }

    const actualizado = await Incidencia.actualizarEstado(id, estado);

    if (actualizado) {
      res.json({
        mensaje: "✅ Estado de incidencia actualizado",
        nuevo_estado: estado,
      });
    } else {
      res.status(404).json({ mensaje: "Incidencia no encontrada" });
    }
  } catch (error) {
    console.error("Error en actualizarEstadoIncidencia:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};