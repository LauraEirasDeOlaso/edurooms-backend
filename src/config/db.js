import mysql from "mysql2/promise";


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
  timezone: 'Z'
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