import jwt from "jsonwebtoken"; // ✅ Make sure this is imported
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import sendNotification from "../utils/sendNotification.js";

import sendToken from "../utils/jwtToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import mongoose from "mongoose"; // ES6 import

import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js"; // अगर sendEmail function u
import { formatUser } from "../utils/formatUser.js";

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role createdAt avatar"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (err) {
    console.error("❌ Get User Error:", err);
  }
};

// backend/controllers/adminController.js
// backend/controllers/adminController.js

export const getActiveUsers = async (req, res) => {
  try {
    const users = await User.find(); // all users
    const currentUserId = req.user?.id;

    const activeUsers = users.filter(
      (user) => user.isActive || user._id.toString() === currentUserId
    );
    const blockedUsers = users.filter((user) => user.isBlocked);

    // Mark current user
    const usersWithCurrentFlag = users.map((user) => ({
      ...user.toObject(),
      currentUser: user._id.toString() === currentUserId,
    }));

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      blockedUsers: blockedUsers.length,
      users: usersWithCurrentFlag,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const refreshToken = async (req, res) => {
  try {
    console.log("♻️ Refresh Token route hit");

    const cookieRefreshToken = req.cookies?.refreshToken;
    console.log(
      "🍪 Incoming refresh token:",
      cookieRefreshToken ? "Present ✅" : "Missing ❌"
    );

    if (!cookieRefreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Decode token to get user ID
    let decoded;
    try {
      decoded = jwt.verify(cookieRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      console.log("🔐 Refresh token decoded:", decoded);
    } catch (err) {
      console.log("❌ Invalid or expired refresh token");
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Fetch user with hashed refresh token
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) {
      console.log("⚠️ User not found in DB");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Verify cookie token against hashed DB token
    const isValid = await bcrypt.compare(cookieRefreshToken, user.refreshToken);
    if (!isValid) {
      console.log("❌ Refresh token does not match DB hash");
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    console.log("✅ Generating new tokens for:", user.email);
    sendToken(user, 200, res);

  } catch (err) {
    console.error("💥 Refresh token error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUploadSignature = (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.v2.utils.api_sign_request(
      { timestamp, folder: "avatars" },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: "avatars",
    });
  } catch (err) {
    console.error("❌ Signature Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // ✅ Check if user exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ✅ Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      avatar: avatar
        ? { url: avatar.url, public_id: avatar.public_id }
        : {
            url: "https://via.placeholder.com/150?text=No+Avatar",
            public_id: null,
          },
    });

    // ============================================
    // ✅ UNIVERSAL NOTIFICATION (BEST PRACTICE)
    // ============================================

    const io = req.app.get("io");

    await sendNotification({
      io,
      userId: user._id,
      type: "alert",
      title: "Welcome!",
      message: "Your account has been successfully created.",
    });

    // ✅ Send token response
    sendToken(user, 201, res, "Registration successful");
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, avatar } = req.body;

//     // 🧩 1️⃣ Basic Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // 🧩 2️⃣ Check Existing User
//     const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     // 🧩 3️⃣ Create New User Instance (Not saved yet)
//     const user = new User({
//       name: name.trim(),
//       email: email.toLowerCase().trim(),
//       password, // Pre-save hook will hash this
//       avatar: {
//         url: "https://via.placeholder.com/150?text=No+Avatar",
//         public_id: null,
//       },
//     });

//     // 🧩 4️⃣ Avatar Upload (Optional)
//     if (avatar && avatar.url) {
//       try {
//         const uploadResult = await cloudinary.v2.uploader.upload(avatar.url, {
//           folder: "avatars",
//           width: 150,
//           crop: "scale",
//         });

//         user.avatar = {
//           url: uploadResult.secure_url,
//           public_id: uploadResult.public_id,
//         };
//       } catch (uploadErr) {
//         console.error("⚠️ Cloudinary Upload Failed:", uploadErr.message);
//       }
//     }

//     // 🧩 5️⃣ Extra Features (for production-level logic)
//     user.name = user.name.replace(/\s+/g, " "); // Remove double spaces
//     user.createdAt = new Date();
//     user.isVerified = false; // Default: user not verified
//     user.role = "user"; // Default role

//     // 🧩 6️⃣ Save User to Database
//     await user.save();

//     // 🧩 7️⃣ Send Token (JWT + Cookie)
//     sendToken(user, 201, res, "Registration successful");

//   } catch (err) {
//     console.error("❌ Register Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error, please try again later",
//     });
//   }
// };

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, avatar } = req.body;

//     // Backend Validation
//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields required" });
//     }

//     // ✅ New Method: Declare once, assign conditionally
//     let user = await User.findOne({ email: email.toLowerCase().trim() });

//     if (!user) {
//       user = await User.create({
//         name,
//         email: email.toLowerCase().trim(),
//         password, // hashed automatically via User model pre-save hook
//         avatar: avatar
//           ? { url: avatar.url, public_id: avatar.public_id }
//           : { url: "https://via.placeholder.com/150?text=No+Avatar", public_id: null },
//       });
//     } else {
//       // ❌ Old Method (commented)
//       /*
//       const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
//       if (existingUser) {
//         return res
//           .status(400)
//           .json({ success: false, message: "User already exists" });
//       }
//       */
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     // Send JWT token with custom message
//     sendToken(user, 201, res, "Registration successful");
//   } catch (err) {
//     console.error("❌ Register Error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter Email & Password",
      });
    }

    // ✅ Find user with password
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ✅ Compare password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ============================================
    // ✅ UNIVERSAL LOGIN NOTIFICATION
    // ============================================

    const io = req.app.get("io");

    await sendNotification({
      io,
      userId: user._id,
      type: "alert",
      title: "Login Successful",
      message: "A new login to your account was detected.",
    });

    // ✅ Send token + response
    sendToken(user, 200, res, "Login successful");
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    // 🔹 1️⃣ Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        // 🔹 2️⃣ Verify refresh token
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        // 🔹 3️⃣ Find user & clear refresh token from DB
        const user = await User.findById(decoded.id);
        if (user) {
          await user.clearRefreshToken(); // ✅ model method
        }
      } catch (err) {
        // ❌ Invalid / expired refresh token → ignore
      }
    }

    // 🔹 4️⃣ Clear cookies (always)
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
    });

    // 🔹 5️⃣ Response
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
        resetToken,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset Password Token is invalid or has expired",
      });
    }

    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide both passwords" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // ============================================
    // ✅ UNIVERSAL PASSWORD UPDATE NOTIFICATION
    // ============================================

    const io = req.app.get("io");

    await sendNotification({
      io,
      userId: user._id,
      type: "alert",
      title: "Password Updated",
      message: "Your account password was changed successfully.",
    });

    // ✅ Send token
    sendToken(user, 200, res, "Password updated successfully");
  } catch (err) {
    console.error("❌ Update Password Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId (best practice)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // ✅ Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User does not exist with ID: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Error fetching single user:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Update
// Update User Role

// Update User Role -- Admin

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body; // avatar = { url, public_id }

    // ✅ Auth middleware से req.user.id आना चाहिए
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Email update check (case insensitive)
    if (email && email.toLowerCase().trim() !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
      user.email = email.toLowerCase().trim();
    }

    // ✅ Name update
    if (name) user.name = name.trim();

    // ✅ Avatar update
    if (avatar && avatar.url && avatar.public_id) {
      // पुराना avatar delete करो अगर है तो
      if (user.avatar?.public_id) {
        try {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        } catch (err) {
          console.warn("⚠️ Failed to delete old avatar:", err.message);
        }
      }
      user.avatar = { url: avatar.url, public_id: avatar.public_id };
    }

    await user.save();

    // ✅ Success response (अगर JWT payload में info है तो नया token भेजो)
    sendToken(user, 200, res, "Profile updated successfully");
  } catch (err) {
    console.error("❌ UpdateProfile Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: err.message,
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId (best practice)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // ✅ Prepare new user data
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    // ✅ Update user
    const updatedUser = await User.findByIdAndUpdate(id, newUserData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: `User not found with ID: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Get All Users
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete User -- Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId (best practice)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // ✅ Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User does not exist with ID: ${id}`,
      });
    }

    // ✅ Delete Cloudinary avatar if exists
    const imageId = user.avatar?.public_id;
    if (imageId) {
      await cloudinary.v2.uploader.destroy(imageId);
    }

    // ✅ Delete user from MongoDB
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
