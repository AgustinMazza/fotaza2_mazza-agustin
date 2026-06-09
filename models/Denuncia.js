import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

const Denuncia = sequelize.define("Denuncia", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  imagen_id: { type: DataTypes.INTEGER, allowNull: false },
  motivo: { type: DataTypes.STRING, allowNull: false },
  estado: {
    type: DataTypes.ENUM("pendiente", "aprobada", "desestimada"),
    defaultValue: "pendiente",
  },
});

export default Denuncia;
