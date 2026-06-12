import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDatabase } from "./config.js";
import { Usuario } from "../models/index.js";

await connectDatabase();

await Usuario.findOrCreate({
  where: { mail: "usuario@fotaza.com" },
  defaults: {
    nombre_usuario: "usuario_prueba",
    mail: "usuario@fotaza.com",
    contraseña: await bcrypt.hash("123456", 10),
    estado: true,
    admin: false,
  },
});

await Usuario.findOrCreate({
  where: { mail: "admin@fotaza.com" },
  defaults: {
    nombre_usuario: "admin_fotaza",
    mail: "admin@fotaza.com",
    contraseña: await bcrypt.hash("123456", 10),
    estado: true,
    admin: true,
  },
});

console.log("Seed completado.");
process.exit(0);
