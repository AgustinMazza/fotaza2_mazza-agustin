import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Comentario = sequelize.define("Comentario", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  publicacion_id: { type: DataTypes.INTEGER, allowNull: false },
  texto: { type: DataTypes.TEXT, allowNull: false },
  bloqueado: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Comentario;
