import { Usuario } from "../models/Usuario.js";
import { validarString, validarEmail } from "../utils/validaciones.js";
import { Reserva } from "../models/Reserva.js";
import { pool } from "../config/db.js";

// ============================================
// GET: Obtener todos los usuarios (solo admin)
// ============================================
export const obtenerTodos = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerTodos();

    res.json({
      mensaje: "✅ Usuarios obtenidos correctamente",
      usuarios,
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// ============================================
// POST: Crear nuevo usuario (solo admin)
// ============================================
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, departamento } = req.body;

    // Validar nombre
    const validacionNombre = validarString(nombre, "Nombre");
    if (!validacionNombre.valido) {
      return res.status(400).json({ mensaje: validacionNombre.mensaje });
    }

    // Validar email
    const validacionEmail = validarString(email, "Email");
    if (!validacionEmail.valido) {
      return res.status(400).json({ mensaje: validacionEmail.mensaje });
    }

    if (!validarEmail(email)) {
      return res
        .status(400)
        .json({ mensaje: "El formato del email no es válido" });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // NUEVO: Generar contraseña temporal automática
    const passwordTemporal = generarPasswordTemporal();

    // Crear usuario con rol profesor por defecto
    const nuevoUsuario = await Usuario.crear(
      nombre,
      email,
      passwordTemporal,
      "profesor",
      departamento
    );

    res.status(201).json({
      mensaje: "✅ Usuario creado correctamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        departamento: nuevoUsuario.departamento,
      },
      // NUEVO: Mostrar contraseña temporal al admin/separando valores
      passwordTemporal: passwordTemporal, // ← Solo la contraseña
      aviso: "⚠️ Comunica esto al usuario de forma segura", // Aviso aparte
    });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// ============================================
// PUT: Editar usuario - cambiar rol, estado, etc (solo admin)
// ============================================
export const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, estado, departamento } = req.body;

    // Verificar que el usuario existe
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Validar rol si se proporciona
    const rolesValidos = ["profesor", "administrador"];
    if (rol && !rolesValidos.includes(rol)) {
      return res.status(400).json({
        mensaje: `Rol debe ser uno de: ${rolesValidos.join(", ")}`,
      });
    }

    // Validar estado si se proporciona
    const estadosValidos = ["habilitado", "deshabilitado"];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: `Estado debe ser uno de: ${estadosValidos.join(", ")}`,
      });
    }

    // NUEVO: Actualizar usuario con los cambios
    const usuarioActualizado = await Usuario.actualizar(id, { rol, estado });

    res.json({
      mensaje: "✅ Usuario actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error editando usuario:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// ===================================================================
// DELETE: Eliminar usuario (solo admin) (con protección de reservas)
// ===================================================================
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // NUEVO: Verificar si el usuario tiene reservas confirmadas
    const reservas = await Reserva.obtenerPorUsuario(id);
    const reservasConfirmadas = reservas.filter(
      (r) => r.estado === "confirmada"
    );

    if (reservasConfirmadas.length > 0) {
      return res.status(400).json({
        mensaje: `❌ No se puede eliminar el usuario. Tiene ${reservasConfirmadas.length} reserva(s) confirmada(s)`,
      });
    }

    // NUEVO: Eliminar usuario.
    await Usuario.eliminar(id);

    res.json({
      mensaje: "✅ Usuario eliminado correctamente",
      usuarioEliminado: {
        id: usuario.id,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// ============================================
// FUNCIÓN AUXILIAR: Generar contraseña temporal
// ============================================
const generarPasswordTemporal = () => {
  // NUEVO: Generar contraseña que cumple con validaciones
  // Formato: Temp + número random + carácter especial
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  const especiales = "@#$%!&*";

  const letraAleatoria = caracteres.charAt(
    Math.floor(Math.random() * caracteres.length)
  );
  const numeroAleatorio = numeros.charAt(
    Math.floor(Math.random() * numeros.length)
  );
  const especialAleatorio = especiales.charAt(
    Math.floor(Math.random() * especiales.length)
  );

  return `Temp${letraAleatoria}${numeroAleatorio}${numeroAleatorio}${especialAleatorio}`;
};

// ============================================
// PUT: Cambiar contraseña (usuario en primer login o admin)
// ============================================
export const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      passwordActual,
      passwordNueva,
      passwordNuevaConfirmar,
      esPrimeraVez,
    } = req.body;

    // Validar que el usuario existe
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // NUEVO: Validar que la nueva contraseña cumpla requisitos
    const { validarPassword } = await import("../utils/validaciones.js");
    const validacionPassword = validarPassword(passwordNueva);
    if (!validacionPassword.valido) {
      return res.status(400).json({ mensaje: validacionPassword.mensaje });
    }

    // Validar que las contraseñas coincidan
    if (passwordNueva !== passwordNuevaConfirmar) {
      return res
        .status(400)
        .json({ mensaje: "Las contraseñas nuevas no coinciden" });
    }

    // Si el usuario NO es admin, debe verificar contraseña actual

    if (!passwordActual) {
      return res.status(400).json({ mensaje: "Contraseña actual requerida" });
    }
    // Obtener usuario completo (con password hash)
    const usuarioCompleto = await pool.query(
      "SELECT password FROM usuarios WHERE id = ?",
      [id]
    );
    const passwordValida = await Usuario.verificarPassword(
      passwordActual,
      usuarioCompleto[0][0].password
    );
    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });
    }
    // después de verificar que la contraseña actual es correcta
    if (passwordActual === passwordNueva) {
      return res.status(400).json({
        mensaje: "La nueva contraseña debe ser diferente a la actual",
      });
    }

    // NUEVO: Cambiar contraseña
    await Usuario.cambiarPassword(id, passwordNuevaConfirmar);

    res.json({
      mensaje: "✅ Contraseña cambiada correctamente",
      usuario: {
        id: usuario.id,
        email: usuario.email,
        primera_vez_login: false,
      },
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const validarEmailExiste = async (req, res) => {
  try {
    const { email } = req.params;

    // Usar validaciones.js
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    const [usuarios] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (usuarios.length > 0) {
      return res.json({ existe: true });
    } else {
      return res.json({ existe: false });
    }
  } catch (error) {
    console.error("Error en validarEmailExiste:", error);
    res.status(500).json({ error: "Error validando email" });
  }
};

// ============================================
// GET: Obtener usuario por ID (solo admin)
// ============================================
export const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Obtener datos completos incluyendo departamento
    const [rows] = await pool.query(
      "SELECT id, nombre, email, rol, departamento, estado FROM usuarios WHERE id = ?",
      [id]
    );

    res.json({
      mensaje: "✅ Usuario obtenido correctamente",
      usuario: rows[0],
    });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// ============================================
// PUT: Subir foto de perfil
// ============================================
export const subirFotoPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Verificar que hay archivo
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se envió archivo" });
    }

    // Guardar ruta en BD
    const fotoRuta = `uploads/${req.file.filename}`;
    await pool.query("UPDATE usuarios SET foto_ruta = ? WHERE id = ?", [
      fotoRuta,
      id,
    ]);

    res.json({
      mensaje: "✅ Foto de perfil actualizada",
      foto_ruta: fotoRuta,
    });
  } catch (error) {
    console.error("Error subiendo foto:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

// ============================================
// GET: Obtener foto de perfil
// ============================================
export const obtenerFotoPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    // ← CAMBIAR ESTO (Usuario.buscarPorId no trae foto_ruta)
    const [rows] = await pool.query(
      "SELECT foto_ruta FROM usuarios WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({
      foto_ruta: rows[0].foto_ruta || null,
    });
  } catch (error) {
    console.error("Error obteniendo foto:", error);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};
