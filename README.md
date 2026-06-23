# Real-time Chat App

Aplicación de chat en tiempo real construida como proyecto de demostración para portfolio/CV. El objetivo es mostrar una arquitectura full-stack completa: WebSockets, autenticación con JWT, MongoDB, Redis y un entorno dockerizado.

Es un proyecto demo. No está pensado para producción, sino para enseñar cómo encajan estas piezas en una aplicación real.

## Características

- Mensajería en tiempo real con Socket.io
- Autenticación con JWT (registro, login y logout con blacklist en Redis)
- Salas de chat: crear salas y unirse a ellas
- Presencia en tiempo real (usuarios conectados por sala)
- Indicador de "escribiendo…"
- Todo el stack se levanta con un solo `docker-compose up`

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| WebSockets | Socket.io |
| Auth | JWT (access token) + Redis (blacklist de logout) |
| Base de datos | MongoDB + Mongoose |
| Presencia / caché | Redis (ioredis) |
| Frontend | React 19 + Vite + React Router |
| Infraestructura | Docker + docker-compose |

## Arquitectura

```
client (React + Vite)
    │
    ├── REST ───────────► server (Express)
    │                         │
    └── WebSocket ────────────┤
                              ├── MongoDB  (usuarios, salas, mensajes)
                              └── Redis    (presencia, blacklist de tokens)
```

## Estructura del proyecto

```
/
├── docker-compose.yml
├── server/                     # Backend (Express + Socket.io)
│   ├── Dockerfile
│   └── src/
│       ├── index.js            # Punto de entrada (HTTP + WebSocket)
│       ├── config/             # Conexiones a MongoDB y Redis
│       ├── models/             # User, Room, Message (Mongoose)
│       ├── routes/             # auth, rooms
│       ├── middleware/         # authJWT
│       └── socket/             # Handlers de Socket.io
└── client/                     # Frontend (React + Vite)
    └── src/
        ├── main.jsx
        ├── pages/              # Login, Register, Rooms
        ├── components/         # ChatPanel, RoomList
        ├── hooks/              # useSocket
        ├── context/           # AuthContext
        └── api/                # cliente axios con interceptor JWT
```

## Puesta en marcha

### Con Docker (recomendado)

Requiere Docker y Docker Compose.

1. Crea el archivo de entorno del servidor en `server/.env`:

   ```env
   PORT=3000
   MONGO_URI=mongodb://chatapp:chatapp@mongo:27017/chatapp?authSource=admin
   REDIS_URL=redis://redis:6379
   JWT_SECRET=changeme
   JWT_EXPIRES_IN=7d
   ```

2. Levanta todos los servicios:

   ```bash
   docker compose up --build
   ```

3. Accede a la aplicación:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000

Durante el desarrollo puedes usar `docker compose watch` para sincronizar los cambios de `client/src` y `server/src` automáticamente.

### En local (sin Docker)

Necesitas MongoDB y Redis corriendo en tu máquina y ajustar las variables de entorno.

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (en otra terminal)
cd client
npm install
npm run dev
```

## Variables de entorno (server)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor HTTP/WebSocket | `3000` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://mongo:27017/chatapp` |
| `REDIS_URL` | Cadena de conexión a Redis | `redis://redis:6379` |
| `JWT_SECRET` | Clave secreta para firmar los JWT | `changeme` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `7d` |

## API REST

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Registro de usuario (hash con bcrypt) |
| `POST` | `/api/auth/login` | No | Login y emisión de JWT |
| `POST` | `/api/auth/logout` | Sí | Invalida el token (blacklist en Redis) |
| `GET` | `/api/rooms` | Sí | Listar salas |
| `POST` | `/api/rooms` | Sí | Crear sala |
| `GET` | `/api/rooms/:id/messages` | Sí | Historial paginado (cursor-based, 50 msgs) |

## Eventos Socket.io

Cliente → Servidor

| Evento | Descripción |
|--------|-------------|
| `join_room` | Unirse a una sala |
| `leave_room` | Salir de una sala |
| `send_message` | Enviar un mensaje |
| `typing` | Indicador de escritura |

Servidor → Cliente

| Evento | Descripción |
|--------|-------------|
| `new_message` | Nuevo mensaje en la sala |
| `user_joined` | Un usuario entró a la sala |
| `user_left` | Un usuario salió de la sala |
| `users_online` | Lista de usuarios conectados en la sala |
| `typing` | Alguien está escribiendo |

El handshake de Socket.io valida el JWT (`auth.token`) antes de aceptar la conexión.

## Modelos de datos

```
User      → username, email, password (bcrypt), createdAt
Room      → name, description, createdBy → User, createdAt
Message   → room → Room, author → User, content, createdAt
```

