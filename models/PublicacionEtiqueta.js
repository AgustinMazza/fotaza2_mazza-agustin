import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const PublicacionEtiqueta = sequelize.define("publicacion_etiqueta", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  etiqueta_id: { type: DataTypes.INTEGER, allowNull: false },
  publicacion_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default PublicacionEtiqueta;
