import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Importar rutas
import productsRoutes from "./routes/products.js";
import bundlesRoutes from "./routes/bundles.js";
import salesRoutes from "./routes/sales.js";
import statsRoutes from "./routes/stats.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir React Build (frontend)
app.use(express.static(path.join(__dirname, "../public")));

// Rutas principales
app.use("/api/products", productsRoutes);
app.use("/api/bundles", bundlesRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/stats", statsRoutes);

// Fallback: servir index.html para rutas no encontradas
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app;