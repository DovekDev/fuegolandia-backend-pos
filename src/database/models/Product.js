import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // MongoDB genera automáticamente un _id único, no necesitamos definirlo
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    },
    price: {
      type: Number, // MongoDB no tiene DECIMAL, usamos Number
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    img: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // crea automáticamente createdAt y updatedAt
  }
);

export default mongoose.model("Product", productSchema);