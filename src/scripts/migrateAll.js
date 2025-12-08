import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Product from "../database/models/Product.js";
import Bundle from "../database/models/Bundle.js";
import Sale from "../database/models/Sale.js";

dotenv.config();

function calcularTotal(subtotal, amountPaid, change) {
  let total = amountPaid - Math.max(change, 0);
  if (amountPaid === 0) total = 0;
  return total;
}

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    // --- 1. Importar productos ---
    const rawProducts = JSON.parse(fs.readFileSync("./src/data/products.json", "utf-8"));
    const productsData = rawProducts.find(entry => entry.type === "table" && entry.name === "products").data;

    const productIdMap = {};
    for (const p of productsData) {
      const newProduct = await Product.create({
        name: p.name,
        code: p.code,
        price: parseFloat(p.price),
        stock: parseInt(p.stock),
        img: p.img || null,
        active: p.active === "1",
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      });
      productIdMap[p.id] = newProduct._id;
    }
    console.log("✅ Productos importados:", Object.keys(productIdMap).length);

    // --- 2. Importar bundles ---
    const rawBundles = JSON.parse(fs.readFileSync("./src/data/bundles.json", "utf-8"));
    const bundlesData = rawBundles.find(entry => entry.type === "table" && entry.name === "bundles").data;

    const rawBundleItems = JSON.parse(fs.readFileSync("./src/data/bundle_items.json", "utf-8"));
    const bundleItemsData = rawBundleItems.find(entry => entry.type === "table" && entry.name === "bundle_items").data;

    const bundleIdMap = {};
    for (const b of bundlesData) {
      const items = bundleItemsData
        .filter(i => i.bundleId === b.id)
        .map(i => ({
          productId: productIdMap[i.productId],
          quantity: parseInt(i.quantity),
        }));

      const newBundle = await Bundle.create({
        name: b.name,
        price: parseFloat(b.price),
        code: b.code,
        img: b.img || null,
        active: b.active === "1",
        products: items,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      });

      bundleIdMap[b.id] = newBundle._id;
    }
    console.log("✅ Bundles importados:", bundlesData.length);

    // --- 3. Importar ventas ---
    const rawSales = JSON.parse(fs.readFileSync("./src/data/sales.json", "utf-8"));
    const salesData = rawSales.find(entry => entry.type === "table" && entry.name === "sales").data;

    const rawSaleItems = JSON.parse(fs.readFileSync("./src/data/sale_items.json", "utf-8"));
    const saleItemsData = rawSaleItems.find(entry => entry.type === "table" && entry.name === "sale_items").data;

    for (const s of salesData) {
      const items = saleItemsData.filter(i => i.saleId === s.id).map(i => ({
        productId: i.productId ? productIdMap[i.productId] : null,
        bundleId: i.bundleId ? bundleIdMap[i.bundleId] : null,
        quantity: parseInt(i.quantity),
        unitPrice: parseFloat(i.unitPrice),
        type: i.type,
      }));

      const subtotal = parseFloat(s.subtotal);
      const amountPaid = parseFloat(s.amountPaid);
      const change = parseFloat(s.change);
      const total = calcularTotal(subtotal, amountPaid, change);

      await Sale.create({
        date: new Date(s.date),
        subtotal,
        total,
        amountPaid,
        change,
        paymentMethod: s.paymentMethod,
        code: s.code,
        items,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      });
    }
    console.log("✅ Ventas importadas:", salesData.length);

    console.log("🎉 Migración completa: productos, bundles y ventas");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en la migración:", err);
    process.exit(1);
  }
}

migrate();