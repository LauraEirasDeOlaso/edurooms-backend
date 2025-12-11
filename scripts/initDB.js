import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";



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

     // ============================================
    // NUEVO: Insertar admin inicial
    // ============================================
    console.log("🔐 Creando usuario admin inicial...");
    
    const adminEmail = "admin@edurooms.com";
    const adminPassword = "Admin123@";
    const adminNombre = "Admin EduRooms";
    
    // Verificar si admin ya existe
    const [adminExistente] = await connection.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [adminEmail]
    );

    if (adminExistente.length === 0) {
      // Hashear contraseña del admin
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      // Insertar admin
      await connection.query(
        "INSERT INTO usuarios (nombre, email, password, rol, primera_vez_login, estado) VALUES (?, ?, ?, ?, ?, ?)",
        [adminNombre, adminEmail, passwordHash, "administrador", false, "habilitado"]
      );
      console.log(`✅ Admin creado: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log("ℹ️  Admin ya existe, se omite creación");
    }

    // ============================================
    // NUEVO: Insertar aulas de ejemplo
    // ============================================
    console.log("🏫 Creando aulas de ejemplo...");
    
    const aulas = [
      { nombre: "Aula 101", capacidad: 30, ubicacion: "Planta 1", codigo_qr: "AULA_101_QR" },
      { nombre: "Aula 102", capacidad: 25, ubicacion: "Planta 1", codigo_qr: "AULA_102_QR" },
      { nombre: "Aula 201", capacidad: 40, ubicacion: "Planta 2", codigo_qr: "AULA_201_QR" },
    ];

    for (const aula of aulas) {
      const [aulaExistente] = await connection.query(
        "SELECT id FROM aulas WHERE nombre = ?",
        [aula.nombre]
      );

      if (aulaExistente.length === 0) {
        await connection.query(
          "INSERT INTO aulas (nombre, capacidad, ubicacion, codigo_qr) VALUES (?, ?, ?, ?)",
          [aula.nombre, aula.capacidad, aula.ubicacion, aula.codigo_qr]
        );
        console.log(`✅ Aula creada: ${aula.nombre}`);
      }
    }

    console.log("📊 Base de datos inicializada completamente");
    console.log("🎯 Tabla usuarios, aulas, reservas, incidencias creadas");
    console.log("👤 Admin: admin@edurooms.com / Admin123@");

    await connection.end();
    //process.exit(0);
  } catch (error) {
    console.error("❌ Error inicializando BD:", error.message);
    //process.exit(1);
  }
};

// ============================================
// EXPORTAR función para que app.js pueda usarla
// ============================================
export { initializeDatabase };

// Ejecutar solo si se llama directamente desde terminal
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}