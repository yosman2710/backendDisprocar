import { Router } from "express";
import { getReporteMermas, getReporteRendimiento, getReporteInventario } from "../controllers/reportes.controller.js";

const router = Router();

router.get("/mermas", getReporteMermas);
router.get("/rendimiento", getReporteRendimiento);
router.get("/inventario", getReporteInventario);

export default router;
