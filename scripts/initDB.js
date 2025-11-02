import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initializeDatabase = async () => {
  try {
    console.log("🔄 Inicializando base de datos...");

    // Conexión sin especificar BD (para crearla)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    // Leer el archivo SQL
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Ejecutar todas las sentencias SQL
    await connection.query(schema);

    console.log("✅ Base de datos inicializada correctamente");
    console.log("📊 Tablas creadas: usuarios, aulas, reservas, incidencias");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inicializando BD:", error.message);
    process.exit(1);
  }
};

initializeDatabase();