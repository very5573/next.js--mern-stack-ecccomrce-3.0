"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import { AppButton } from "../../components/UI/Button";
import SelectBasic from "../UI/Select";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";

// Allowed transitions (backend compatible)
const allowedTransitions = {
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Soon", "Cancelled"],
  Soon: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

const OrderStatusUpdater = ({
  orderId,
  orderIds = [],
  currentStatus = "Processing",
  orderStatuses = {},
  onStatusChange,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [highlight, setHighlight] = useState(false);

  const isMultiple = orderIds.length > 0;

  // Update local state if currentStatus changes
  useEffect(() => {
    if (!isMultiple && currentStatus) setStatus(currentStatus);
  }, [currentStatus, isMultiple]);

  // Compute dropdown options
  const getStatusOptions = () => {
    if (!isMultiple) {
      // Single order: show current status first + allowed transitions
      return [currentStatus, ...(allowedTransitions[currentStatus] || [])];
    }

    // Bulk: only show statuses allowed for all selected orders
    const allOptions = orderIds
      .map((id) => {
        const st = orderStatuses[id] || "Processing";
        return [st, ...(allowedTransitions[st] || [])];
      })
      .filter(Boolean);

    if (!allOptions.length) return [];

    return allOptions.reduce((acc, options) =>
      acc.filter((s) => options.includes(s))
    );
  };

  const statusOptions = getStatusOptions();

  // Dropdown disabled only for Delivered/Cancelled or loading / no options
  const isDropdownDisabled =
    loading || statusOptions.length === 0 || ["Delivered", "Cancelled"].includes(currentStatus);

  // Button disabled if:
  // 1️⃣ Loading
  // 2️⃣ Current status is Delivered/Cancelled
  // 3️⃣ No change in selection
  const isButtonDisabled =
    loading || status === currentStatus || ["Delivered", "Cancelled"].includes(currentStatus);

  const handleUpdateClick = () => {
    if (!status || status === currentStatus) return;
    setShowModal(true);
  };

  const confirmUpdate = async () => {
    setLoading(true);
    try {
      const idsToUpdate = isMultiple ? orderIds : [orderId];

      const { data } = await API.put("/admin/orders", {
        orderIds: idsToUpdate,
        status,
      });

      toast.success(
        isMultiple
          ? `Selected ${data.updatedOrders.length} orders updated to "${status}"`
          : `Order updated to "${status}"`
      );

      // Highlight row / dropdown
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1500);

      // Refresh parent table
      onStatusChange && onStatusChange();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 w-full md:w-50 p-1 rounded transition-colors ${
        highlight ? "bg-green-100" : ""
      }`}
    >
      {/* STATUS DROPDOWN */}
      <SelectBasic
        value={status}
        onChange={setStatus}
        options={statusOptions}
        disabled={isDropdownDisabled}
      />

      {/* UPDATE BUTTON */}
      <AppButton
        variant="auto"
        color="primary"
        onClick={handleUpdateClick}
        disabled={isButtonDisabled}
      >
        {loading ? "Updating..." : "Update"}
      </AppButton>

      {/* CONFIRMATION MODAL */}
      <AlertDialogModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmUpdate}
        message={
          isMultiple
            ? `Are you sure you want to update ${orderIds.length} selected orders to "${status}"?`
            : `Are you sure you want to change status from "${currentStatus}" to "${status}"?`
        }
        confirmText="Update"
      />
    </div>
  );
};

export default OrderStatusUpdater;
