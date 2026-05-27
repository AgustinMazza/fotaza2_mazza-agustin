import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  foto_perfil: { type: DataTypes.TEXT, allowNull: true },
  nombre_usuario: { type: DataTypes.STRING, allowNull: false },
  mail: { type: DataTypes.STRING, allowNull: false },
  contraseña: { type: DataTypes.STRING, allowNull: false },
  estado: { type: DataTypes.BOOLEAN, defaultValue: true },
  admin: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default Usuario;
