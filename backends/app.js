import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import productRoutes from "./routes/productRoute.js";
import userRoutes from "./routes/userRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import cartRoutes from "./routes/cartRoutes.js";
import notificationRoutes from "./routes/notificationRoute.js";
import brandRoutes from "./routes/brandRoutes.js";

// =====================
// Load environment variables
// =====================
dotenv.config();

const app = express();

// =====================
// FRONTEND URL (ENV ONLY)
// =====================
const FRONTEND_URL = process.env.FRONTEND_URL?.trim();

if (!FRONTEND_URL) {
  console.error(
    "❌ FRONTEND_URL missing in environment variables. Production will fail!"
  );
}

// =====================
// CORS (Production-Safe)
// =====================
app.use(
  cors({
    origin: FRONTEND_URL,       // ONLY allow requests from ENV
    credentials: true,          // required for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  })
);

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =====================
// Sensitive routes limiter (login/register/etc)
// =====================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per IP in window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// =====================
// Routes
// =====================
// Public / sensitive routes with rate limiter
app.use("/api/v1/login", authLimiter);
app.use("/api/v1/register", authLimiter);
app.use("/api/v1/password/forgot", authLimiter);

// Normal routes (no heavy limiter)
app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", brandRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend running perfectly!");
});

// =====================
// 404 HANDLER
// =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;
