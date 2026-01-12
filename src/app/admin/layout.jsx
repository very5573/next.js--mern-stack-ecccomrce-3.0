"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "./ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  Inventory2,
  Category,
  People,
  Add,
} from "@mui/icons-material";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openDropdown, setOpenDropdown] = useState({});

  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen((p) => !p);
  const toggleDarkMode = () => setDarkMode((p) => !p);
  const handleDropdown = (menu) =>
    setOpenDropdown((p) => ({ ...p, [menu]: !p[menu] }));

  const productItems = [
    {
      name: "Products",
      icon: <Inventory2 fontSize="small" />,
      children: [
        { name: "Create Product", link: "/admin/create-product" },
        { name: "All Products", link: "/admin/products" },
      ],
    },
    {
      name: "Categories",
      icon: <Category fontSize="small" />,
      children: [
        { name: "Create Category", link: "/admin/create-category" },
        { name: "All Categories", link: "/admin/category" },
      ],
    },
    {
      name: "Users",
      icon: <People fontSize="small" />,
      children: [
        { name: "All Users", link: "/admin/alluser" },
        { name: "User Charts", link: "/admin/alluser/charts" },
      ],
    },
    {
      name: "Orders",
      icon: <Add fontSize="small" />,
      children: [
        { name: "All Orders", link: "/admin/all-orders" },
        { name: "Orders Chart", link: "/admin/all-orders/charts" },
      ],
    },
    {
      name: "Brands",
      icon: <Add fontSize="small" />,
      children: [
        { name: "Create Brand", link: "/admin/CreateBrand" },
        // { name: "Orders Chart", link: "/admin/all-orders/charts" },
      ],
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className={`flex min-h-screen w-full ${darkMode ? "dark" : ""}`}>
        {/* SIDEBAR */}
        <motion.aside
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          animate={{ width: sidebarOpen || hovered ? 256 : 80 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className={`
            fixed left-0 top-0 z-50 h-full flex flex-col
            ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}
            border-r border-gray-200 dark:border-gray-700
          `}
        >
          {/* HEADER */}
          <div className={`flex items-center justify-between p-4 border-b 
            ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
            {(sidebarOpen || hovered) && (
              <span className="font-bold text-lg select-none">
                Admin Dashboard
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className={`p-1 rounded transition
                ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
            >
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>

          {/* MENU */}
          <nav className="flex-1 mt-2 overflow-y-auto scrollbar-hide">
            <ul className="space-y-2 px-2">
              {productItems.map((item) => {
                const key = item.name.toLowerCase();
                const active = openDropdown[key];

                return (
                  <li key={item.name}>
                    {/* MAIN BUTTON */}
                    <button
                      onClick={() => handleDropdown(key)}
                      className={`
                        flex w-full items-center justify-between px-4 py-2
                        rounded-xl transition
                        ${pathname.startsWith(item.children[0].link)
                          ? darkMode
                            ? "bg-gray-700 text-white"
                            : "bg-indigo-100 text-indigo-800"
                          : darkMode
                          ? "hover:bg-gray-800"
                          : "hover:bg-gray-100"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {(sidebarOpen || hovered) && (
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        )}
                      </div>
                      {(sidebarOpen || hovered) && (
                        <motion.span
                          animate={{ rotate: active ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ExpandMore fontSize="small" />
                        </motion.span>
                      )}
                    </button>

                    {/* DROPDOWN */}
                    <AnimatePresence>
                      {active && (sidebarOpen || hovered) && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="pl-6 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.link}
                                className={`
                                  block px-3 py-2 text-sm rounded-lg font-medium transition
                                  ${
                                    pathname === child.link
                                      ? darkMode
                                        ? "bg-gray-700 text-white"
                                        : "bg-indigo-100 text-indigo-800"
                                      : darkMode
                                      ? "hover:bg-gray-800 text-gray-200"
                                      : "hover:bg-gray-100"
                                  }
                                `}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* DARK MODE BUTTON */}
          {(sidebarOpen || hovered) && (
            <div
              className={`mt-auto p-4 border-t
                ${darkMode ? "border-gray-800" : "border-gray-200"}`}
            >
              <button
                onClick={toggleDarkMode}
                className={`
                  w-full rounded-xl px-3 py-2 text-sm font-medium transition
                  ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}
                `}
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          )}
        </motion.aside>

        {/* MAIN */}
        <motion.main
          layout
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`
            flex-1 flex -mt-16 flex-col min-h-screen
            ${sidebarOpen || hovered ? "ml-64" : "ml-20"}
            ${darkMode ? "bg-gray-900 text-white" : "bg-slate-50"}
          `}
        >
          <div className="flex-1 flex -mt-6 flex-col p-6">{children}</div>
        </motion.main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
