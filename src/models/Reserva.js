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

   // Obtener disponibilidad de un aula en una fecha
  static async obtenerDisponibilidad(aula_id, fecha) {
    try {
      // Generar horarios de funcionamiento: 8:00 a 21:00, intervalos de 1.5 horas
      const horarios = this.generarHorarios();

      // Obtener reservas confirmadas de esa aula en esa fecha
      const reservas = await this.obtenerPorAulaYFecha(aula_id, fecha);

      // Separar horarios libres y ocupados
      const horariosLibres = [];
      const horariosOcupados = [];

      horarios.forEach((horario) => {
        const { hora_inicio, hora_fin } = horario;

        // Verificar si este horario se superpone con alguna reserva
        const ocupado = reservas.some((reserva) => {
          return (
            hora_inicio < reserva.hora_fin &&
            hora_fin > reserva.hora_inicio
          );
        });

        if (ocupado) {
          horariosOcupados.push(horario);
        } else {
          horariosLibres.push(horario);
        }
      });

      return {
        aula_id,
        fecha,
        horariosLibres,
        horariosOcupados,
        totalLibres: horariosLibres.length,
        totalOcupados: horariosOcupados.length,
      };
    } catch (error) {
      throw new Error(`Error al obtener disponibilidad: ${error.message}`);
    }
  }

  // Generar array de horarios disponibles (8:00 a 21:00, intervalos de 1.5 horas)
  static generarHorarios() {
    const horarios = [];
    let horaActual = new Date();
    horaActual.setHours(8, 0, 0, 0); // Empezar a las 8:00

    const horaFinal = new Date();
    horaFinal.setHours(21, 0, 0, 0); // Terminar a las 21:00

    while (horaActual < horaFinal) {
      const hora_inicio = this.formatoHora(horaActual);

      // Sumar 1.5 horas
      horaActual.setMinutes(horaActual.getMinutes() + 90);

      const hora_fin = this.formatoHora(horaActual);

      // No agregar si la hora final supera las 21:00
      if (horaActual <= horaFinal) {
        horarios.push({
          hora_inicio,
          hora_fin,
        });
      }
    }

    return horarios;
  }

  // Formatear hora a HH:MM
  static formatoHora(date) {
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }
}