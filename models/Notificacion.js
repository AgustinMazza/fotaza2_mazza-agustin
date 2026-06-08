import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Notificacion = sequelize.define("Notificacion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  origen_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  leida: { type: DataTypes.BOOLEAN, defaultValue: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Notificacion;
