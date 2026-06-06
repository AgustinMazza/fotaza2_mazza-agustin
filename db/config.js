import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  define: {
    timestamps: false,
    freezeTableName: true,
  },
});

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("conexion a bd establecida");
    await sequelize.sync({ alter: true });
    console.log("sincronizando los modelos");
  } catch (err) {
    console.error("error en la conexion a la bd", err);
  }
}

export default sequelize;
