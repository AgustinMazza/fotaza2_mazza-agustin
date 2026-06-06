import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Publicacion = sequelize.define("Publicacion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  comentarios_cerrados: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Publicacion;
