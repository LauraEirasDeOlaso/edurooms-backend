import express from "express";
import { verificarToken } from "../middleware/auth.js";
import {
  crearReserva,
  obtenerReservas,
  obtenerMisReservas,
  cancelarReserva,
  obtenerReservaPorId,
} from "../controllers/reservasController.js";

const router = express.Router();

// Rutas públicas (ORDEN CRÍTICO)
router.get("/usuario/mis-reservas", verificarToken, obtenerMisReservas);  // Específica
router.get("/", obtenerReservas);                                           // Genérica (ANTES)
router.get("/:id", obtenerReservaPorId);                                    // Específica

// Rutas protegidas
router.post("/", verificarToken, crearReserva);
router.delete("/:id", verificarToken, cancelarReserva);

export default router;