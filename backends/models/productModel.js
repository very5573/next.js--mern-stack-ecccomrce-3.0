import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter product Name"],
    trim: true,
  },


  description: {
    type: String,
    required: [true, "Please Enter product Description"],
  },

  price: {
    type: Number,
    required: [true, "Please Enter product Price"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },

  ratings: {
    type: Number,
    default: 0,
  },

  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],

  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: [true, "Please Select Product Category"],
    index: true, // 🔥 fast filter
  },

  stock: {
    type: Number,
    required: [true, "Please Enter product Stock"],
    default: 1,
  },

  numOfReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
    },
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
