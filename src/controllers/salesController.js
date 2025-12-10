import Sale from "../database/models/Sale.js";
import Product from "../database/models/Product.js";
import Bundle from "../database/models/Bundle.js";
import { generateSaleCode } from "../utils/saleCode.js";

// Función para calcular el total (ganancia real)
function calcularTotal(subtotal, amountPaid, change) {
  if (amountPaid === 0) return change;
  if (amountPaid >= subtotal) return subtotal;
  return amountPaid;
}

// Obtener todas las ventas
export async function getSales(req, res) {
  try {
    const sales = await Sale.find()
      .populate("items.productId")
      .populate("items.bundleId")
      .sort({ date: -1 }); // orden descendente por fecha
    
    const formatted = sales.map(s => ({
      id: s._id,
      date: s.date,
      subtotal: s.subtotal,
      total: s.total,
      amountPaid: s.amountPaid,
      change: s.change,
      paymentMethod: s.paymentMethod,
      code: s.code,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      items: s.items,
    }));
    
      res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ventas", details: err.message });
  }
}

// Obtener una venta por ID
export async function getSaleById(req, res) {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.productId")
      .populate("items.bundleId");
    if (!sale) return res.status(404).json({ error: "Venta no encontrada" });
    
    const formatted = {
      id: sale._id,
      date: sale.date,
      subtotal: sale.subtotal,
      total: sale.total,
      amountPaid: sale.amountPaid,
      change: sale.change,
      paymentMethod: sale.paymentMethod,
      code: sale.code,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      items: sale.items,
    };
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener venta", details: err.message });
  }
}

// Crear una nueva venta
export async function createSale(req, res) {
  try {
    const { date, amountPaid, change, paymentMethod, items } = req.body;

    // Calcular subtotal sumando items
    let subtotal = 0;
    if (items && items.length > 0) {
      subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    }

    // Calcular total (ganancia real)
    const total = calcularTotal(subtotal, amountPaid, change);

    const newSale = new Sale({
      date,
      subtotal,
      total,
      amountPaid,
      change,
      paymentMethod,
      code: generateSaleCode(),
      items,
    });

    await newSale.save();

    // Actualizar stock
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.type === "product" && item.productId) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock = product.stock - item.quantity;
            await product.save();
          }
        }

        if (item.type === "bundle" && item.bundleId) {
          const bundle = await Bundle.findById(item.bundleId).populate("products.productId");
          if (bundle && bundle.products) {
            for (const p of bundle.products) {
              const totalToSubtract = p.quantity * item.quantity;
              const product = await Product.findById(p.productId);
              if (product) {
                product.stock = product.stock - totalToSubtract;
                await product.save();
              }
            }
          }
        }
      }
    }

    const saleWithItems = await Sale.findById(newSale._id)
      .populate("items.productId")
      .populate("items.bundleId");

    const formatted = {
      id: saleWithItems._id,
      date: saleWithItems.date,
      subtotal: saleWithItems.subtotal,
      total: saleWithItems.total,
      amountPaid: saleWithItems.amountPaid,
      change: saleWithItems.change,
      paymentMethod: saleWithItems.paymentMethod,
      code: saleWithItems.code,
      createdAt: saleWithItems.createdAt,
      updatedAt: saleWithItems.updatedAt,
      items: saleWithItems.items,
    };

    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al crear venta", details: err.message });
  }
}

// Eliminar una venta
export async function deleteSale(req, res) {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.productId")
      .populate("items.bundleId");

    if (!sale) return res.status(404).json({ error: "Venta no encontrada" });

    // Restaurar stock
    for (const item of sale.items) {
      if (item.type === "product" && item.productId) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock = product.stock + item.quantity;
          await product.save();
        }
      }

      if (item.type === "bundle" && item.bundleId) {
        const bundle = await Bundle.findById(item.bundleId).populate("products.productId");
        if (bundle && bundle.products) {
          for (const p of bundle.products) {
            const totalToAdd = p.quantity * item.quantity;
            const product = await Product.findById(p.productId);
            if (product) {
              product.stock = product.stock + totalToAdd;
              await product.save();
            }
          }
        }
      }
    }

    await sale.deleteOne();

    res.json({ message: "Venta eliminada correctamente y stock restaurado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar venta", details: err.message });
  }
}