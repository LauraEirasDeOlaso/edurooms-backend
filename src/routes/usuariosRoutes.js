import express from "express";
import { verificarToken, verificarRol } from "../middleware/auth.js";
import {
  obtenerTodos,
  obtenerPorId,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  cambiarPassword,
  validarEmailExiste,
  subirFotoPerfil,
  obtenerFotoPerfil,
} from "../controllers/usuariosController.js";
import { upload } from "../config/multer.js";

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
router.put("/:id/cambiar-password", verificarToken, cambiarPassword);

// GET: Validar si un email existe (PÚBLICO - solo para recuperar contraseña)
router.get("/existe/:email", validarEmailExiste);

// GET: Obtener usuario por ID (solo admin)
router.get(
  "/:id",
  verificarToken,
  verificarRol(["administrador"]),
  obtenerPorId
);

router.put(
  "/:id/foto-perfil",
  verificarToken,
  upload.single("foto"),
  subirFotoPerfil
);

router.get("/:id/foto-perfil", obtenerFotoPerfil);

export default router;
