"use client";

import { useSelector } from "react-redux";
import Link from "next/link";
import { FaUserPlus, FaShoppingCart, FaClipboard } from "react-icons/fa";
import SearchBar from "./SearchBar";
import ThreeDotDropdown from "../../components/Section/Dropdown";

export default function ButtonAppBar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-50 bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <div className="flex-shrink-0">
  <Link
    href="/"
    className="flex items-center gap-2 group"
  >
    <img
      src="/logo.png"
      alt="Logo"
      className="
        h-50 w-auto object-contain
        transition-transform duration-300
        group-hover:scale-110
      "
    />
  </Link>
</div>


          {/* SEARCH BAR */}
<div className="flex-1 flex justify-center mx-15">
  <div className="w-full max-w-xl">
    <SearchBar />
  </div>
</div>

          {/* RIGHT ICONS */}
          <div className="flex items-center space-x-4 text-white">
            {/* USER AVATAR */}
            {isAuthenticated && user?.avatar && (
              <Link href="/me">
                <img
                  src={user.avatar}
                  alt={user.name || "avatar"}
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-105 transition-transform"
                />
              </Link>
            )}

            <Link
              href="/auth"
              className="hover:text-gray-200 transition"
              aria-label="Login or Register"
            >
              <FaUserPlus size={26} />
            </Link>

            <Link
              href="/cart"
              className="hover:text-gray-200 transition"
            >
              <FaShoppingCart size={26} />
            </Link>

            {/* ADMIN */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                className="hover:text-gray-200 transition"
              >
                <FaClipboard size={26} />
              </Link>
            )}

            <ThreeDotDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
