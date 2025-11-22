import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

export class Usuario {
  // Crear nuevo usuario
  static async crear(nombre, email, password, rol = "profesor") {
    try {
      // Hashear contraseña
      const passwordHash = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
        [nombre, email, passwordHash, rol]
      );

      return {
        id: result.insertId,
        nombre,
        email,
        rol,
      };
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Buscar usuario por email
  static async buscarPorEmail(email) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  // Buscar usuario por ID
  static async buscarPorId(id) {
    try {
      const [rows] = await pool.query(
        "SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?",
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  // Obtener todos los usuarios
  static async obtenerTodos() {
    try {
      const [rows] = await pool.query(
        "SELECT id, nombre, email, rol, created_at FROM usuarios"
      );

      return rows;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // Verificar contraseña
  static async verificarPassword(passwordIngresada, passwordHash) {
    try {
      return await bcrypt.compare(passwordIngresada, passwordHash);
    } catch (error) {
      throw new Error(`Error al verificar contraseña: ${error.message}`);
    }
  }

  // ============================================
  // NUEVO: Actualizar usuario (rol, estado, etc)
  // ============================================
  static async actualizar(id, datos) {
    try {
      // Construir dinámicamente la query según qué se actualiza
      const actualizaciones = [];
      const valores = [];

      if (datos.rol) {
        actualizaciones.push("rol = ?");
        valores.push(datos.rol);
      }

      if (datos.estado) {
        actualizaciones.push("estado = ?");
        valores.push(datos.estado);
      }

      if (actualizaciones.length === 0) {
        throw new Error("No hay datos para actualizar");
      }

      valores.push(id); // Agregar ID al final para WHERE

      const query = `UPDATE usuarios SET ${actualizaciones.join(", ")} WHERE id = ?`;

      const [result] = await pool.query(query, valores);

      if (result.affectedRows === 0) {
        throw new Error("Usuario no encontrado");
      }

      // Retornar usuario actualizado
      return await this.buscarPorId(id);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // ============================================
  // NUEVO: Eliminar usuario
  // ============================================
  static async eliminar(id) {
    try {
      const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [
        id,
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
  // ============================================
  // NUEVO: Cambiar contraseña del usuario
  // ============================================
  static async cambiarPassword(id, nuevaPassword) {
    try {
      // Hashear la nueva contraseña
      const passwordHash = await bcrypt.hash(nuevaPassword, 10);

      const [result] = await pool.query(
        "UPDATE usuarios SET password = ?, primera_vez_login = FALSE WHERE id = ?",
        [passwordHash, id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Usuario no encontrado");
      }

      return true;
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }
}
