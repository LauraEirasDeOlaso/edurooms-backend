import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { initializeDatabase } from "../scripts/initDB.js";
import aulasRoutes from "./routes/aulasRoutes.js";
import reservasRoutes from "./routes/reservasRoutes.js";
import incidenciasRoutes from "./routes/incidenciasRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

// Solo cargar .env en desarrollo
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de prueba
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

// ============================================
// NUEVO: Inicializar base de datos automáticamente
// ============================================
try {
  await initializeDatabase();
} catch (error) {
  console.warn("⚠️  initializeDatabase ya ejecutado o error:", error.message);
}

// Conectar a BD
await connectDB();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
