import { Router } from "express";
import { getBuscar } from "../controllers/buscar.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getBuscar);

export default router;
