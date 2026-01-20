// src/components/Header/Header.jsx
import React from "react";
import { IoIosLogOut } from "react-icons/io";
import { useCheckSession, useLogout } from "../_queries/auth.query";
import { useNavigate } from "react-router-dom";
import { useSmartNavigation } from '../hooks/useSmartNavigation';

import FluxFlowLogo from "../pages/Login/components/FluxFlowLogo";

export default function Header() {
  const navigate = useNavigate();
  const { data: session, isLoading } = useCheckSession();
  const logoutMutation = useLogout();
  const { navigateToDefaultPage, isNavigating: navigationLoading } = useSmartNavigation();

  if (isLoading) {
    return (
      <header className="flex justify-between items-center h-16 px-6 bg-[#1a1b26] border-b border-[#2d3548] text-white shadow-lg">
        <FluxFlowLogo variant="compact" className="opacity-50" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#4a90e2] animate-pulse"></div>
          <span className="text-sm text-[#71757D] font-medium">Loading...</span>
        </div>
      </header>
    );
  }

  const onLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login", { replace: true });
      },
    });
  };

  return (
    <header className="flex justify-between items-center h-16 px-6 bg-[#0c0d12] border-b-2 border-[#2d3548] text-white shadow-lg backdrop-blur-sm">
      {/* Logo on the left */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={navigateToDefaultPage}
          className="p-0 m-0 bg-transparent border-none cursor-pointer"
        >
          <FluxFlowLogo variant="compact" className="select-none" />
        </button>
      </div>

      {/* Username + logout icon */}
      <div className="flex items-center">
        {/* Logout button */}
        <button
          onClick={onLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-[#a8b2c1] hover:text-white hover:bg-[#222531] transition-all duration-200 border border-transparent cursor-pointer hover:border-[#2d3548] disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Log out"
          title="Log out"
        >
          <IoIosLogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm cursor-pointer font-medium hidden sm:inline">
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pl-2 pr-4 py-2 ">
          <span className="text-sm font-semibold text-[#e1e4e8]">
            {session?.username?.trim() || "Guest"}
          </span>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#4a90e2] to-[#5da3f5] text-white font-bold text-sm">
            {(session?.username?.trim() || "G").charAt(0).toUpperCase()}
          </div>
        </div>


      </div>
    </header>
  );
}
