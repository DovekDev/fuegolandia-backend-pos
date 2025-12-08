import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // referencia al modelo Product
    },
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle", // referencia al modelo Bundle
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["product", "bundle"],
      required: true,
    },
  },
  { _id: false } // no necesitamos un id propio para cada item
);

const saleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia"],
      default: "efectivo",
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
      maxlength: 50,
    },
    items: [saleItemSchema], // array de ítems embebidos
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
);

export default mongoose.model("Sale", saleSchema);