import dotenv from "dotenv";
dotenv.config({ debug: true });

console.log("🔍 Intentando conectar con:");
console.log("  Host:", process.env.DB_HOST);
console.log("  Usuario:", process.env.DB_USER);
console.log("  Contraseña:", process.env.DB_PASSWORD);
console.log("  BD:", process.env.DB_NAME);

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { initializeDatabase } from "../scripts/initDB.js";
import aulasRoutes from "./routes/aulasRoutes.js";
import reservasRoutes from "./routes/reservasRoutes.js";
import incidenciasRoutes from "./routes/incidenciasRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.get("/", (req, res) => {
  res.json({ mensaje: "✅ Servidor EduRooms funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/aulas", aulasRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/incidencias", incidenciasRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

try {
  await initializeDatabase();
} catch (error) {
  console.warn("⚠️  initializeDatabase ya ejecutado o error:", error.message);
}

await connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});