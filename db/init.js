import "../models/index.js";
import { connectDatabase } from "./config.js";

console.log("Inicializando base de datos...");
await connectDatabase();
console.log("Base de datos inicializada correctamente.");
process.exit(0);
