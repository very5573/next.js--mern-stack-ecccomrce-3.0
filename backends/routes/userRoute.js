import express from "express";
import rateLimit from "express-rate-limit";

import {
  getActiveUsers,
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
  refreshToken,
  getUploadSignature,
} from "../controllers/userController.js";

import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// -------------------- Rate Limiters --------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, 
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// -------------------- Public routes --------------------
router.route("/register").post(authLimiter, registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/password/forgot").post(authLimiter, forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").post(logout);

// Refresh token & upload signature
router.get("/get-signature", getUploadSignature);
router.route("/refresh-token").get(refreshToken);

// -------------------- Authenticated routes --------------------
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

// -------------------- Admin routes --------------------
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router
  .route("/admin/users/active")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getActiveUsers);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
