import Order from "../models/orderModel.js";
import mongoose from "mongoose"; // ES6 import
import Notification from "../models/notificationModel.js";
import sendNotification from "../utils/sendNotification.js";

import Product from "../models/productModel.js";

import { calcOrderPrices } from "../utils/calcOrderPrices.js";

const updateStockAtomic = async (productId, quantity, session) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      stock: { $gte: quantity }, // 🛑 prevent negative stock
    },
    {
      $inc: { stock: -quantity },
    },
    { new: true, session }
  );

  if (!product) {
    throw new Error("Insufficient stock for product");
  }
};
export const newOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingInfo, orderItems, paymentInfo } = req.body;

    // 🛑 Validate items
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items found",
      });
    }

    // 🛑 Prevent duplicate orders (payment safe)
    const existingOrder = await Order.findOne({
      "paymentInfo.id": paymentInfo.id,
      user: req.user._id,
    }).session(session);

    if (existingOrder) {
      await session.abortTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Order already exists with this payment ID.",
        order: existingOrder,
      });
    }

    /**
     * 🔥 ATOMIC STOCK DECREASE
     */
    for (const item of orderItems) {
      await updateStockAtomic(item.product, item.quantity, session);
    }

    // ✅ Calculate prices (backend safe)
    const { itemsPrice, taxPrice, shippingFee, totalPrice } = calcOrderPrices(
      orderItems,
      0.18
    );

    // ✅ Create order
    const order = await Order.create(
      [
        {
          shippingInfo,
          orderItems,
          paymentInfo,
          itemsPrice,
          taxPrice,
          shippingPrice: shippingFee,
          totalPrice,
          paidAt: Date.now(),
          user: req.user._id,
          stockUpdated: true, // 🔐 VERY IMPORTANT
          orderStatus: "Processing",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 🔔 Notify user
    const io = req.app.get("io");
    const productNames = orderItems.map((item) => item.name).join(", ");

    await sendNotification({
      io,
      userId: req.user._id,
      type: "order",
      title: "Order Placed Successfully",
      message: `Your order has been placed for: ${productNames}`,
      orderId: order[0]._id,
    });

    res.status(201).json({
      success: true,
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default { newOrder };

export const getSingleOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Order ID" });
    }

    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found with this Id" });

    // Optional: restrict to owner/admin
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get Single Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const allowedTransitions = {
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Soon", "Cancelled"],
  Soon: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

// Helper: return stock on cancel
const returnStockOnCancel = async (order, session) => {
  if (!order.stockUpdated) return;
  for (const item of order.orderItems) {
    await Product.updateOne(
      { _id: item.product._id },
      { $inc: { stock: item.quantity } },
      { session }
    );
  }
  order.stockUpdated = false;
  order.cancelledAt = Date.now();
};

// Helper: update status + timestamp
const updateOrderStatus = (order, status) => {
  order.orderStatus = status;
  if (status === "Soon") order.soonAt = Date.now();
  if (status === "Shipped") order.shippedAt = Date.now();
  if (status === "Delivered") order.deliveredAt = Date.now();
};

// Helper: send notifications
const notifyUser = async (io, order) => {
  const productNames = order.orderItems
    .map((i) => i.product?.name)
    .filter(Boolean);

  if (!productNames.length) return null;

  return await sendNotification({
    io,
    userId: order.user._id,
    type: "order",
    title: `Order #${order._id.toString().slice(-6)}`,
    message: `Order status updated to "${
      order.orderStatus
    }" for: ${productNames.join(", ")}`,
    orderId: order._id,
  });
};

// Main Controller
export const updateOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderIds, status: newStatus } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders provided",
      });
    }

    const io = req.app.get("io");
    const updatedOrders = [];
    const notifications = [];
    const invalidOrders = [];

    for (const orderId of orderIds) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) continue;

      const order = await Order.findById(orderId)
        .populate("user", "name email")
        .populate("orderItems.product", "name")
        .session(session);

      if (!order) continue;

      // Determine path to newStatus
      let currentStatus = order.orderStatus;
      const path = [];

      while (currentStatus !== newStatus) {
        const nextStatuses = allowedTransitions[currentStatus];
        if (!nextStatuses.includes(newStatus)) {
          if (nextStatuses.length === 0) {
            invalidOrders.push({
              orderId: order._id,
              reason: "Invalid transition",
            });
            break;
          }
          currentStatus = nextStatuses[0]; // step-by-step
        } else {
          currentStatus = newStatus;
        }
        path.push(currentStatus);
      }

      if (
        invalidOrders.find((i) => i.orderId.toString() === order._id.toString())
      ) {
        continue; // skip invalid transition
      }

      // Process each status in path
      for (const status of path) {
        if (
          status === "Cancelled" &&
          order.orderStatus !== "Cancelled" &&
          order.orderStatus !== "Delivered"
        ) {
          await returnStockOnCancel(order, session);
        }
        updateOrderStatus(order, status);
      }

      await order.save({ session, validateBeforeSave: false });
      updatedOrders.push(order);

      const notif = await notifyUser(io, order);
      if (notif) notifications.push(notif);
    }

    await session.commitTransaction();
    session.endSession();

    // Socket emit
    if (io && updatedOrders.length > 0) {
      io.emit(
        "orderUpdated",
        updatedOrders.map((o) => ({
          orderId: o._id,
          status: o.orderStatus,
        }))
      );
    }

    res.status(200).json({
      success: true,
      message: `${updatedOrders.length} orders updated successfully`,
      updatedOrders,
      notifications,
      invalidOrders,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ UPDATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const getAllOrders = async (req, res) => {
//   try {
//     const page = Math.max(parseInt(req.query.page) || 1, 1);
//     const limit = Math.min(parseInt(req.query.limit) || 10, 100);
//     const skip = (page - 1) * limit;

//     const {
//       search,
//       status,
//       sortBy = "createdAt",
//       order = "desc",
//       from,
//       to,
//     } = req.query;

//     const matchFilter = {};

//     // -----------------------
//     // STATUS FILTER
//     // -----------------------
//     if (status) matchFilter.orderStatus = status;

//     // -----------------------
//     // DATE FILTER
//     // -----------------------
//     if (from || to) {
//       const createdAtFilter = {};
//       if (from) {
//         const fromDate = new Date(from);
//         if (!isNaN(fromDate)) {
//           fromDate.setHours(0, 0, 0, 0);
//           createdAtFilter.$gte = fromDate;
//         }
//       }
//       if (to) {
//         const toDate = new Date(to);
//         if (!isNaN(toDate)) {
//           toDate.setHours(23, 59, 59, 999);
//           createdAtFilter.$lte = toDate;
//         }
//       }
//       if (Object.keys(createdAtFilter).length > 0)
//         matchFilter.createdAt = createdAtFilter;
//     }

//     // -----------------------
//     // SEARCH FILTER
//     // -----------------------
//     if (search) {
//       const orFilter = [
//         { "user.name": { $regex: `^${search}`, $options: "i" } },
//         { "user.email": { $regex: `^${search}`, $options: "i" } },
//       ];
//       if (mongoose.Types.ObjectId.isValid(search)) {
//         orFilter.push({ _id: new mongoose.Types.ObjectId(search) });
//       }
//       matchFilter.$or = orFilter;
//     }

//     // -----------------------
//     // SAFE SORT
//     // -----------------------
//     const allowedSortFields = ["createdAt", "totalPrice", "orderStatus"];
//     const safeSortBy = allowedSortFields.includes(sortBy)
//       ? sortBy
//       : "createdAt";

//     // -----------------------
//     // MAIN QUERY
//     // -----------------------
//     const orders = await Order.aggregate([
//       { $match: matchFilter },
//       { $sort: { [safeSortBy]: order === "asc" ? 1 : -1 } },
//       { $skip: skip },
//       { $limit: limit },
//       // -----------------------
//       // USER LOOKUP (only necessary fields)
//       // -----------------------
//       {
//         $lookup: {
//           from: "users",
//           localField: "user",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
//       {
//         $project: {
//           orderItems: 1,
//           shippingInfo: 1,
//           paymentInfo: 1,
//           totalPrice: 1,
//           orderStatus: 1,
//           deliveredAt: 1,
//           createdAt: 1,
//           "user._id": 1,
//           "user.name": 1,
//           "user.email": 1,
//         },
//       },
//       // -----------------------
//       // PRODUCT LOOKUP (only necessary fields)
//       // -----------------------
//       {
//         $lookup: {
//           from: "products",
//           localField: "orderItems.product",
//           foreignField: "_id",
//           as: "products",
//         },
//       },
//       {
//         $project: {
//           orderItems: 1,
//           shippingInfo: 1,
//           paymentInfo: 1,
//           totalPrice: 1,
//           orderStatus: 1,
//           deliveredAt: 1,
//           createdAt: 1,
//           user: 1,
//           products: { _id: 1, name: 1, price: 1, stock: 1 },
//         },
//       },
//     ]);

//     // -----------------------
//     // COUNT QUERY (lightweight)
//     // -----------------------
//     const totalOrders = await Order.countDocuments(matchFilter);

//     // -----------------------
//     // FORMAT RESPONSE
//     // -----------------------
//     const formattedOrders = orders.map((order) => ({
//       _id: order._id,
//       user: {
//         _id: order.user?._id || null,
//         name: order.user?.name || "Deleted User",
//         email: order.user?.email || "",
//       },
//       orderItems: order.orderItems.map((item) => {
//         const product = order.products.find(
//           (p) => p._id.toString() === item.product.toString()
//         );
//         return {
//           product: product?._id || null,
//           name: product?.name || "Deleted Product",
//           price: product?.price || 0,
//           quantity: item.quantity,
//           currentStock: product?.stock ?? 0,
//         };
//       }),
//       shippingInfo: order.shippingInfo,
//       paymentInfo: order.paymentInfo,
//       totalPrice: order.totalPrice,
//       orderStatus: order.orderStatus,
//       deliveredAt: order.deliveredAt,
//       createdAt: order.createdAt,
//     }));

//     res.status(200).json({
//       success: true,
//       totalOrders,
//       totalPages: Math.ceil(totalOrders / limit),
//       currentPage: page,
//       orders: formattedOrders,
//     });
//   } catch (error) {
//     console.error("Get All Orders Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export const getAllOrders = async (req, res, next) => {
  try {
    // 1️⃣ Read pagination safely
    let page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);

    // 2️⃣ Count total orders
    const totalOrders = await Order.countDocuments();

    // 3️⃣ Calculate total pages
    const totalPages = Math.ceil(totalOrders / limit) || 1;

    // 🔥 Critical fix: prevent invalid page
    if (page > totalPages) {
      page = totalPages;
    }

    const skip = (page - 1) * limit;

    // 4️⃣ Fetch paginated orders
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name price stock")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // 5️⃣ Calculate total amount for current page
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // 6️⃣ Send response
    res.status(200).json({
      success: true,
      totalOrders,
      totalPages,
      currentPage: page,
      limit,
      totalAmount,
      orders: orders.map((order) => ({
        _id: order._id,
        user: order.user,
        orderItems: order.orderItems.map((item) => ({
          product: item.product?._id || null,
          name: item.product?.name || "Deleted Product",
          price: item.product?.price || 0,
          quantity: item.quantity,
          currentStock: item.product?.stock ?? 0,
        })),
        shippingInfo: order.shippingInfo,
        paymentInfo: order.paymentInfo,
        totalPrice: order.totalPrice,
        orderStatus: order.orderStatus,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching orders",
    });
  }
};

export const deleteOrders = async (req, res) => {
  try {
    let { orderIds } = req.body;

    // ✅ Single ID ko bhi array bana do
    if (typeof orderIds === "string") {
      orderIds = [orderIds];
    }

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order IDs provided",
      });
    }

    // ✅ Sirf valid MongoDB ObjectIds allow karo
    const validIds = orderIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid order IDs found",
      });
    }

    // ✅ FAST BULK DELETE (No Loop)
    const result = await Order.deleteMany({
      _id: { $in: validIds },
    });

    res.status(200).json({
      success: true,
      message: "Orders deleted successfully",
      deletedCount: result.deletedCount,
      deletedOrders: validIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
