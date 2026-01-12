import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";

// ❌ पुराने options हटा दो
await mongoose.connect(
  "mongodb+srv://veertripathi583_db_user:Hydrogens@cluster0.79d8nw6.mongodb.net/yourDBName?retryWrites=true&w=majority"
);

console.log("🔌 MongoDB Connected");

const products = await Product.find();

for (const p of products) {
  const cat = await Category.findById(p.category);
  const brand = await Brand.findById(p.brand);

  p.categoryName = cat?.name || "";
  p.brandName = brand?.name || "";

  await p.save();
}

console.log("🔥 All products updated with categoryName & brandName");
process.exit();
