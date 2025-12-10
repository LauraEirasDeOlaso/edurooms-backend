import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../../uploads");

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