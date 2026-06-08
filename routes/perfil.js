import { Router } from "express";
import {
  getPerfil,
  postActualizarPerfil,
  postSeguir,
  postDejarDeSeguir,
  getPerfilPublico,
  getSeguidores,
  getSiguiendo,
} from "../controllers/perfil.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getPerfil);
router.post("/actualizar", requireAuth, postActualizarPerfil);
router.get("/seguidores", requireAuth, getSeguidores);
router.get("/siguiendo", requireAuth, getSiguiendo);
router.get("/:id", requireAuth, getPerfilPublico);
router.post("/seguir/:id", requireAuth, postSeguir);
router.post("/dejar-de-seguir/:id", requireAuth, postDejarDeSeguir);

export default router;
