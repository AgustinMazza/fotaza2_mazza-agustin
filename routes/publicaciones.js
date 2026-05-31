import express from "express";
import {
  getPublicaciones,
  getCrearPublicacion,
  postCrearPublicacion,
} from "../controllers/publicacion.js";
import { requireAuth } from "../middleware/auth.js"; // descomentar cuando tengas sesiones

const router = express.Router();

router.get("/", getPublicaciones);

router.get("/crear", requireAuth, getCrearPublicacion);

router.post("/crear", requireAuth, postCrearPublicacion);

export default router;
