import Bundle from "../database/models/Bundle.js";
import Product from "../database/models/Product.js";

// Obtener todos los bundles
export async function getBundles(req, res) {
  try {
    const bundles = await Bundle.find().populate("products.productId");

    const formatted = bundles.map(b => ({
      id: b._id,
      name: b.name,
      price: b.price,
      code: b.code,
      img: b.img,
      active: b.active,
      products: b.products.map(p => ({
        id: p.productId?._id,
        name: p.productId?.name,
        code: p.productId?.code,
        price: p.productId?.price,
        stock: p.productId?.stock,
        img: p.productId?.img,
        active: p.productId?.active,
        quantity: p.quantity,
      })),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener bolsones", details: err.message });
  }
}

// Obtener un bundle por ID
export async function getBundleById(req, res) {
  try {
    const bundle = await Bundle.findById(req.params.id).populate("products.productId");
    if (!bundle) return res.status(404).json({ error: "Bolsón no encontrado" });

    const formatted = {
      id: bundle._id,
      name: bundle.name,
      price: bundle.price,
      code: bundle.code,
      img: bundle.img,
      active: bundle.active,
      products: bundle.products.map(p => ({
        id: p.productId?._id,
        name: p.productId?.name,
        code: p.productId?.code,
        price: p.productId?.price,
        stock: p.productId?.stock,
        img: p.productId?.img,
        active: p.productId?.active,
        quantity: p.quantity,
      })),
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener bolsón", details: err.message });
  }
}

// Crear un nuevo bundle
export async function createBundle(req, res) {
  try {
    const { name, price, code, img, active, items } = req.body;

    const newBundle = new Bundle({
      name,
      price,
      code,
      img,
      active,
      products: items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })) || [],
    });

    await newBundle.save();

    const bundleWithItems = await Bundle.findById(newBundle._id).populate("products.productId");
    res.status(201).json(bundleWithItems);
  } catch (err) {
    res.status(500).json({ error: "Error al crear bolsón", details: err.message });
  }
}

// Actualizar bundle
export async function updateBundle(req, res) {
  try {
    const { name, price, code, img, active, items } = req.body;

    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ error: "Bolsón no encontrado" });

    bundle.name = name;
    bundle.price = price;
    bundle.code = code;
    bundle.img = img;
    bundle.active = active;
    bundle.products = items?.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })) || [];

    await bundle.save();

    const updatedBundle = await Bundle.findById(bundle._id).populate("products.productId");
    res.json(updatedBundle);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar bolsón", details: err.message });
  }
}

// Eliminar bundle
export async function deleteBundle(req, res) {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ error: "Bolsón no encontrado" });

    await bundle.deleteOne();

    res.json({ message: "Bolsón eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar bolsón", details: err.message });
  }
}