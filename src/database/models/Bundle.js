import mongoose from "mongoose";

const bundleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      sparse: true, // permite que sea opcional pero único si existe
      maxlength: 50,
    },
    img: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // Array de productos con cantidad
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // referencia al modelo Product
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
);

export default mongoose.model("Bundle", bundleSchema);