import { Router } from "express";
import { getPerfil, postActualizarPerfil } from "../controllers/perfil.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getPerfil);
router.post("/actualizar", requireAuth, postActualizarPerfil);

export default router;
