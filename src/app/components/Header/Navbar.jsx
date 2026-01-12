"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

// MUI Icons
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";

// Avatar with Tailwind
const TailwindAvatar = ({ src, alt }) => (
  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
    {src ? (
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    ) : (
      <span className="text-white font-bold">{alt?.[0] || "U"}</span>
    )}
  </div>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, authChecked } = useSelector((state) => state.auth);

  const navItem = (href, label, Icon) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl
        transition group
        ${active ? "bg-gray-100" : "hover:bg-gray-100"}`}
      >
        {/* Active indicator */}
        {active && (
          <span className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
        )}

        <Icon
          className={`ml-2 ${
            active ? "text-black" : "text-gray-600 group-hover:text-black"
          }`}
        />

        <span
          className={`text-[15px] font-medium ${
            active ? "text-black" : "text-gray-700"
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="relative z-50 p-1 text-white hover:text-gray-300 transition"
        aria-label="Open Menu"
      >
        <MenuIcon className="!text-[36px]" />
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
        />
      )}

      {/* DRAWER */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-white z-50
        transform transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-semibold text-lg select-none"></span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3 px-5 py-3">
          {loading || !authChecked ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <TailwindAvatar src={user?.avatar} alt={user?.name || "U"} />
          )}

          <div className="leading-tight">
            <span className="block font-semibold text-sm">
              {user?.name || "Guest User"}
            </span>
            <span className="block text-xs text-gray-500">View profile</span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="mx-5 h-px bg-gray-100" />

        {/* NAV LINKS */}
        <nav className="mt-3 px-3 space-y-1">
          {navItem("/profile", "My Account", AccountCircleIcon)}
          {navItem("/my-orders", "My Orders", Inventory2Icon)}
        </nav>
      </aside>
    </>
  );
}
