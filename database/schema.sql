-- ============================================
-- EDUROOMS - Esquema de Base de Datos
-- ============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS edurooms;
USE edurooms;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('profesor', 'administrador') DEFAULT 'profesor',
  departamento VARCHAR(100) DEFAULT NULL,
   -- NUEVOS CAMPOS: gestión de usuarios y contraseñas temporales
  primera_vez_login BOOLEAN DEFAULT TRUE,
  estado ENUM('habilitado', 'deshabilitado') DEFAULT 'habilitado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: aulas
-- ============================================
CREATE TABLE IF NOT EXISTS aulas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  capacidad INT NOT NULL,
  ubicacion VARCHAR(200),
  codigo_qr VARCHAR(255) UNIQUE,
  estado ENUM('disponible', 'ocupada', 'mantenimiento') DEFAULT 'disponible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: reservas
-- ============================================
CREATE TABLE IF NOT EXISTS reservas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  aula_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado ENUM('confirmada', 'cancelada') DEFAULT 'confirmada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reserva (aula_id, fecha, hora_inicio)
);

-- ============================================
-- TABLA: incidencias
-- ============================================
CREATE TABLE IF NOT EXISTS incidencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aula_id INT NOT NULL,
  usuario_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  tipo VARCHAR(50),
  estado ENUM('pendiente', 'en_revision', 'resuelta') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);



-- ============================================
-- FIN DEL ESQUEMA
-- ============================================