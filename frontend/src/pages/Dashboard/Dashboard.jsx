import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardStore } from '../../_stores/dashboard.store';
import { useSmartNavigation } from '../../hooks/useSmartNavigation';
import OptionsPanel from "./components/OptionsPanel";
import DashboardGrid from "./components/DashboardGrid/DashboardGrid";

const MemoizedDashboardGrid = React.memo(DashboardGrid);

export default function Dashboard() {
  const { folderUid, dashboardUid } = useParams();
  const queryClient = useQueryClient();

  const { isLoading: navLoading, verifyDashboardPath, navigateToFirstDashboardIn } = useSmartNavigation();

  const isCollapsed = useDashboardStore(s => s.isCollapsed);
  const toggleCollapse = useDashboardStore(s => s.toggleCollapse);
  const { clearDashboard, syncDashboardJson } = useDashboardStore();

  // Sync when dashboardUid changes, without remounting
  useEffect(() => {
    verifyDashboardPath();
  }, [dashboardUid, verifyDashboardPath]);

  useEffect(() => {
    if (!dashboardUid) {
      clearDashboard();
    }
  }, [dashboardUid, clearDashboard]);



  useEffect(() => {
    clearDashboard();
    if (dashboardUid) {
      syncDashboardJson(dashboardUid, queryClient).catch((err) =>
        console.error("Failed to sync dashboard JSON:", err)
      );
    }
  }, [dashboardUid, clearDashboard, syncDashboardJson, queryClient]);

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      const setCollapse = useDashboardStore.getState().setCollapse;
      setCollapse(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (navLoading) return <div className="bg-[#0c0d12] min-h-screen overflow-hidden">Loading dashboard...</div>;

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <MemoizedDashboardGrid style={{ flex: 1, height: '100%' }} />
    </div>
  );
}