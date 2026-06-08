import { Router } from "express";
import {
  getNotificaciones,
  postMarcarLeida,
} from "../controllers/notificaciones.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getNotificaciones);
router.post("/marcar-leida/:id", requireAuth, postMarcarLeida);

export default router;
