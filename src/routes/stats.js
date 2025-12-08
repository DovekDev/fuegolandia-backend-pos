import { Router } from "express";
import {
  getStatsSummary,
  getTopProducts,
  getLowStock,
} from "../controllers/statsController.js";

const router = Router();

router.get("/summary", getStatsSummary);
router.get("/top", getTopProducts);
router.get("/low-stock", getLowStock);

export default router;