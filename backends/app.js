import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
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
dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
console.log("✅ FRONTEND_URL Loaded:", FRONTEND_URL);

const app = express();

// -------------------- CORS --------------------
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// -------------------- Middlewares --------------------
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// -------------------- Rate Limiters --------------------
// Sensitive routes limiter (login/register/etc)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per IP in window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// -------------------- Routes --------------------
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
// -------------------- Sanity Check --------------------
app.get("/", (req, res) => {
  res.send("✅ Backend running and CORS configured correctly!");
});

export default app;
