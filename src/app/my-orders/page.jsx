"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import API from "../../utils/axiosInstance";
import { format } from "date-fns";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/orders/me");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(
        "❌ Failed to fetch orders:",
        err.response?.data?.message || err.message
      );
      setError("Failed to fetch your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Desktop Table Rows
  const desktopRows = useMemo(
    () =>
      orders.map((order) => (
        <tr
          key={order._id}
          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td className="px-4 py-3 border-r border-gray-200">{order._id}</td>
          <td className="px-4 py-3 border-r border-gray-200">
            {format(new Date(order.createdAt), "dd/MM/yyyy")}
          </td>
          <td className="px-4 py-3 border-r border-gray-200">
            {currencyFormatter.format(order.totalPrice)}
          </td>
          <td className="px-4 py-3 border-r border-gray-200">
            {order.paymentInfo?.status || "N/A"}
          </td>
          <td className="px-4 py-3">
            <Link
              href={`/my-orders/${order._id}`}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-semibold hover:bg-yellow-600 transition"
            >
              View
            </Link>
          </td>
        </tr>
      )),
    [orders]
  );

  // Mobile Cards
  const mobileCards = useMemo(
    () =>
      orders.map((order) => (
        <div
          key={order._id}
          className="mb-4 border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col bg-white hover:shadow-md transition"
        >
          <div className="border-b border-gray-200 pb-1 mb-1">
            <span className="font-semibold text-gray-700">Order ID:</span>{" "}
            {order._id}
          </div>
          <div className="border-b border-gray-200 pb-1 mb-1">
            <span className="font-semibold text-gray-700">Date:</span>{" "}
            {format(new Date(order.createdAt), "dd/MM/yyyy")}
          </div>
          <div className="border-b border-gray-200 pb-1 mb-1">
            <span className="font-semibold text-gray-700">Total:</span>{" "}
            {currencyFormatter.format(order.totalPrice)}
          </div>
          <div className="pb-1 mb-1">
            <span className="font-semibold text-gray-700">Payment Status:</span>{" "}
            {order.paymentInfo?.status || "N/A"}
          </div>
          <Link
            href={`/my-orders/${order._id}`}
            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-semibold text-center hover:bg-yellow-600 transition"
          >
            View Details
          </Link>
        </div>
      )),
    [orders]
  );

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen space-x-2 bg-gray-50">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-700 font-medium">Loading your orders...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-2 bg-gray-50">
        <span className="text-red-600 font-medium">{error}</span>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-white transition"
        >
          Retry
        </button>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <span className="text-gray-700 font-medium">No orders found.</span>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto -mt-16">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        My Orders
      </h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-200 border-collapse shadow-sm rounded-lg bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 border-r border-gray-200 text-left text-gray-700 font-medium">
                Order ID
              </th>
              <th className="px-4 py-3 border-r border-gray-200 text-left text-gray-700 font-medium">
                Date
              </th>
              <th className="px-4 py-3 border-r border-gray-200 text-left text-gray-700 font-medium">
                Total
              </th>
              <th className="px-4 py-3 border-r border-gray-200 text-left text-gray-700 font-medium">
                Payment Status
              </th>
              <th className="px-4 py-3 text-left text-gray-700 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>{desktopRows}</tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden mt-4">{mobileCards}</div>
    </div>
  );
};

export default MyOrdersPage;
