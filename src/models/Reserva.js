import { pool } from "../config/db.js";

export class Reserva {
  // Crear nueva reserva
  static async crear(usuario_id, aula_id, fecha, hora_inicio, hora_fin) {
    try {
      const [result] = await pool.query(
        "INSERT INTO reservas (usuario_id, aula_id, fecha, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)",
        [usuario_id, aula_id, fecha, hora_inicio, hora_fin]
      );

      return {
        id: result.insertId,
        usuario_id,
        aula_id,
        fecha,
        hora_inicio,
        hora_fin,
        estado: "confirmada",
      };
    } catch (error) {
      throw new Error(`Error al crear reserva: ${error.message}`);
    }
  }

  // Obtener todas las reservas
  static async obtenerTodas() {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, u.nombre as usuario_nombre, a.nombre as aula_nombre 
         FROM reservas r
         JOIN usuarios u ON r.usuario_id = u.id
         JOIN aulas a ON r.aula_id = a.id
         ORDER BY r.fecha DESC`
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener reservas: ${error.message}`);
    }
  }

  // Obtener reservas de un usuario
  static async obtenerPorUsuario(usuario_id) {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, a.nombre as aula_nombre 
         FROM reservas r
         JOIN aulas a ON r.aula_id = a.id
         WHERE r.usuario_id = ?
         ORDER BY r.fecha DESC`,
        [usuario_id]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener reservas del usuario: ${error.message}`);
    }
  }

  // Obtener reservas de un aula en una fecha
  static async obtenerPorAulaYFecha(aula_id, fecha) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM reservas 
         WHERE aula_id = ? AND fecha = ? AND estado = 'confirmada'`,
        [aula_id, fecha]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener reservas: ${error.message}`);
    }
  }

  // Verificar si hay solapamiento de horarios
  static async verificarSolapamiento(
    aula_id,
    fecha,
    hora_inicio,
    hora_fin,
    reserva_id = null
  ) {
    try {
      let query = `SELECT * FROM reservas 
                   WHERE aula_id = ? 
                   AND fecha = ? 
                   AND estado = 'confirmada'
                   AND ((hora_inicio < ? AND hora_fin > ?)
                        OR (hora_inicio < ? AND hora_fin > ?))`;

      const params = [
        aula_id,
        fecha,
        hora_fin,
        hora_inicio,
        hora_fin,
        hora_inicio,
      ];

      if (reserva_id) {
        query += ` AND id != ?`;
        params.push(reserva_id);
      }

      const [rows] = await pool.query(query, params);
      return rows.length > 0; // true si hay solapamiento
    } catch (error) {
      throw new Error(`Error verificando solapamiento: ${error.message}`);
    }
  }

  // Cancelar reserva
  static async cancelar(id) {
    try {
      const [result] = await pool.query(
        "UPDATE reservas SET estado = 'cancelada' WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al cancelar reserva: ${error.message}`);
    }
  }

  // Obtener reserva por ID
  static async obtenerPorId(id) {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, u.nombre as usuario_nombre, a.nombre as aula_nombre 
         FROM reservas r
         JOIN usuarios u ON r.usuario_id = u.id
         JOIN aulas a ON r.aula_id = a.id
         WHERE r.id = ?`,
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener reserva: ${error.message}`);
    }
  }
}