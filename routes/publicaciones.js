import express from "express";
import {
  getPublicaciones,
  getCrearPublicacion,
  postCrearPublicacion,
  postComentar,
  postToggleComentarios,
  postVotar,
  postDenunciar,
  postMeInteresa,
  postEditarPublicacion,
} from "../controllers/publicacion.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getPublicaciones);
router.get("/crear", requireAuth, getCrearPublicacion);
router.post("/crear", requireAuth, postCrearPublicacion);

router.post("/comentar", requireAuth, postComentar);
router.post("/toggle-comentarios", requireAuth, postToggleComentarios);
router.post("/votar", requireAuth, postVotar);
router.post("/denunciar", requireAuth, postDenunciar);
router.post("/me-interesa", requireAuth, postMeInteresa);
router.post("/:id/editar", requireAuth, postEditarPublicacion);
export default router;
