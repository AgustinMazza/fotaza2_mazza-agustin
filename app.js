import "dotenv/config";
import express from "express";
import publicacionesRouter from "./routes/publicaciones.js";
import { connectDatabase } from "./models/index.js";

const app = express();
connectDatabase();

//constantes
const PORT = process.env.PORT;

//middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

//motor de plantillas
app.set("view engine", "pug");
app.set("views", "./views");

//bootstrap
app.use("/dist", express.static("node_modules/bootstrap/dist"));

//rutas
app.use("/publicaciones", publicacionesRouter);

app.get("/", (req, res) => {
  res.render("index", { titulo: "Fotaza 2 - Inicio" });
});

app.get("/fotos", (req, res) => {
  res.render("fotos");
});

//servidor
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error al iniciar servidor: ", err);
    return;
  }
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
