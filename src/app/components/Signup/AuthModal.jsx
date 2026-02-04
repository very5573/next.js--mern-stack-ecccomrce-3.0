"use client";

import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import CloseIcon from "@mui/icons-material/Close";

const AuthModal = ({ closeModal }) => {
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [closeModal]);

  return (
    /* OVERLAY */
    <div
      onClick={closeModal}
      className="
        fixed inset-0 z-50 flex items-center justify-center px-4
        bg-gradient-to-br from-[#0f172a] via-[#020617] to-black
      "
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="
          relative w-full max-w-lg
          rounded-2xl
          bg-[#020617]/90
          ring-1 ring-white/10
          shadow-[0_20px_60px_rgba(0,0,0,0.6)]
          animate-fadeIn
        "
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="
            absolute top-4 -right-10
            p-2 rounded-full
            bg-white/5 hover:bg-white/10
            text-white
            transition
          "
        >
          <CloseIcon fontSize="small" />
        </button>

        {/* TABS */}
        <div className="flex p-1 m-5 rounded-full bg-white/5">
          {["login", "register"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab === "login" ? "Login" : "Create Account"}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="px-6 pb-6 max-h-[75vh] overflow-y-auto scrollbar-hide">
          {activeTab === "login" ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
