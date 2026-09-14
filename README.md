# Sistema de Bitácora de Mantenimiento

Aplicación web **Full Stack** para gestionar equipos, incidencias y mantenimientos de una pequeña o mediana empresa.

El proyecto busca reemplazar el seguimiento informal mediante Excel, WhatsApp o notas por un sistema centralizado con **usuarios, roles, tickets de mantenimiento, historial de reparaciones y dashboard de estadísticas**.


* Login
* Dashboard
* Equipos
* Incidencias
* Detalle de equipo
* Gestión de usuarios
* Vista del técnico
* Vista del empleado

## ✨ Funcionalidades

* Autenticación mediante JWT.
* Sistema de roles: `ADMIN`, `TECNICO` y `EMPLEADO`.
* CRUD completo de equipos.
* Creación y seguimiento de incidencias.
* Búsqueda y filtros de equipos e incidencias.
* Asignación de técnicos a incidencias.
* Historial de mantenimiento por equipo.
* Dashboard con estadísticas.
* Gestión de usuarios para administradores.
* Edición de perfiles.
* Generación de tickets de mantenimiento preventivo.
* Diseño responsive para desktop, tablet y móvil.
* Estados de carga, vacío y error.
* Modo local con `localStorage` o modo API con backend y MongoDB.


## 👥 Roles del sistema

| Rol            | Descripción                                                                       |
| -------------- | --------------------------------------------------------------------------------- |
| **ADMIN**      | Tiene acceso completo al sistema y gestiona usuarios, equipos e incidencias.      |
| **TECNICO**    | Atiende las incidencias que tiene asignadas y registra el diagnóstico y solución. |
| **EMPLEADO**   | Consulta sus equipos asignados y reporta fallas sobre ellos.                      |

### Flujo principal

```text
EMPLOYEE
   │
   │ Reporta una falla
   ▼
ADMIN
   │
   │ Revisa y asigna técnico
   ▼
TECHNICIAN
   │
   │ Diagnostica y realiza reparación
   ▼
RESUELTO
   │
   │ ADMIN verifica
   ▼
CERRADO
```

### Resuelto vs Cerrado

Son estados diferentes para mantener un punto de verificación dentro del proceso.

* **Resuelto:** el técnico indica que terminó la reparación. El backend registra automáticamente la fecha de resolución.
* **Cerrado:** el administrador confirma que la incidencia quedó solucionada. Solo el `ADMIN` puede cerrar una incidencia.

## 🛠️ Tecnologías

### Frontend

* React 
* Vite
* JavaScript
* React Router DOM
* Context API
* Axios
* HTML5
* CSS3
* Metodología BEM

### Backend

* Node.js
* Express
* MongoDB
* Mongoose
* JWT
* bcryptjs
* CORS

| Rol        | Email             | Contraseña    |
| ---------- | ----------------- | ------------- |
| ADMIN      | `admin@demo.com`  | `admin123`    |
| TECNICO    | `juan@demo.com`   | `tecnico123`  |
| TECNICO    | `maria@demo.com`  | `tecnico123`  |
| EMPLEADO   | `carlos@demo.com` | `empleado123` |

Todos los datos son ficticios y únicamente tienen fines de demostración.
verificar autenticación y roles, evitando depender únicamente de las restricciones visuales del frontend.

### Historial derivado de incidencias

No se mantiene una colección independiente para el historial.

El historial de mantenimiento de un equipo se obtiene a partir de sus incidencias relacionadas, evitando duplicar información.

### Usuarios deshabilitados

Los usuarios pueden ser deshabilitados en lugar de eliminados.

Esto permite conservar el historial de actividad y reactivar una cuenta posteriormente.

### Mantenimiento preventivo

El administrador puede revisar el inventario y generar tickets para equipos que no han tenido actividad durante los últimos 12 meses.



### Base de datos

La aplicación utiliza **MongoDB Atlas** como base de datos.

---

## 🔮 Futuras mejoras

* Notificaciones por correo al asignar incidencias.
* Adjuntar fotografías o evidencias.
* Exportar reportes a PDF o Excel.
* Paginación de equipos e incidencias.
* Gráficos más avanzados.
* Automatizar mantenimientos preventivos mediante `node-cron`.
* Cambiar `usuarioAsignado` de texto libre a una referencia `ObjectId`.
* Agregar pruebas automatizadas.



👨‍💻 Autor

Fredy Alvarez

Ingeniero en Sistemas | Desarrollador Web Full Stack Bootcamp TripleTen

Portfolio: 
https://fredyalvarezz.github.io/Portafolio/

GitHub: 
https://github.com/fredyalvarezz

Live: 