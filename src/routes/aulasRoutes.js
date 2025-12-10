import express from "express";
import { verificarToken, verificarRol } from "../middleware/auth.js";
import {
  obtenerAulas,
  obtenerAulaPorId,
  crearAula,
  eliminarAula,
  actualizarAula,
} from "../controllers/aulascontroller.js";

const router = express.Router();

// GET
router.get("/", obtenerAulas);
router.get("/:id", obtenerAulaPorId);

// POST
router.post("/", verificarToken, verificarRol(["administrador"]), crearAula);

// PUT
router.put("/:id", verificarToken, verificarRol(["administrador"]), actualizarAula);

// DELETE
router.delete("/:id", verificarToken, verificarRol(["administrador"]), eliminarAula);

export default router;