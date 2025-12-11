import mysql from "mysql2/promise";

let pool;

export const connectDB = async () => {
  try {
    // ← CREAR POOL AQUÍ, cuando ya se cargó .env
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "edurooms",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z'
    });

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ Conectado a MySQL correctamente");
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);
    process.exit(1);
  }
};

export { pool };