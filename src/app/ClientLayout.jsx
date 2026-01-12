"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "@/redux/slices/authSlice";
import ButtonAppBar from "./components/Header/Header";
import Panel from "./components/Header/Panel";
import SocketListener from "./components/Section/SocketListener";
import { ToastContainer } from "react-toastify";

export default function ClientLayout({ children }) {
  const dispatch = useDispatch();
  const authChecked = useSelector((state) => state.auth.authChecked);

  // 🔐 ENSURE fetchUser runs ONLY ONCE
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current && !authChecked) {
      hasFetchedRef.current = true;
      dispatch(fetchUser());
    }
  }, [authChecked, dispatch]);

  return (
    <>
      <ButtonAppBar />
      <Panel />
      <SocketListener />

      <main>{children}</main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="colored"
      />
    </>
  );
}
