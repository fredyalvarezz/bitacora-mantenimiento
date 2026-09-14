# Sistema de Bitácora de Mantenimiento — Frontend

Frontend de la aplicación **Sistema de Bitácora de Mantenimiento**, desarrollado con React y Vite.

La aplicación permite gestionar equipos, incidencias y usuarios de acuerdo con el rol del usuario autenticado. Cuenta con una interfaz responsive y puede funcionar tanto conectada al backend mediante API como en un modo local utilizando `localStorage`.

## ✨ Funcionalidades

* Autenticación y manejo de sesión.
* Control de acceso según rol:
  * `ADMIN`
  * `TECNICO`
  * `EMPLEADO`
* Dashboard con estadísticas.
* Gestión de equipos.
* Gestión de incidencias y tickets.
* Filtros por estado, prioridad, asignación y fechas.
* Historial de mantenimiento por equipo.
* Gestión de usuarios para administradores.
* Edición de perfil.
* Generación de mantenimientos preventivos.
* Estados de carga, vacío y error.
* Diseño responsive para desktop, tablet y móvil.
* React Router para navegación entre páginas.
* Posibilidad de utilizar datos locales o una API real.

## 🛠️ Tecnologías

* React
* Vite
* React Router DOM
* Axios
* Context API
* JavaScript
* HTML5
* CSS3
* Metodología BEM
* LocalStorage


## 🎨 Organización de estilos

Los estilos están separados en diferentes niveles para mantener el proyecto organizado y facilitar su mantenimiento.

Es el archivo principal para modificar colores, tamaños y otros tokens utilizados por la aplicación.

Cada componente y página mantiene su propio archivo CSS:

Esto evita tener un único archivo CSS demasiado grande y facilita encontrar los estilos correspondientes a cada parte de la aplicación.

## 🔐 Roles en el frontend

La interfaz adapta las opciones disponibles dependiendo del rol.

### ADMIN

Tiene acceso a:

* Dashboard.
* Equipos.
* Incidencias.
* Usuarios.
* Perfil.
* Creación y asignación de tickets.
* Edición completa de información.

### TECNICO

Puede:

* Consultar el inventario.
* Ver incidencias asignadas.
* Actualizar el estado de sus incidencias.
* Agregar diagnóstico.
* Agregar solución.
* Agregar observaciones.
* Consultar el historial correspondiente a sus incidencias.

No puede cerrar definitivamente una incidencia.

### EMPLEADO

Puede:

* Ver sus equipos asignados.
* Crear tickets sobre sus equipos.
* Consultar los tickets que él mismo creó.

No tiene acceso al Dashboard ni puede modificar o asignar tickets.

Para un entorno real se debe utilizar el backend con:
* JWT.
* bcrypt.
* MongoDB.
* Control de acceso por roles.

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
