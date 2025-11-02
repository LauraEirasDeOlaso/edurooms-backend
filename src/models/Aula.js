import { pool } from "../config/db.js";

export class Aula {
  // Crear nueva aula
  static async crear(nombre, capacidad, ubicacion, codigo_qr) {
    try {
      const [result] = await pool.query(
        "INSERT INTO aulas (nombre, capacidad, ubicacion, codigo_qr) VALUES (?, ?, ?, ?)",
        [nombre, capacidad, ubicacion, codigo_qr]
      );

      return {
        id: result.insertId,
        nombre,
        capacidad,
        ubicacion,
        codigo_qr,
        estado: "disponible",
      };
    } catch (error) {
      throw new Error(`Error al crear aula: ${error.message}`);
    }
  }

  // Obtener todas las aulas
  static async obtenerTodas() {
    try {
      const [rows] = await pool.query("SELECT * FROM aulas");
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener aulas: ${error.message}`);
    }
  }

  // Obtener aula por ID
  static async obtenerPorId(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM aulas WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener aula: ${error.message}`);
    }
  }

  // Actualizar estado del aula
  static async actualizarEstado(id, estado) {
    try {
      const [result] = await pool.query(
        "UPDATE aulas SET estado = ? WHERE id = ?",
        [estado, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar aula: ${error.message}`);
    }
  }

  // Eliminar aula
  static async eliminar(id) {
    try {
      const [result] = await pool.query("DELETE FROM aulas WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar aula: ${error.message}`);
    }
  }
}