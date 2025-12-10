import express from "express";
import { verificarToken, verificarRol } from "../middleware/auth.js";
import {
  crearReserva,
  obtenerReservas,
  obtenerMisReservas,
  cancelarReserva,
  obtenerReservaPorId,
  obtenerDisponibilidad,
  traspasoReserva,
  obtenerReservasPorUsuario,
  obtenerTodasReservas,
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
router.get("/usuario/:usuario_id", verificarToken, verificarRol(["administrador"]), obtenerReservasPorUsuario);
router.get("/admin/todas", verificarToken, verificarRol(["administrador"]), obtenerTodasReservas);

// NUEVO: Traspasar reserva a otra aula (solo admin)
router.put("/:id/traspasar", verificarToken, verificarRol(["administrador"]), traspasoReserva);

export default router;