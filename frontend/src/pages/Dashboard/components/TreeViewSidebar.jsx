import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";
import { useFolders } from "../../../_queries/folders.query";
import {
  useDashboards,
  useDashboard,
  useCreateDashboardWithState,
} from "../../../_queries/dashboards.query";
import { useDashboardStore } from "../../../_stores/dashboard.store";

import { BsDash } from "react-icons/bs";


export default function TreeViewSidebar() {
  const navigate = useNavigate();
  const { folderUid: currentFolderUid, dashboardUid: currentDashboardUid } =
    useParams();

  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedDashboard, setExpandedDashboard] = useState(null);

  const { data: folders = [] } = useFolders();
  const { createDashboard } = useCreateDashboardWithState();
  const { addNewPanelToLayout } = useDashboardStore();

  const { data: expandedDashboardData } = useDashboard(expandedDashboard, {
    enabled: !!expandedDashboard,
  });

  // Auto-expand the folder of the current dashboard
  useEffect(() => {
    if (currentFolderUid) {
      setExpandedFolders((prev) => ({ ...prev, [currentFolderUid]: true }));
    }
    if (currentDashboardUid) {
      setExpandedDashboard(currentDashboardUid);
    }
  }, [currentFolderUid, currentDashboardUid]);

  const toggleFolder = (uid) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const handleDashboardSelect = (folderUid, dashboardUid) => {
    setExpandedDashboard((prev) => (prev === dashboardUid ? null : dashboardUid));
    navigate(`/folder/${folderUid}/dashboard/${dashboardUid}`);
  };

  const handlePanelClick = (folderUid, dashboardUid, panelId) => {
    navigate(`/folder/${folderUid}/dashboard/${dashboardUid}/panel/${panelId}`);
  };

  const handleAddDashboard = async (folderUid) => {
    try {
      const created = await createDashboard(folderUid);
      if (created?.uid) {
        setExpandedDashboard(created.uid);
        navigate(`/folder/${folderUid}/dashboard/${created.uid}`);
      }
    } catch (err) {
      console.error("Failed to create dashboard:", err);
    }
  };

  const handleAddPanel = (folderUid, dashboardUid) => {
    try {
      addNewPanelToLayout();
      navigate(`/folder/${folderUid}/dashboard/${dashboardUid}`);
    } catch (err) {
      console.error("Failed to create panel:", err);
    }
  };

  return (
    <div className="w-64 text-[#E6E6F2] text-sm overflow-hidden p-3">
      <h3 className="text-xs text-[#9ca3af] uppercase tracking-wide mb-2">
        Dashboards
      </h3>

      {folders.map((folder) => (
        <div key={folder.uid} className="mb-2">
          {/* Folder */}
          <div
            onClick={() => toggleFolder(folder.uid)}
            className="flex items-center cursor-pointer hover:text-white transition-colors overflow-hidden"
          >
            {expandedFolders[folder.uid] ? (
              <MdKeyboardArrowDown className="flex-shrink-0 mr-1" />
            ) : (
              <MdKeyboardArrowRight className="flex-shrink-0 mr-1" />
            )}
            <span className="font-medium truncate whitespace-nowrap overflow-hidden w-full">
              {folder.title}
            </span>
          </div>

          {/* Dashboards inside folder */}
          {expandedFolders[folder.uid] && (
            <div className="ml-4 mt-1 border-l border-[#404350] pl-2 text-[#9ca3af]">
              <FolderDashboards
                folderUid={folder.uid}
                expandedDashboard={expandedDashboard}
                expandedDashboardData={expandedDashboardData}
                handleDashboardSelect={handleDashboardSelect}
                handlePanelClick={handlePanelClick}
                handleAddDashboard={handleAddDashboard}
                handleAddPanel={handleAddPanel}
                currentDashboardUid={currentDashboardUid}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FolderDashboards({
  folderUid,
  expandedDashboard,
  expandedDashboardData,
  handleDashboardSelect,
  handlePanelClick,
  handleAddDashboard,
  handleAddPanel,
  currentDashboardUid,
}) {
  const { data: dashboards = [] } = useDashboards(folderUid);

  return (
    <>
      {dashboards.map((dashboard) => {
        const isActive = dashboard.uid === currentDashboardUid;
        const isExpanded = expandedDashboard === dashboard.uid;
        const panels = isExpanded ? expandedDashboardData?.dashboard?.panels || [] : [];

        return (
          <div key={dashboard.uid} className="mb-1">
            {/* Dashboard */}
            <div
              onClick={() => handleDashboardSelect(folderUid, dashboard.uid)}
              className={`flex items-center cursor-pointer py-0.5 transition-colors truncate overflow-hidden ${isActive ? "text-white font-medium" : "text-[#9ca3af] hover:text-white"
                }`}
            >
              {isExpanded ? (
                <MdKeyboardArrowDown className="flex-shrink-0 mr-1" />
              ) : (
                <MdKeyboardArrowRight className="flex-shrink-0 mr-1" />
              )}
              <span className="truncate whitespace-nowrap overflow-hidden w-full">
                {dashboard.title}
              </span>
            </div>

            {/* Panels of expanded dashboard */}
            {isExpanded && (
              <div className="ml-5 border-l border-[#404350] pl-2 text-[#9ca3af]">
                {/* Render panels if they exist */}
                {panels.length > 0 ? (
                  panels.map((panel) => (
                    <div
                      key={panel.id}
                      onClick={() =>
                        handlePanelClick(folderUid, dashboard.uid, panel.id)
                      }
                      className="flex items-center cursor-pointer py-0.5 hover:text-white transition-colors overflow-hidden"
                    >
                      <BsDash className="text-xs flex-shrink-0 mr-1" />
                      <span className="truncate whitespace-nowrap overflow-hidden w-full">
                        {panel.title || `Panel ${panel.id}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#71757D] italic py-1">
                    No panels yet
                  </div>
                )}

                {/* Add panel always visible */}
                <div
                  onClick={() => handleAddPanel(folderUid, dashboard.uid)}
                  className="ml-3 mt-1 text-[#71757D] cursor-pointer hover:text-white text-xs truncate"
                >
                  ＋ Add Panel
                </div>
              </div>
            )}

          </div>
        );
      })}

      {/* Add Dashboard button */}
      <div
        onClick={() => handleAddDashboard(folderUid)}
        className="ml-2 mt-2 text-[#71757D] cursor-pointer hover:text-white text-xs truncate"
      >
        ＋ Add Dashboard
      </div>
    </>
  );
}
