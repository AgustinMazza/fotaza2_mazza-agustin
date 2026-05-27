import express from "express";
import { Publicacion, Imagen, Usuario } from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const listaPublicaciones = await Publicacion.findAll({
      include: [{ model: Imagen }, { model: Usuario }],
      order: [["fecha_creacion", "DESC"]],
    });

    res.render("publicaciones", {
      titulo: "Galería de Fotos",
      publicaciones: listaPublicaciones,
    });
  } catch (error) {
    console.error("Error al traer las publicaciones: ", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;
