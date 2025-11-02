import { pool } from "../config/db.js";

export class Incidencia {
  // Crear incidencia
  static async crear(aula_id, usuario_id, descripcion, tipo) {
    try {
      const [result] = await pool.query(
        "INSERT INTO incidencias (aula_id, usuario_id, descripcion, tipo) VALUES (?, ?, ?, ?)",
        [aula_id, usuario_id, descripcion, tipo]
      );

      return {
        id: result.insertId,
        aula_id,
        usuario_id,
        descripcion,
        tipo,
        estado: "pendiente",
      };
    } catch (error) {
      throw new Error(`Error al crear incidencia: ${error.message}`);
    }
  }

  // Obtener todas las incidencias
  static async obtenerTodas() {
    try {
      const [rows] = await pool.query(
        `SELECT i.*, a.nombre as aula_nombre, u.nombre as usuario_nombre
         FROM incidencias i
         JOIN aulas a ON i.aula_id = a.id
         JOIN usuarios u ON i.usuario_id = u.id
         ORDER BY i.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener incidencias: ${error.message}`);
    }
  }

  // Obtener incidencias de un aula
  static async obtenerPorAula(aula_id) {
    try {
      const [rows] = await pool.query(
        `SELECT i.*, u.nombre as usuario_nombre
         FROM incidencias i
         JOIN usuarios u ON i.usuario_id = u.id
         WHERE i.aula_id = ?
         ORDER BY i.created_at DESC`,
        [aula_id]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener incidencias: ${error.message}`);
    }
  }

  // Obtener incidencia por ID
  static async obtenerPorId(id) {
    try {
      const [rows] = await pool.query(
        `SELECT i.*, a.nombre as aula_nombre, u.nombre as usuario_nombre
         FROM incidencias i
         JOIN aulas a ON i.aula_id = a.id
         JOIN usuarios u ON i.usuario_id = u.id
         WHERE i.id = ?`,
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener incidencia: ${error.message}`);
    }
  }

  // Actualizar estado
  static async actualizarEstado(id, estado) {
    try {
      const [result] = await pool.query(
        "UPDATE incidencias SET estado = ? WHERE id = ?",
        [estado, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar incidencia: ${error.message}`);
    }
  }

  // Eliminar incidencia
  static async eliminar(id) {
    try {
      const [result] = await pool.query(
        "DELETE FROM incidencias WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar incidencia: ${error.message}`);
    }
  }
}