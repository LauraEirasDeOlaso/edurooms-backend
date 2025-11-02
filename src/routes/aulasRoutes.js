import express from "express";
import { verificarToken, verificarRol } from "../middleware/auth.js";
import { validarCrearAula } from "../validators/aulasValidator.js";
import { pool } from "../config/db.js";

const router = express.Router();

// Obtener todas las aulas
router.get("/", async (req, res) => {
  try {
    const [aulas] = await pool.query("SELECT * FROM aulas");
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener aulas" });
  }
});

// Obtener aula por ID
router.get("/:id", async (req, res) => {
  try {
    const [aulas] = await pool.query("SELECT * FROM aulas WHERE id = ?", [
      req.params.id,
    ]);
    if (aulas.length === 0) {
      return res.status(404).json({ mensaje: "Aula no encontrada" });
    }
    res.json(aulas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener aula" });
  }
});

// Crear aula (solo administrador)
router.post(
  "/",
  verificarToken,
  verificarRol(["administrador"]),
  async (req, res) => {
    try {
      const { nombre, capacidad, ubicacion, codigo_qr } = req.body;

      // ✅ Usar el validator
      const validacion = validarCrearAula({
        nombre,
        capacidad,
        ubicacion,
        codigo_qr,
      });

      if (!validacion.valido) {
        return res.status(400).json({ mensaje: validacion.mensaje });
      }

      const [result] = await pool.query(
        "INSERT INTO aulas (nombre, capacidad, ubicacion, codigo_qr) VALUES (?, ?, ?, ?)",
        [nombre, capacidad, ubicacion, codigo_qr]
      );

      res.status(201).json({
        mensaje: "✅ Aula creada correctamente",
        id: result.insertId,
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al crear aula" });
    }
  }
);

export default router;