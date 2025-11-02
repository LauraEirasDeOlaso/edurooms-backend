import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ mensaje: "Token requerido" });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    console.log("🔍 Roles permitidos:", rolesPermitidos); // ← DEBUG
    console.log("🔍 Rol del usuario:", req.usuario.rol); // ← DEBUG
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para esta acción" });
    }
    next();
  };
};