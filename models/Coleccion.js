import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Coleccion = sequelize.define("Coleccion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default Coleccion;
