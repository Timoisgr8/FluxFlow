import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useDashboardStore } from '../../../_stores/dashboard.store';
import { useUpdateDashboard, useDeleteDashboard } from '../../../_queries/dashboards.query';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router-dom";
import TreeViewSidebar from "./TreeViewSidebar";
import "../../../main.css";

import { MdDelete, MdOutlineKeyboardArrowRight, MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";


const OptionsPanel = ({
  isCollapsed = false,
  toggleCollapse,
  style = {},
  onDeleteSuccess
}) => {
  const navigate = useNavigate();
  const { folderUid, dashboardUid } = useParams();

  const queryClient = useQueryClient();

  const updateMutation = useUpdateDashboard();
  const deleteMutation = useDeleteDashboard();

  const dashboardJson = useDashboardStore((s) => s.dashboardJson);
  const panelLayout = useDashboardStore((s) => s.panelLayout);
  const { panelChanges, syncDashboardJson } = useDashboardStore();

  const hasDashboard = !!dashboardJson?.dashboard;
  const dashboardUidFromJson = dashboardJson?.dashboard?.uid;



  const [localTitle, setLocalTitle] = useState(dashboardJson?.dashboard?.title || '');
  const [localDescription, setLocalDescription] = useState(dashboardJson?.dashboard?.description || '');
  const [activeTab, setActiveTab] = useState("options");

  const deletePanel = useDashboardStore((s) => s.deletePanel);

  useEffect(() => {
    setLocalTitle(dashboardJson?.dashboard?.title || '');
    setLocalDescription(dashboardJson?.dashboard?.description || '');
  }, [dashboardJson]);

  const handleTitleChange = (e) => setLocalTitle(e.target.value);
  const handleDescriptionChange = (e) => setLocalDescription(e.target.value);

  const searchQuery = useDashboardStore((s) => s.searchQuery);

  const filteredPanels = useMemo(() => {
    if (!dashboardJson?.dashboard?.panels) return [];

    const q = searchQuery.toLowerCase();

    return dashboardJson.dashboard.panels.filter((panel) =>
      panel.title?.toLowerCase().includes(q)
    );
  }, [searchQuery, dashboardJson]);

  const editPanel = useCallback((id) => {
    if (!folderUid || !dashboardUid) return;

    // Get the latest panelChanges directly from the store
    const { panelChanges } = useDashboardStore.getState();

    if (panelChanges[0] !== 0 || panelChanges[1] !== 0) {
      const proceed = window.confirm(
        "You have unsaved changes. If you continue, your progress may be lost. Do you want to proceed?"
      );
      if (!proceed) return;
    }

    navigate(`/folder/${folderUid}/dashboard/${dashboardUid}/panel/${id}`);
  }, [folderUid, dashboardUid, navigate]);

  const handleDeleteDashboard = async () => {
    if (!hasDashboard) return;
    if (!window.confirm("Are you sure you want to delete this dashboard?")) return;

    const folderUidFromJson = dashboardJson?.meta?.folderUid;

    try {
      await deleteMutation.mutateAsync({ uid: dashboardUidFromJson, folderUid: folderUidFromJson });
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      console.error(err);
      // alert("Failed to delete dashboard");
    }
  };

  const handlePanelCreate = () => {
    try {
      const dashboardStore = useDashboardStore.getState();
      const newPanelId = dashboardStore.addNewPanelToLayout({ isTemporary: true });
      console.log("Temporary panel created:", newPanelId);
    } catch (err) {
      console.error("Failed to create new panel:", err);
    }
  };


  const saveChanges = async () => {
    if (!hasDashboard) return;

    try {

      const updatedPanels = dashboardJson.dashboard.panels.map((panel) => {
        const layoutItem = panelLayout.find((l) => l.i === String(panel.id));
        if (!layoutItem) return panel;
        return {
          ...panel,
          gridPos: { x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h },
          temporary: false,
          type: panel.type === "placeholder" ? "timeseries" : panel.type, // revert placeholder type
        };
      });

      const updatedDashboard = {
        ...dashboardJson.dashboard,
        title: localTitle,
        description: localDescription,
        panels: updatedPanels,
      };

      const folderUidFromJson = dashboardJson?.meta?.folderUid;
      const dashboardUidFromJson = dashboardJson?.dashboard?.uid;

      await updateMutation.mutateAsync({
        folderUid: folderUidFromJson,
        dashboard: updatedDashboard,
      });

      if (dashboardUidFromJson) {
        await useDashboardStore
          .getState()
          .syncDashboardJson(dashboardUidFromJson, queryClient);
        console.log("Dashboard re-synced — placeholders replaced!");
      }
    } catch (err) {
      console.error("Failed to save dashboard:", err);
      alert("Failed to save dashboard");
    }
  };


  // RETURN SECTION BELOW
  return (
    <div
      className={`flex flex-col box-border overflow-hidden transition-all duration-300 bg-[#12131A] border-r-1 border-r-[#404350]`}
      style={{ ...style }}
    >

      <div
        className={`flex items-center border-b transition-all duration-300 bg-[#12131A] ${isCollapsed
          ? "justify-center border-transparent"
          : "justify-between border-b border-b-[#404350]"
          }`}
      >
        {!isCollapsed && (
          <div className="flex flex-1 text-sm text-gray-300 items-center">
            {/* Panels tab with + icon inside */}
            <button
              className={`flex-1 flex items-center justify-center relative py-2 border-r border-[#404350] transition-colors ${activeTab === "panels"
                ? "bg-[#2a2f3b] text-white"
                : "hover:bg-[#20232a] hover:text-white cursor-pointer"
                }`}
              onClick={() => setActiveTab("panels")}
            >
              <span className="mx-auto">Panels</span>

              {/* Add new panel button positioned to the right */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent switching tabs
                  handlePanelCreate();
                }}
                title="Create a New Panel"
                className="text-lg absolute  px-1 py-1 right-2 text-gray-300 rounded hover:bg-[#404350] cursor-pointer transition-colors"
              >
                <FaPlus size={12} />
              </button>
            </button>


            {/* Options tab */}
            <button
              className={`flex-1 py-2 border-r border-[#404350] transition-colors ${activeTab === "options"
                ? "bg-[#2a2f3b] text-white"
                : "hover:bg-[#20232a] hover:text-white cursor-pointer"
                }`}
              onClick={() => setActiveTab("options")}
            >
              Options
            </button>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={toggleCollapse}
          className={`text-xs px-2 py-2 text-gray-300 hover:bg-[#20232a] cursor-pointer transition-all duration-300 ${isCollapsed ? "mx-auto" : "ml-auto"
            }`}
        >
          {isCollapsed ? <MdOutlineKeyboardArrowRight /> : <MdOutlineKeyboardDoubleArrowLeft />}
        </button>
      </div>


      {/* Main panel body */}
      {!isCollapsed && (
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${activeTab === "panels" ? "p-0" : "p-4"
            } custom-scrollbar`}
        >
          {/* PANELS TAB */}
          {activeTab === "panels" && (
            <div className="flex flex-col text-gray-300 text-sm h-full overflow-auto scroll-container">
              {dashboardJson?.dashboard?.panels?.length > 0 ? (
                filteredPanels.map((panel) => (
                  <div
                    key={panel.id}
                    onClick={() => {
                      if (!panel.temporary) {
                        editPanel(panel.id)
                      }
                    }}
                    className={`relative border-b border-[#404350] px-3 py-5 transition-colors ${panel.temporary
                      ? 'cursor-not-allowed'
                      : 'hover:bg-[#1a1c22] cursor-pointer'
                      }`}
                  >
                    <div className={`text-gray-200 text-sm font-medium ${panel.temporary
                      ? 'opacity-60'
                      : ''
                      }`}>
                      {panel.title || `Untitled Panel (${panel.id})`}
                      {panel.temporary && (
                        <span className="ml-2 text-xs text-yellow-500">(Unsaved)</span>
                      )}
                    </div>
                    <div className="text-[#71757D] text-xs mt-0.5 truncate">
                      {panel.description || 'No description for panel'}
                    </div>

                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-2 bg-transparent border border-transparent hover:border-[#2d3548] hover:bg-red-600/30 text-[#a8b2c1] hover:text-white transition-color duration-200 cursor-pointer text-xs flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePanel(panel.id);
                      }}
                      title="Delete Panel"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                ))

              ) : (
                <div className="flex justify-center items-center text-gray-500 italic h-full">
                  No panels found
                </div>
              )}
            </div>
          )}

          {/* OPTIONS TAB */}
          {activeTab === "options" && (
            <>
              {/* Show input fields if a dashboard is selected */}
              {hasDashboard ? (
                <div className="flex flex-col gap-2 rounded flex-grow mb-1">
                  <input
                    type="text"
                    value={localTitle}
                    onChange={handleTitleChange}
                    placeholder="Enter dashboard name..."
                    className="bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-m h-10 focus:outline-none mt-3 mb-1 pl-3 
            transition-colors duration-200 focus:text-[#ffffff] focus:border-[#5C6BE9]"
                  />

                  <textarea
                    value={localDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Enter dashboard description..."
                    className="bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm min-h-32 resize-y focus:outline-none pl-3
            transition-colors duration-200 focus:text-[#E6E6F2] focus:border-[#5C6BE9]"
                  />

                  <div className="flex justify-around">
                    <div className="flex justify-start">
                      <button
                        onClick={handleDeleteDashboard}
                        disabled={deleteMutation.isPending}
                        className={`w-24 px-3 py-1 text-sm text-center font-medium ${deleteMutation.isPending
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
                          : "cursor-pointer text-[#a8b2c1] bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548] transition-colors duration-200"
                          }`}
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={saveChanges}
                        disabled={updateMutation.isPending}
                        className={`w-24 px-3 py-1 text-sm text-center font-medium ${updateMutation.isPending
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
                          : "cursor-pointer text-[#a8b2c1] bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548] transition-colors duration-200"
                          }`}
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                  <div className="w-full mx-auto my-1 border-t border-[#737781] opacity-70"></div>
                </div>
              ) : (
                // Placeholder shown when no dashboard is selected
                <div className="flex flex-col items-center justify-center text-center text-[#9AA0A6] p-6 mb-6">
                  <p className="text-sm">No dashboard selected.</p>
                  <p className="text-xs text-[#71757D] mt-1">
                    Please select a dashboard from the folder tree below.
                  </p>
                </div>
              )}

              {/* Always show the Tree View Sidebar */}
              <div className="w-full bg-[#222531] border border-[#404350] overflow-hidden flex-1 min-h-[50px] mt-2">
                <TreeViewSidebar />
              </div>

            </>
          )}

        </div>
      )}
    </div>
  );
};

export default OptionsPanel;
