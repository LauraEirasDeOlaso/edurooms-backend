# 🚀 EduRooms Backend

Backend Node.js + Express para el sistema de gestión de aulas **EduRooms**.

Sistema completo para reservas de aulas, gestión de usuarios y reportes de incidencias en instituciones educativas.

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
```

## 📁 Estructura
```
src/
├── app.js              - Servidor principal
├── config/
│   └── db.js           - Conexión MySQL
├── controllers/        - Lógica de negocio
├── models/             - Modelos de datos
├── routes/             - Rutas API
├── middleware/         - Autenticación, validaciones
├── validators/         - Validadores de datos
├── utils/              - Utilidades (festivos, etc)
└── database/
    └── schema.sql      - Esquema de BD
```

## 🛠️ Configuración

### Variables de entorno (.env)
```dotenv
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=edurooms

# JWT
JWT_SECRET=mi_clave_secreta_muy_fuerte_123456789
```

## ✨ Features

### Autenticación
- ✅ Login con JWT
- ✅ Remember Me (sesiones persistentes)
- ✅ Cambio de contraseña con validación
- ✅ Protección de endpoints por rol

### Gestión de Usuarios (Admin)
- ✅ CRUD de usuarios
- ✅ Crear usuarios con contraseña temporal
- ✅ Cambiar estado (habilitado/deshabilitado)
- ✅ Asignar roles (profesor/administrador)
- ✅ Eliminar usuarios (sin reservas activas)
- ✅ Validación de eliminación de admins

### Gestión de Aulas (Admin)
- ✅ CRUD de aulas
- ✅ Información: nombre, capacidad, ubicación, estado
- ✅ Validación de eliminación (sin reservas)

### Reservas
- ✅ Crear reservas (8:00-21:00, intervalos 1.5h)
- ✅ Validación de solapamiento por aula
- ✅ Validación de solapamiento por usuario
- ✅ Cancelar reservas
- ✅ Reactivar reservas canceladas
- ✅ Traspasar a otra aula
- ✅ Bloqueo de sábados, domingos y festivos
- ✅ Obtener disponibilidad en tiempo real

### Incidencias
- ✅ Reportar incidencias (profesor)
- ✅ Gestionar incidencias (admin)
- ✅ Cambiar estado (pendiente, en revisión, resuelta)
- ✅ Ver por aula y usuario

## 📊 Modelos de Datos

### Usuarios
```
- id (PK)
- nombre
- email (UNIQUE)
- password (hash)
- rol (profesor/administrador)
- departamento
- estado (habilitado/deshabilitado)
- foto_ruta
- primera_vez_login
- created_at
```

### Aulas
```
- id (PK)
- nombre
- capacidad
- ubicacion
- estado (disponible/mantenimiento)
- codigo_qr
- created_at
```

### Reservas
```
- id (PK)
- usuario_id (FK)
- aula_id (FK)
- fecha
- hora_inicio
- hora_fin
- estado (confirmada/cancelada/completada)
- created_at
```

### Incidencias
```
- id (PK)
- usuario_id (FK)
- aula_id (FK)
- descripcion
- tipo (técnico/mantenimiento)
- estado (pendiente/en_revision/resuelta)
- created_at
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/registro` - Registro
- `GET /api/auth/perfil` - Obtener perfil actual
- `PUT /api/usuarios/:id/cambiar-password` - Cambiar contraseña

### Usuarios (Admin)
- `GET /api/usuarios` - Listar todos
- `POST /api/usuarios` - Crear
- `GET /api/usuarios/:id` - Obtener por ID
- `PUT /api/usuarios/:id` - Editar
- `DELETE /api/usuarios/:id` - Eliminar

### Aulas
- `GET /api/aulas` - Listar todas
- `GET /api/aulas/:id` - Obtener por ID
- `POST /api/aulas` - Crear (admin)
- `PUT /api/aulas/:id` - Editar (admin)
- `DELETE /api/aulas/:id` - Eliminar (admin)

### Reservas
- `POST /api/reservas` - Crear
- `GET /api/reservas/usuario/mis-reservas` - Mis reservas
- `GET /api/reservas/admin/todas` - Todas (admin)
- `GET /api/reservas/:id` - Obtener por ID
- `GET /api/reservas/disponibilidad` - Disponibilidad
- `DELETE /api/reservas/:id` - Cancelar
- `PUT /api/reservas/:id/reactivar` - Reactivar (admin)
- `PUT /api/reservas/:id/traspasar` - Traspasar aula (admin)

### Incidencias
- `POST /api/incidencias` - Reportar
- `GET /api/incidencias` - Listar todas (admin)
- `GET /api/incidencias/:id` - Obtener por ID
- `GET /api/incidencias/aula/:aula_id` - Por aula
- `PATCH /api/incidencias/:id` - Cambiar estado (admin)

## 🔄 Scripts
```bash
npm run dev    # Desarrollo con nodemon
npm start      # Producción
```

## 🚀 Despliegue

### Railway

1. Conectar repositorio GitHub
2. Crear base de datos MySQL en Railway
3. Configurar variables de entorno
4. Deploy automático en push a main
```bash
git push  # Deploya automáticamente
```

## 📝 Notas

- Las contraseñas se hashean con bcrypt
- Los tokens JWT expiran en 7 días
- Las reservas se bloquean automáticamente para sábados, domingos y festivos de Valencia
- Los usuarios deshabilitados no pueden acceder
- No se pueden eliminar administradores

## 👨‍💻 Autor

Laura Eiras de Olaso

## 📄 Licencia

MIT