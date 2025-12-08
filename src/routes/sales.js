import { Router } from "express";
import {
  getSales,
  getSaleById,
  createSale,
  deleteSale,
} from "../controllers/salesController.js";

const router = Router();

router.get("/", getSales);
router.get("/:id", getSaleById);
router.post("/", createSale);
router.delete("/:id", deleteSale);

export default router;