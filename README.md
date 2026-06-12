# Fotaza 2 — Programación Web II

**Autor:** Mazza, Agustín  
**Materia:** Programación Web II — Desarrollador de Software

Plataforma web de comunidad fotográfica que permite subir, explorar, comentar, valorar y gestionar fotografías, con sistema de seguimiento de usuarios, notificaciones y moderación de contenidos.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [PostgreSQL](https://www.postgresql.org/) v14 o superior
- npm (incluido con Node.js)

---

## Instalación y puesta en marcha

Seguir estos pasos en orden. La aplicación **no funcionará** si se saltan pasos.

### 1. Clonar el repositorio

```bash
git clone https://github.com/AgustinMazza/fotaza2_mazza-agustin
cd fotaza2_mazza-agustin
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completarlo con los datos de tu entorno local:

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=fotaza
DB_PORT=5432
PORT=3000
SESSION_SECRET=una_clave_secreta_larga
```

> **Importante:** La base de datos (`DB_NAME`) debe existir en PostgreSQL antes de continuar. Crearla con:
>
> ```sql
> CREATE DATABASE fotaza;
> ```

### 4. Inicializar la base de datos

Este comando crea todas las tablas mediante Sequelize (usando `sync({ alter: true })`):

```bash
npm run db:init
```

### 5. Cargar usuarios de prueba

```bash
npm run db:seed
```

### 6. Iniciar la aplicación

```bash
npm start
```

La aplicación queda disponible en: **http://localhost:3000**

Para desarrollo con recarga automática:

```bash
npm run dev
```

**Resumen de pasos:**

1. Clonar el repositorio
2. Ejecutar `npm install`
3. Configurar `.env`
4. Ejecutar `npm run db:init`
5. Ejecutar `npm run db:seed`
6. Ejecutar `npm start`

---

## Usuarios de prueba

| Rol             | Email              | Contraseña | Notas                           |
| --------------- | ------------------ | ---------- | ------------------------------- |
| Usuario normal  | usuario@fotaza.com | 123456     | Puede publicar, comentar, votar |
| Moderador/Admin | admin@fotaza.com   | 123456     | Accede al panel `/admin`        |

Estos usuarios se crean automáticamente al ejecutar `npm run db:seed`. Para probar la app en producción, los mismos usuarios ya están disponibles en el servidor.

---

## Funcionalidades implementadas

### ✅ Requisitos de regularización

- **Creación de publicaciones** — `/publicaciones/crear`: título, descripción opcional, una o más imágenes con licencia (con o sin copyright) y etiquetas.
- **Buscador de publicaciones/imágenes** — `/buscador`: filtros por texto (título/descripción), etiqueta, usuario y rango de fechas, combinables entre sí.
- **Módulo de comentarios**: cualquier usuario registrado puede comentar. El autor puede abrir/cerrar los comentarios de su publicación en cualquier momento.
- **Valoración de imágenes**: sistema de 1 a 5 estrellas por imagen. El autor no puede valorar sus propias imágenes. Muestra promedio y cantidad de votos.
- **Seguimiento de usuarios (Followers)**: seguir/dejar de seguir, contador de seguidores y seguidos en cada perfil, sección de seguidores y seguidos.

### ✅ Funcionalidades adicionales implementadas

- **Autenticación**: registro con validaciones (Zod), login con sesiones (express-session), contraseñas hasheadas con bcrypt. Cuentas desactivadas no pueden ingresar.
- **Gestor de contenidos**: denuncia de imágenes con motivo. Al superar 3 denuncias distintas, la imagen se bloquea y pasa al panel de moderación. El moderador puede dar de baja la publicación o desestimar las denuncias. Con 3 publicaciones dadas de baja, la cuenta del usuario se inactiva.
- **Marca de agua**: imágenes con copyright pueden tener texto personalizado de marca de agua, aplicado automáticamente con `sharp`.
- **"Me interesa"**: botón toggle que notifica al autor y habilita la mensajería privada mostrando el perfil del interesado.
- **Notificaciones**: se generan al comentar, valorar, marcar "me interesa" o comenzar a seguir. Cada usuario tiene su sección de notificaciones con tipo de evento, usuario origen y fecha. Se pueden marcar como leídas.
- **Colecciones / Favoritos**: modelo implementado (Coleccion, ColeccionPublicacion).
- **Panel de administración** (`/admin`): listado de publicaciones con imágenes bloqueadas, con opción de dar de baja o desestimar denuncias.
- **Perfiles públicos**: cada usuario tiene un perfil visible por otros usuarios registrados.
- **Home pública**: usuarios anónimos pueden ver imágenes sin copyright (sin necesidad de estar logueados).

---

## Estructura del proyecto

```
TPI/
├── app.js                    # Punto de entrada, configuración de Express
├── package.json
├── .env.example              # Variables de entorno de ejemplo
├── db/
│   ├── config.js             # Conexión a PostgreSQL con Sequelize
│   ├── init.js               # Script de inicialización de tablas
│   └── seed.js               # Script de carga de usuarios de prueba
├── models/                   # Modelos Sequelize (una entidad por archivo)
│   ├── index.js              # Asociaciones entre modelos
│   ├── Usuario.js
│   ├── Publicacion.js
│   ├── Imagen.js
│   ├── Comentario.js
│   ├── Reaccion.js
│   ├── Denuncia.js
│   ├── Etiqueta.js
│   ├── Seguidor.js
│   ├── PublicacionEtiqueta.js
│   ├── Coleccion.js
│   ├── ColeccionPublicacion.js
│   ├── MeInteresa.js
│   └── Notificacion.js
├── controllers/              # Lógica de negocio
│   ├── auth.js
│   ├── publicacion.js
│   ├── perfil.js
│   ├── buscar.js
│   ├── notificaciones.js
│   ├── admin.js
│   └── index.js
├── routes/                   # Definición de rutas
│   ├── auth.js
│   ├── publicaciones.js
│   ├── perfil.js
│   ├── buscar.js
│   ├── notificaciones.js
│   ├── admin.js
│   └── index.js
├── middleware/
│   ├── auth.js               # requireAuth
│   ├── admin.js              # requireAdmin
│   └── sesion.js             # cargarUsuarioSesion (res.locals)
├── helpers/
│   ├── imagen.js             # blobABase64
│   ├── marcaAgua.js          # Aplicar marca de agua con sharp
│   └── notificacion.js       # crearNotificacion
├── validaciones/
│   ├── auth.js               # Zod schema para registro
│   └── publi.js              # Zod schema para publicaciones
├── views/                    # Plantillas Pug
│   ├── layout.pug
│   ├── index.pug
│   ├── publicaciones.pug
│   ├── crear-publicacion.pug
│   ├── buscar.pug
│   ├── perfil.pug
│   ├── seguidores.pug
│   ├── notificaciones.pug
│   ├── admin.pug
│   ├── auth/
│   │   ├── login.pug
│   │   └── register.pug
│   └── mixins/
│       ├── publicacion.pug
│       └── modal.pug
└── public/
    ├── css/
    └── js/
```

---

## Stack tecnológico

| Capa                      | Tecnología                  |
| ------------------------- | --------------------------- |
| Runtime                   | Node.js                     |
| Framework web             | Express 5                   |
| Motor de plantillas       | Pug (server-side rendering) |
| ORM                       | Sequelize 6                 |
| Base de datos             | PostgreSQL                  |
| Autenticación             | express-session + bcrypt    |
| Validaciones              | Zod                         |
| Procesamiento de imágenes | sharp                       |
| CSS framework             | Bootstrap 5                 |
| Variables de entorno      | dotenv                      |

---

## Rutas principales

| Método | Ruta                                | Descripción                                | Auth requerida |
| ------ | ----------------------------------- | ------------------------------------------ | -------------- |
| GET    | `/`                                 | Home con imágenes públicas (sin copyright) | No             |
| GET    | `/auth/login`                       | Formulario de inicio de sesión             | No             |
| POST   | `/auth/login`                       | Procesar login                             | No             |
| GET    | `/auth/register`                    | Formulario de registro                     | No             |
| POST   | `/auth/register`                    | Procesar registro                          | No             |
| POST   | `/auth/logout`                      | Cerrar sesión                              | No             |
| GET    | `/publicaciones`                    | Galería completa                           | Sí             |
| GET    | `/publicaciones/crear`              | Formulario nueva publicación               | Sí             |
| POST   | `/publicaciones/crear`              | Guardar publicación                        | Sí             |
| POST   | `/publicaciones/comentar`           | Agregar comentario                         | Sí             |
| POST   | `/publicaciones/toggle-comentarios` | Abrir/cerrar comentarios                   | Sí             |
| POST   | `/publicaciones/votar`              | Valorar imagen                             | Sí             |
| POST   | `/publicaciones/denunciar`          | Denunciar imagen                           | Sí             |
| POST   | `/publicaciones/me-interesa`        | Marcar interés en imagen                   | Sí             |
| POST   | `/publicaciones/:id/editar`         | Editar publicación                         | Sí             |
| GET    | `/buscador`                         | Motor de búsqueda                          | Sí             |
| GET    | `/perfil`                           | Perfil propio                              | Sí             |
| POST   | `/perfil/actualizar`                | Actualizar perfil                          | Sí             |
| GET    | `/perfil/:id`                       | Perfil público de otro usuario             | Sí             |
| POST   | `/perfil/seguir/:id`                | Seguir usuario                             | Sí             |
| POST   | `/perfil/dejar-de-seguir/:id`       | Dejar de seguir                            | Sí             |
| GET    | `/perfil/seguidores`                | Mis seguidores                             | Sí             |
| GET    | `/perfil/siguiendo`                 | Usuarios que sigo                          | Sí             |
| GET    | `/notificaciones`                   | Ver notificaciones                         | Sí             |
| POST   | `/notificaciones/marcar-leida/:id`  | Marcar como leída                          | Sí             |
| GET    | `/admin`                            | Panel de moderación                        | Sí (admin)     |
| POST   | `/admin/dar-de-baja/:id`            | Dar de baja publicación                    | Sí (admin)     |
| POST   | `/admin/desestimar/:id`             | Desestimar denuncias                       | Sí (admin)     |

---

## Problemas encontrados durante el desarrollo

### Almacenamiento de imágenes como BLOB

Guardar imágenes directamente en la base de datos como `BYTEA` (PostgreSQL) resultó práctico para el prototipo, pero implica mayor tamaño en la BD. La conversión a base64 para renderizar en el frontend se resolvió con el helper `blobABase64`. Para producción sería más adecuado usar almacenamiento de archivos externo (S3, Cloudinary).

### Marca de agua con sharp

La librería `sharp` requiere que la imagen de entrada sea válida. Se agregó manejo de errores (`try/catch`) alrededor de `aplicarMarcaAgua` para que, si falla el procesamiento, la imagen se guarde igualmente sin la marca.

### Asociaciones Sequelize con alias

Las relaciones many-to-many con alias personalizados (ej: `Seguidores` y `Seguidos` en la autoreferencia de `Usuario`) requirieron especificar los alias correctamente en los `include`. Sin el alias correcto Sequelize no resuelve la asociación.

### Sincronización del modelo con `alter: true`

Durante el desarrollo se usó `sequelize.sync({ alter: true })` para que los cambios en los modelos se reflejen automáticamente en la BD. Esto facilita el desarrollo iterativo pero en producción se debería migrar a un sistema de migraciones formal.

### Sesión desincronizada al actualizar perfil

Al actualizar datos del perfil, la sesión seguía mostrando los datos viejos. Se resolvió recargando el objeto `req.session.usuario` con los datos actualizados tras el `update`.

---

## Notas de producción

- La aplicación está desplegada en: https://fotaza2-mazza-agustin.onrender.com/
- Compatible con servidores Node.js (Railway, Render, Fly.io, etc.) con soporte para PostgreSQL.
- Las imágenes se almacenan en la BD como BLOB, por lo que no se necesita almacenamiento externo para esta versión.
