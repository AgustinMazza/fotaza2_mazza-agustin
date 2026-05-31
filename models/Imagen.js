import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Imagen = sequelize.define("Imagen", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  direccion_foto: { type: DataTypes.BLOB("long"), allowNull: false }, // guarda los bytes de la imagen
  publicacion_id: { type: DataTypes.INTEGER, allowNull: false },
  copyright: { type: DataTypes.BOOLEAN, defaultValue: false },
  marca_agua: { type: DataTypes.STRING, defaultValue: "" },
  cont_denuncias: { type: DataTypes.INTEGER, defaultValue: 0 },
  bloqueada: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Imagen;
