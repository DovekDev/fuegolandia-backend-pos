import { Router } from "express";
import {
  getBundles,
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
} from "../controllers/bundlesController.js";

const router = Router();

router.get("/", getBundles);
router.get("/:id", getBundleById);
router.post("/", createBundle);
router.put("/:id", updateBundle);
router.delete("/:id", deleteBundle);

export default router;