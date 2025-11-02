import express from "express";
import {
  registro,
  login,
  obtenerPerfil,
} from "../controllers/authController.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

// Rutas públicas
router.post("/registro", registro);
router.post("/login", login);

// Rutas protegidas (requieren token)
router.get("/perfil", verificarToken, obtenerPerfil);

export default router;