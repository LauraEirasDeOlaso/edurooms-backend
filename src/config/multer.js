import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ← USAR RUTA ABSOLUTA DEL VOLUMEN
const uploadsDir = "/app/uploads";

// CREAR CARPETA SI NO EXISTE
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✅ Carpeta uploads creada en:", uploadsDir);
  } catch (error) {
    console.error("❌ Error creando carpeta:", error.message);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);  // ← CAMBIAR
  },
  filename: (req, file, cb) => {
    const userId = req.usuario.id;
    const ext = path.extname(file.originalname);
    cb(null, `perfil_usuario_${userId}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tipos = ["image/jpeg", "image/png", "image/jpg"];
    if (!tipos.includes(file.mimetype)) {
      return cb(new Error("Solo se aceptan JPG, JPEG o PNG"));
    }
    cb(null, true);
  },
});