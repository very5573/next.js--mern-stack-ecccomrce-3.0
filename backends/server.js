import http from "http";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import connectDatabase from "./config/database.js";
import app from "./app.js";
import { initSocket } from "./socket/connection.js";

// =====================
// Load environment variables
// =====================
dotenv.config(); // ✅ root folder में .env है, path नहीं देना

// =====================
// Handle uncaught exceptions
// =====================
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    console.log("🔹 Starting server...");

    // =====================
    // Connect to MongoDB
    // =====================
    await connectDatabase();
    console.log("✅ Database connected");

    // =====================
    // Configure Cloudinary
    // =====================
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("✅ Cloudinary configured");

    // =====================
    // Create HTTP Server and Initialize Socket
    // =====================
    const server = http.createServer(app);
    const io = initSocket(server);
    app.set("io", io);

    // =====================
    // Start Server
    // =====================
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌐 Allowed Frontend: ${process.env.FRONTEND_URL}`);
    });

    // =====================
    // Handle unhandled promise rejections
    // =====================
    process.on("unhandledRejection", (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      console.error(err.stack);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error(`❌ Startup Error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
};

// Start the server
startServer();

export default startServer;
