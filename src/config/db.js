import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configurar dotenv para que lea desde la raíz del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

console.log("🔍 Intentando conectar con:");
console.log("  Host:", process.env.DB_HOST);
console.log("  Usuario:", process.env.DB_USER);
console.log("  BD:", process.env.DB_NAME);

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edurooms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ Conectado a MySQL correctamente");
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);
    process.exit(1);
  }
};