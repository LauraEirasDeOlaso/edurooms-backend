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

// Rutas públicas
router.get("/", obtenerIncidencias);
router.get("/:id", obtenerIncidenciaPorId);
router.get("/aula/:aula_id", obtenerIncidenciasAula);

// Rutas protegidas
router.post("/", verificarToken, crearIncidencia);
router.patch(
  "/:id",
  verificarToken,
  verificarRol(["administrador"]),
  actualizarEstadoIncidencia
);

export default router;