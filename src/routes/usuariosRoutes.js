import express from "express";
import { verificarToken, verificarRol } from "../middleware/auth.js";
import {
  obtenerTodos,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  cambiarPassword,
} from "../controllers/usuariosController.js";

const router = express.Router();

// GET: Listar todos los usuarios (solo admin)
router.get("/", verificarToken, verificarRol(["administrador"]), obtenerTodos);

// POST: Crear nuevo usuario (solo admin)
router.post("/", verificarToken, verificarRol(["administrador"]), crearUsuario);

// PUT: Editar usuario - cambiar rol, deshabilitar, etc (solo admin)
router.put(
  "/:id",
  verificarToken,
  verificarRol(["administrador"]),
  editarUsuario
);

// DELETE: Eliminar usuario (solo admin)
router.delete(
  "/:id",
  verificarToken,
  verificarRol(["administrador"]),
  eliminarUsuario
);

// PUT: Cambiar contraseña
router.put(
  "/:id/cambiar-password",
  verificarToken,
  cambiarPassword
);

export default router;