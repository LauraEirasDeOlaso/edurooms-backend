import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";
import { validarRegistro, validarLogin } from "../validators/authValidator.js";
import dotenv from "dotenv";

dotenv.config();

// Registrar nuevo usuario
export const registro = async (req, res) => {
  try {
    const { nombre, email, password, confirmarPassword, rol } = req.body;

    // ✅ Usar el validator
    const validacion = validarRegistro({
      nombre,
      email,
      password,
      confirmarPassword,
      rol
    });

    if (!validacion.valido) {
      return res.status(400).json({ mensaje: validacion.mensaje });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // Crear usuario
    const nuevoUsuario = await Usuario.crear(
        nombre, 
        email, 
        password,
        rol || "profesor"
    );

    // Crear token JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      mensaje: "✅ Usuario registrado correctamente",
      usuario: nuevoUsuario,
      token,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Usar el validator
    const validacion = validarLogin({ email, password });

    if (!validacion.valido) {
      return res.status(400).json({ mensaje: validacion.mensaje });
    }

    // Buscar usuario
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const passwordValida = await Usuario.verificarPassword(
      password,
      usuario.password
    );
    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      mensaje: "✅ Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// Obtener perfil del usuario (requiere autenticación)
export const obtenerPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const usuario = await Usuario.buscarPorId(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ usuario });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};