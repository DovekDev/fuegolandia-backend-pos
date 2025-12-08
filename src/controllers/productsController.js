import Product from "../database/models/Product.js";

// Obtener todos los productos
export async function getProducts(req, res) {
  try {
    const products = await Product.find(); // Mongoose usa find() en lugar de findAll()
    
    const formatted = products.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      code: p.code,
      img: p.img,
      active: p.active,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos", details: err.message });
  }
}

// Obtener un producto por ID
export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id); // findById reemplaza a findByPk
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const formatted = {
      id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      code: product.code,
      img: product.img,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener producto", details: err.message });
  }
}

// Crear producto
export async function createProduct(req, res) {
  try {
    const { name, code, price, stock, img, active } = req.body;
    const newProduct = await Product.create({ name, code, price, stock, img, active });
    
    const formatted = {
      id: newProduct._id,
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      code: newProduct.code,
      img: newProduct.img,
      active: newProduct.active,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
    };
    
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Error al crear producto", details: err.message });
  }
}

// Actualizar producto
export async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    // Actualizamos con los datos del body
    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar producto", details: err.message });
  }
}

// Eliminar producto
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    await product.deleteOne(); // en Mongoose usamos deleteOne() o remove()
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar producto", details: err.message });
  }
}