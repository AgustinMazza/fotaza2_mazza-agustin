import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Etiqueta = sequelize.define("Etiqueta", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
});

export default Etiqueta;
