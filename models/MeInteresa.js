import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const MeInteresa = sequelize.define("MeInteresa", {
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imagen_id:           { type: DataTypes.INTEGER, allowNull: false },
  usuario_id:          { type: DataTypes.INTEGER, allowNull: false }, // quien tiene interés
});

export default MeInteresa;
