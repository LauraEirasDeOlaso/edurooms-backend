import express from "express";
import { verificarToken, verificarRol } from "../middleware/auth.js";
import {
  crearIncidencia,
  obtenerIncidencias,
  obtenerIncidenciasAula,
  obtenerIncidenciaPorId,
  actualizarEstadoIncidencia,
} from "../controllers/incidenciasController.js";

const router = express.Router();

// Rutas públicas (ORDEN CRÍTICO)
router.get("/aula/:aula_id", obtenerIncidenciasAula);    // Específica 1
router.get("/", obtenerIncidencias);                      // Genérica (ANTES de /:id)
router.get("/:id", obtenerIncidenciaPorId);               // Específica 2

// Rutas protegidas
router.post("/", verificarToken, crearIncidencia);
router.patch(
  "/:id",
  verificarToken,
  verificarRol(["administrador"]),
  actualizarEstadoIncidencia
);

export default router;

