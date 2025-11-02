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
}