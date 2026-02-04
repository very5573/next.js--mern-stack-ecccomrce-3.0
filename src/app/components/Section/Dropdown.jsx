"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../../../redux/slices/notificationSlice";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function ThreeDotDropdown() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?._id);
  const { unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [userId, dispatch]);

  // ✅ Outside click → close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !buttonRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      {/* ✅ 3-dot icon → hover = open */}
      <IconButton
        ref={buttonRef}
        onMouseEnter={() => setMenuOpen(true)}
        className="!text-white hover:bg-white/10"
      >
        <MoreVertIcon />
      </IconButton>

      {/* ✅ Dropdown */}
      {menuOpen && (
        <div
          ref={dropdownRef}
          onMouseLeave={() => setMenuOpen(false)} // 🔥 ONLY HERE CLOSE
          className="
            absolute right-0 mt-2 w-60
            bg-white rounded-xl shadow-xl
            border border-gray-100
            z-50 overflow-hidden
          "
        >
          <Link
            href="/notification"
            className="
              flex items-center gap-3
              px-4 py-3
              hover:bg-gray-50 transition
            "
          >
            <div className="relative">
              <NotificationsIcon className="text-gray-700" />
              {unreadCount > 0 && !loading && (
                <span
                  className="
                    absolute -top-2 -right-2
                    min-w-[18px] h-[18px]
                    flex items-center justify-center
                    text-[11px] font-semibold
                    text-white bg-red-600
                    rounded-full
                  "
                >
                  {unreadCount}
                </span>
              )}
            </div>

            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              Notifications
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
