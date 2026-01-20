import React, { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFolders } from "../_queries/folders.query";
import { useDashboards, useDashboard } from "../_queries/dashboards.query";
import { useDashboardStore } from "../_stores/dashboard.store";
import { MdArrowBack } from "react-icons/md";

export default function NavigationBar() {
  const { folderUid, dashboardUid, panelId } = useParams();
  const navigate = useNavigate();

  // Fetch folder, dashboard, and panel data
  const { data: folders = [] } = useFolders();
  const { data: dashboards = [] } = useDashboards(folderUid);
  const { data: dashboardData } = useDashboard(dashboardUid);

  // Current selections
  const currentFolder = folders.find((f) => f.uid === folderUid);
  const currentDashboard =
    dashboardData?.dashboard || dashboards.find((d) => d.uid === dashboardUid);
  const currentPanel = useMemo(() => {
    if (!panelId || !currentDashboard?.panels) return null;
    return currentDashboard.panels.find((p) => String(p.id) === String(panelId));
  }, [panelId, currentDashboard]);

  const folderTitle = currentFolder?.title || "Folder";
  const dashboardTitle = currentDashboard?.title || null; // null means no dashboard selected
  const panelTitle = currentPanel?.title || (panelId ? `Panel ${panelId}` : null);

  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery);
  const panelChanges = useDashboardStore((s) => s.panelChanges);

  useEffect(() => {
    setSearchQuery(""); // clear search when switching dashboards
  }, [dashboardUid]);

  const handleExitPanel = () => {
    navigate(`/folder/${folderUid}/dashboard/${dashboardUid}`);
  };

  const hasDashboard = !!dashboardTitle; // helper

  return (
    <div
      className={`
        bg-[#12131A] border-b-2 border-[#414350]
        flex items-center justify-between
        h-[64px] px-6 
        transition-all duration-500 ease-in-out
      `}
    >
      {/* Left section — Title + breadcrumb */}
      <div className="flex flex-col">
        {/* Dashboard title */}
        <h2 className="text-2xl font-semibold text-[#D1D3D9] leading-tight">
          {hasDashboard ? dashboardTitle : "No Dashboard Selected"}
        </h2>

        {/* Breadcrumbs — only show if dashboard exists */}
        {hasDashboard && (
          <div className="flex items-center text-xs text-[#71757D] mt-0.5 space-x-1">
            <span className="transition-colors duration-150">
              {folderTitle}
            </span>
            <span className="mx-1 text-[#3D4045]">›</span>
            <span className="transition-colors duration-150">
              {dashboardTitle}
            </span>
            {panelTitle && (
              <>
                <span className="mx-1 text-[#3D4045]">›</span>
                <span className="text-[#9A9DA2]">{panelTitle}</span>
              </>
            )}
            {(panelChanges[0] != 0 || panelChanges[1] != 0) && (
              <span className="ml-2 text-xs text-yellow-500">(Unsaved)</span>
            )}

          </div>
        )}
      </div>

      {/* Right section — Search bar or Exit button */}
      <div className="flex items-center transition-all duration-300 ease-in-out">
        {!panelId ? (
          <input
            type="text"
            placeholder="Search panels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!hasDashboard} // disables when no dashboard selected
            className={`w-48 text-xs px-3 py-1.5 border transition-all duration-150
              ${hasDashboard
                ? "bg-[#1B1C22] text-[#E6E6F2] border-[#2A2B31] placeholder-[#71757D] focus:outline-none focus:ring-1 focus:ring-[#374E97]"
                : "bg-[#1B1C22] text-[#5A5A5A] border-[#2A2B31] cursor-not-allowed opacity-60"
              }`}
          />
        ) : (
          <button
            onClick={handleExitPanel}
            className="flex items-center gap-2
              text-sm px-4 py-1.5
              text-[#a8b2c1] bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548] transition-colors duration-200
              transition-all duration-200 cursor-pointer"
          >
            <MdArrowBack className="text-sm" />
            Exit Panel
          </button>
        )}



      </div>
    </div>
  );
}
