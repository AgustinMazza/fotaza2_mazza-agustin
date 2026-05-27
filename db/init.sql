CREATE TABLE "Usuario" (
  "id" integer PRIMARY KEY,
  "foto_perfil" string,
  "nombre_usuario" string,
  "mail" string,
  "contraseña" string,
  "estado" boolean,
  "admin" boolean
);

CREATE TABLE "Publicacion" (
  "id" integer PRIMARY KEY,
  "titulo" string,
  "descripcion" string,
  "usuario_id" integer,
  "fecha_creacion" timestamp
);

CREATE TABLE "Imagen" (
  "id" integer PRIMARY KEY,
  "direccion_foto" text,
  "publicacion_id" integer,
  "copyright" boolean,
  "marca_agua" string,
  "cont_denuncias" integer,
  "bloqueada" boolean
);

CREATE TABLE "Reaccion" (
  "id" integer PRIMARY KEY,
  "usuario_id" integer,
  "imagen_id" integer,
  "estrellas" integer
);

CREATE TABLE "Comentario" (
  "id" integer PRIMARY KEY,
  "usuario_id" integer,
  "publicacion_id" integer,
  "texto" string,
  "bloqueado" boolean
);

CREATE TABLE "Seguidor" (
  "id" integer PRIMARY KEY,
  "seguidor_id" integer,
  "seguido_id" integer
);

CREATE TABLE "Denuncia" (
  "id" integer PRIMARY KEY,
  "usuario_id" integer,
  "imagen_id" integer,
  "motivo" string,
  "estado" string
);

CREATE TABLE "Coleccion" (
  "id" integer PRIMARY KEY,
  "nombre" string,
  "usuario_id" integer
);

CREATE TABLE "Coleccion_publicacion" (
  "id" integer PRIMARY KEY,
  "coleccion_id" integer,
  "publicacion_id" integer
);

CREATE TABLE "etiqueta" (
  "id" integer PRIMARY KEY,
  "nombre" string
);

CREATE TABLE "publicacion_etiqueta" (
  "id" integer PRIMARY KEY,
  "etiqueta_id" integer,
  "publicacion_id" integer
);

ALTER TABLE "Publicacion" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Imagen" ADD FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Denuncia" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Denuncia" ADD FOREIGN KEY ("imagen_id") REFERENCES "Imagen" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Comentario" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Comentario" ADD FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Seguidor" ADD FOREIGN KEY ("seguidor_id") REFERENCES "Usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Seguidor" ADD FOREIGN KEY ("seguido_id") REFERENCES "Usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Reaccion" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Reaccion" ADD FOREIGN KEY ("imagen_id") REFERENCES "Imagen" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Coleccion" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Coleccion_publicacion" ADD FOREIGN KEY ("coleccion_id") REFERENCES "Coleccion" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Coleccion_publicacion" ADD FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "publicacion_etiqueta" ADD FOREIGN KEY ("etiqueta_id") REFERENCES "etiqueta" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Publicacion" ADD FOREIGN KEY ("id") REFERENCES "publicacion_etiqueta" ("publicacion_id") DEFERRABLE INITIALLY IMMEDIATE;
