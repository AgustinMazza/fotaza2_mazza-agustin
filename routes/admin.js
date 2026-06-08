import { Router } from "express";
import {
  getAdmin,
  postDarDeBaja,
  postDesestimar,
} from "../controllers/admin.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, getAdmin);
router.post("/dar-de-baja/:id", requireAuth, requireAdmin, postDarDeBaja);
router.post("/desestimar/:id", requireAuth, requireAdmin, postDesestimar);

export default router;
