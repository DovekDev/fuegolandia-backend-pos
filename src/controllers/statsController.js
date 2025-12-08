import Sale from "../database/models/Sale.js";
import Product from "../database/models/Product.js";

// Resumen de totales
export async function getStatsSummary(req, res) {
  try {
    // Total de todas las ventas
    const totalAllAgg = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalAll = totalAllAgg.length > 0 ? totalAllAgg[0].total : 0;

    // Total de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTodayAgg = await Sale.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalToday = totalTodayAgg.length > 0 ? totalTodayAgg[0].total : 0;

    res.json({ totalAll, totalToday });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener resumen", details: err.message });
  }
}

// Top productos más/menos vendidos
export async function getTopProducts(req, res) {
  try {
    const { order = "desc", limit = 5 } = req.query;

    const itemsAgg = await Sale.aggregate([
      { $unwind: "$items" }, // descomponer array de items
      { $match: { "items.type": "product" } },
      { $group: { _id: "$items.productId", totalQuantity: { $sum: "$items.quantity" } } },
      { $sort: { totalQuantity: order === "asc" ? 1 : -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Traer datos de producto
    const result = await Promise.all(
      itemsAgg.map(async (i) => {
        const product = await Product.findById(i._id);
        return {
          productId: i._id,
          name: product?.name || "Desconocido",
          quantity: i.totalQuantity,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener top productos", details: err.message });
  }
}

// Productos con bajo stock
export async function getLowStock(req, res) {
  try {
    const { threshold = 5 } = req.query;
    const products = await Product.find({ stock: { $lte: parseInt(threshold) } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos con bajo stock", details: err.message });
  }
}