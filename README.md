# 🚀 EduRooms Backend

Backend Node.js + Express para el sistema de gestión de aulas **EduRooms**.

## 📋 Requisitos

- Node.js v18+
- MySQL 8+
- npm

## 🔧 Instalación
```bash
# Clonar repositorio
git clone https://github.com/LauraEirasDeOlaso/edurooms-backend.git
cd edurooms-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus datos de MySQL

# Iniciar servidor
npm run dev
```

## 📁 Estructura
```
src/
├── app.js           - Servidor principal
├── config/
│   └── db.js        - Conexión MySQL
├── routes/          - Rutas API
├── controllers/     - Lógica de negocio
├── models/          - Esquemas de BD
└── middleware/      - Autenticación, validaciones
```

## 📊 Diagrama Entidad-Relación (ERD)

Esquema de base de datos con las relaciones entre tablas:

![Diagrama ERD](database/diagrama-erd.png)

### Tablas principales:

| Tabla | Descripción |
|-------|-------------|
| **usuarios** | Almacena profesores y administradores del sistema |
| **aulas** | Información de aulas (nombre, capacidad, ubicación, código QR) |
| **reservas** | Reservas de aulas con fecha, hora y estado |
| **incidencias** | Reportes de problemas técnicos o de mantenimiento |

### Relaciones:

- Un **usuario** puede tener múltiples **reservas**
- Un **usuario** puede reportar múltiples **incidencias**
- Un **aula** puede tener múltiples **reservas**
- Un **aula** puede tener múltiples **incidencias**

---

## ✅ Endpoints disponibles

- `GET /` - Prueba de servidor
- `GET /api/health` - Estado de servidor y BD

## 🔄 Scripts
```bash
npm run dev    # Desarrollo (con nodemon)
npm start      # Producción
```