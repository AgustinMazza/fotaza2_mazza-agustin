import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const ColeccionPublicacion = sequelize.define("Coleccion_publicacion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  coleccion_id: { type: DataTypes.INTEGER, allowNull: false },
  publicacion_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default ColeccionPublicacion;
