import { Router } from "express";
import { getBuscar } from "../controllers/buscar.js";

const router = Router();

router.get("/", getBuscar);

export default router;
