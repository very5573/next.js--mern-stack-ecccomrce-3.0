"use client";

import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { AppButton } from "../UI/Button";

export default function OrderSearchFilter({ onApply }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const applyFilters = () => {
    const filters = {};
    if (search.trim()) filters.search = search.trim();
    if (status) filters.status = status;
    filters.sortBy = sortBy;
    filters.order = order;
    if (from) filters.from = from;
    if (to) filters.to = to;
    onApply(filters);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setSortBy("createdAt");
    setOrder("desc");
    setFrom("");
    setTo("");
    onApply({ sortBy: "createdAt", order: "desc" });
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-700 bg-neutral-900/70 backdrop-blur p-5 shadow-lg">
      {/* 🔍 Search (COMPACT) */}
      <div className="mb-6 flex justify-between items-end gap-4 flex-wrap">
        <div className="w-full sm:w-80">
          <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
            Search Orders
          </label>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-[20px]" />
            <input
              type="text"
              placeholder="Order ID / User / Email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full pl-10 pr-3 py-2
                rounded-lg bg-neutral-800
                border border-neutral-700
                text-sm text-white
                placeholder-neutral-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
          </div>
        </div>
      </div>

      {/* 🎛 Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Soon">Soon</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Date</option>
            <option value="totalPrice">Amount</option>
          </select>
        </div>

        {/* Order */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
            Order
          </label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* From */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* To */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-400 mb-1">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 🔘 Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <AppButton variant="outlined" onClick={resetFilters}>
          Reset
        </AppButton>
        <AppButton variant="contained" onClick={applyFilters}>
          Apply Filters
        </AppButton>
      </div>
    </div>
  );
}
