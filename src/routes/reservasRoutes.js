import express from "express";
import { verificarToken } from "../middleware/auth.js";
import {
  crearReserva,
  obtenerReservas,
  obtenerMisReservas,
  cancelarReserva,
  obtenerReservaPorId,
  obtenerDisponibilidad,
} from "../controllers/reservasController.js";

const router = express.Router();

// Rutas públicas (ORDEN CRÍTICO)
router.get("/usuario/mis-reservas", verificarToken, obtenerMisReservas);  // Específica
router.get("/disponibilidad", obtenerDisponibilidad);                      // Disponibilidad (ANTES de :id)
router.get("/", obtenerReservas);                                           // Genérica (ANTES)
router.get("/:id", obtenerReservaPorId);                                    // Específica

// Rutas protegidas
router.post("/", verificarToken, crearReserva);
router.delete("/:id", verificarToken, cancelarReserva);

export default router;