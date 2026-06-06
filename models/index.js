import sequelize from "../db/config.js";
import Usuario from "./Usuario.js";
import Publicacion from "./Publicacion.js";
import Imagen from "./Imagen.js";
import Comentario from "./Comentario.js";
import Reaccion from "./Reaccion.js";
import Denuncia from "./Denuncia.js";
import Coleccion from "./Coleccion.js";
import Etiqueta from "./Etiqueta.js";
import Seguidor from "./Seguidor.js";
import PublicacionEtiqueta from "./PublicacionEtiqueta.js";
import ColeccionPublicacion from "./ColeccionPublicacion.js";
import MeInteresa from "./MeInteresa.js";

// Usuario 1-n Publicacion
Usuario.hasMany(Publicacion, { foreignKey: "usuario_id" });
Publicacion.belongsTo(Usuario, { foreignKey: "usuario_id" });

// Publicacion 1-n Imagen
Publicacion.hasMany(Imagen, { as: "imagenes", foreignKey: "publicacion_id" });
Imagen.belongsTo(Publicacion, { foreignKey: "publicacion_id" });

// Comentario (Muchos a 1 con Usuario y Publicacion)
Usuario.hasMany(Comentario, { foreignKey: "usuario_id" });
Comentario.belongsTo(Usuario, { foreignKey: "usuario_id" });
Publicacion.hasMany(Comentario, { foreignKey: "publicacion_id" });
Comentario.belongsTo(Publicacion, { foreignKey: "publicacion_id" });

// Reaccion (Muchos a 1 con Usuario e Imagen)
Usuario.hasMany(Reaccion, { foreignKey: "usuario_id" });
Reaccion.belongsTo(Usuario, { foreignKey: "usuario_id" });
Imagen.hasMany(Reaccion, { foreignKey: "imagen_id" });
Reaccion.belongsTo(Imagen, { foreignKey: "imagen_id" });

// Denuncia (Muchos a 1 con Usuario e Imagen)
Usuario.hasMany(Denuncia, { foreignKey: "usuario_id" });
Denuncia.belongsTo(Usuario, { foreignKey: "usuario_id" });
Imagen.hasMany(Denuncia, { foreignKey: "imagen_id" });
Denuncia.belongsTo(Imagen, { foreignKey: "imagen_id" });

// MeInteresa (Muchos a 1 con Usuario e Imagen)
Usuario.hasMany(MeInteresa, { foreignKey: "usuario_id" });
MeInteresa.belongsTo(Usuario, { foreignKey: "usuario_id" });
Imagen.hasMany(MeInteresa, { foreignKey: "imagen_id" });
MeInteresa.belongsTo(Imagen, { foreignKey: "imagen_id" });

// Usuario 1-n Coleccion
Usuario.hasMany(Coleccion, { foreignKey: "usuario_id" });
Coleccion.belongsTo(Usuario, { foreignKey: "usuario_id" });

// Publicacion n-m Etiqueta (por PublicacionEtiqueta)
Publicacion.belongsToMany(Etiqueta, {
  through: PublicacionEtiqueta,
  foreignKey: "publicacion_id",
});
Etiqueta.belongsToMany(Publicacion, {
  through: PublicacionEtiqueta,
  foreignKey: "etiqueta_id",
});

// Coleccion n-m Publicacion (por ColeccionPublicacion)
Coleccion.belongsToMany(Publicacion, {
  through: ColeccionPublicacion,
  foreignKey: "coleccion_id",
});
Publicacion.belongsToMany(Coleccion, {
  through: ColeccionPublicacion,
  foreignKey: "publicacion_id",
});

// AUTOREFERENCIA: Seguidores (Usuario n-m Usuario)
Usuario.belongsToMany(Usuario, {
  as: "Seguidores",
  through: Seguidor,
  foreignKey: "seguido_id",
  otherKey: "seguidor_id",
});

export {
  Usuario,
  Publicacion,
  Imagen,
  Comentario,
  Reaccion,
  Denuncia,
  Coleccion,
  Etiqueta,
  Seguidor,
  PublicacionEtiqueta,
  ColeccionPublicacion,
  MeInteresa,
};
