import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Reaccion = sequelize.define("Reaccion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  imagen_id: { type: DataTypes.INTEGER, allowNull: false },
  estrellas: { type: DataTypes.INTEGER, allowNull: false },
});

export default Reaccion;
