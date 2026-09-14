# Backend — Sistema de Bitácora de Mantenimiento

API REST del **Sistema de Bitácora de Mantenimiento**, desarrollada con Node.js, Express y MongoDB.

Se encarga de la autenticación, autorización por roles, gestión de usuarios, equipos e incidencias y generación de mantenimientos preventivos.

## 🛠️ Tecnologías

* Node.js
* Express
* MongoDB
* Mongoose
* JWT (`jsonwebtoken`)
* bcryptjs
* CORS
* dotenv

## 🔐 Autenticación y roles

La API utiliza **JWT** para autenticar usuarios y middleware para controlar el acceso según el rol:

* **ADMIN:** acceso completo.
* **TECNICO:** gestiona las incidencias que tiene asignadas.
* **EMPLEADO:** reporta y consulta incidencias relacionadas con sus equipos.

Las contraseñas se almacenan utilizando `bcryptjs`.

## 📡 Principales endpoints

### Autenticación

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/me
```

### Usuarios

```text
GET  /api/users
POST /api/users
GET  /api/users/:id
PUT  /api/users/:id
```

### Equipos

```text
GET    /api/equipment
POST   /api/equipment
GET    /api/equipment/:id
PUT    /api/equipment/:id
DELETE /api/equipment/:id

GET  /api/equipment/:id/history

POST /api/equipment/generar-mantenimientos-preventivos
```

### Incidencias

```text
GET    /api/incidents
POST   /api/incidents
GET    /api/incidents/:id
PUT    /api/incidents/:id
DELETE /api/incidents/:id

GET /api/incidents/stats/dashboard
```

### Health check

```text
GET /api/health
```


Usuarios demo:

| Rol        | Email             | Contraseña    |
| ---------- | ----------------- | ------------- |
| ADMIN      | `admin@demo.com`  | `admin123`    |
| TECHNICIAN | `juan@demo.com`   | `tecnico123`  |
| TECHNICIAN | `maria@demo.com`  | `tecnico123`  |
| EMPLOYEE   | `carlos@demo.com` | `empleado123` |

Los datos son ficticios y únicamente se utilizan para demostración.

👨‍💻 Autor

Fredy Alvarez

Ingeniero en Sistemas | Desarrollador Web Full Stack Bootcamp TripleTen

Portfolio: 
https://fredyalvarezz.github.io/Portafolio/

GitHub: 
https://github.com/fredyalvarezz

Live: 