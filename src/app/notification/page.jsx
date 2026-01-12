"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  addLocalNotification,
  deleteNotificationAPI,
  clearAllNotificationsAPI,
  markReadAPI,
} from "@/redux/slices/notificationSlice";

/* ================= MUI ICONS ================= */
import {
  Notifications,
  LocalShipping,
  Warning,
  LocalOffer,
  Inventory2,
  Delete,
  ClearAll,
} from "@mui/icons-material";

import socket from "@/utils/socket";

function NotificationsPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { list: notifications, loading, error } = useSelector(
    (s) => s.notifications
  );

  const userId = user?._id || user?.id;

  /* ================= FETCH ================= */
  useEffect(() => {
    if (userId) dispatch(fetchNotifications(userId));
  }, [userId, dispatch]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!userId) return;
    if (!socket.connected) socket.connect();

    socket.emit("join", userId);
    const handler = (n) => dispatch(addLocalNotification(n));
    socket.on("notification", handler);

    return () => socket.off("notification", handler);
  }, [userId, dispatch]);

  /* ================= HELPERS ================= */
  const formatDate = (t) => new Date(t).toLocaleString();

  const getSection = (ts) => {
    const today = new Date();
    const d = new Date(ts);

    if (d.toDateString() === today.toDateString()) return "Today";
    if ((today - d) / 86400000 <= 7) return "This Week";
    return "Earlier";
  };

  const icons = {
    order: <Inventory2 className="text-white" />,
    delivery: <LocalShipping className="text-white" />,
    alert: <Warning className="text-white" />,
    promo: <LocalOffer className="text-white" />,
    default: <Notifications className="text-white" />,
  };

  const colors = {
    order: "bg-blue-500",
    delivery: "bg-green-500",
    alert: "bg-red-500",
    promo: "bg-yellow-500",
    default: "bg-gray-500",
  };

  /* ================= GROUP ================= */
  const grouped = { Today: [], "This Week": [], Earlier: [] };
  notifications.forEach((n) =>
    grouped[getSection(n.createdAt)].push(n)
  );

  /* ================= ACTIONS ================= */
  const handleDelete = (id) => dispatch(deleteNotificationAPI(id));
  const handleClearAll = () => dispatch(clearAllNotificationsAPI(userId));

  const handleMarkRead = (id) => {
    dispatch({
      type: "notifications/markReadAPI/fulfilled",
      payload: id,
    });
    dispatch(markReadAPI(id));
  };

  /* ================= STATES ================= */
  if (loading)
    return (
      <p className="text-center mt-20 text-gray-400 animate-pulse">
        Loading notifications...
      </p>
    );

  if (!loading && notifications.length === 0)
    return (
      <p className="text-center mt-20 text-gray-400">
        No notifications found.
      </p>
    );

  if (error)
    return (
      <p className="text-center mt-20 text-red-500">
        Error: {error}
      </p>
    );

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl mx-auto px-4 -mt-16 py-10">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between -mt-8 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Notifications
        </h1>

        <button
          onClick={handleClearAll}
          disabled={!notifications.length}
          className="
            flex items-center gap-2
            px-5 py-2.5 rounded-full
            bg-gradient-to-r from-red-500 to-red-600
            text-white font-medium
            shadow-lg shadow-red-500/30
            hover:scale-105 active:scale-95
            disabled:opacity-40
            transition-all
          "
        >
          <ClearAll fontSize="small" />
          Clear All
        </button>
      </div>

      {/* ================= SECTIONS ================= */}
      {["Today", "This Week", "Earlier"].map(
        (sec) =>
          grouped[sec].length > 0 && (
            <div key={sec} className="mb-12">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-gray-500">
                {sec}
              </h2>

              <div className="flex flex-col gap-4">
                {grouped[sec].map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleMarkRead(n._id)}
                    className={`
                      group flex items-center gap-4
                      p-5 rounded-3xl cursor-pointer
                      bg-white/80 backdrop-blur-md
                      shadow-md hover:shadow-2xl
                      transition-all duration-300
                      hover:-translate-y-1
                      ${
                        n.read
                          ? "opacity-70"
                          : "ring-1 ring-black/5"
                      }
                    `}
                  >
                    {/* ================= ICON ================= */}
                    <div
                      className={`
                        relative w-12 h-12 rounded-full
                        flex items-center justify-center
                        ${colors[n.type] || colors.default}
                      `}
                    >
                      {icons[n.type] || icons.default}

                      {!n.read && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* ================= CONTENT ================= */}
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          n.read
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {n.type}
                      </p>

                      <p
                        className={`text-sm mt-0.5 ${
                          n.read
                            ? "line-through text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {n.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>

                    {/* ================= DELETE ================= */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n._id);
                      }}
                      className="
                        p-2 rounded-full
                        text-red-500
                        opacity-0 group-hover:opacity-100
                        hover:bg-red-100
                        transition-all
                      "
                    >
                      <Delete fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}

export default NotificationsPage;
