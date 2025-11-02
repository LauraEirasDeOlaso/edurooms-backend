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

// Rutas públicas (solo listar)
router.get("/", obtenerReservas);
router.get("/:id", obtenerReservaPorId);

// Rutas protegidas (requieren autenticación)
router.post("/", verificarToken, crearReserva);
router.get("/usuario/mis-reservas", verificarToken, obtenerMisReservas);
router.delete("/:id", verificarToken, cancelarReserva);

export default router;