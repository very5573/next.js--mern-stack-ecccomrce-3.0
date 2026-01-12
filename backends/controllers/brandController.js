import Brand from "../models/brandModel.js";
import cloudinary from "cloudinary";

// Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  return await cloudinary.v2.uploader.upload(dataUri, {
    folder: "brands",
    resource_type: "image",
    quality: "auto",
    fetch_format: "auto",
  });
};

// Create Brand (Admin)
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    // Multer saves file in req.file
    if (!name || !req.file) {
      return res.status(400).json({ message: "Name & logo required" });
    }

    const uploaded = await uploadToCloudinary(req.file);

    const brand = await Brand.create({
      name,
      logo: {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      },
    });

    res.status(201).json({ success: true, brand });
  } catch (err) {
    console.error("Create Brand Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, brands });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });
    res.status(200).json({ success: true, brand });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete / deactivate brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Brand deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
