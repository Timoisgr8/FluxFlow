import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GridPanel from "./GridPanel";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useDashboardStore } from "../../../../_stores/dashboard.store";
import { useCreateDashboardWithState } from "../../../../_queries/dashboards.query";
import "./DashboardGrid.css";
import DashboardBackground from "./DashboardBackground.jsx";

import { MdDelete } from "react-icons/md";


const GridLayout = WidthProvider(RGL);
const MemoizedGridPanel = React.memo(GridPanel);

function DashboardGrid() {
  const [isResizing, setIsResizing] = useState(false);
  const [creatingPanel, setCreatingPanel] = useState(false);
  const [creatingDashboard, setCreatingDashboard] = useState(false);

  const { folderUid: urlFolderUid, dashboardUid: urlDashboardUid } = useParams();
  const navigate = useNavigate();

  const dashboardJson = useDashboardStore((s) => s.dashboardJson);
  const panelLayout = useDashboardStore((s) => s.panelLayout);
  const setPanelLayout = useDashboardStore((s) => s.setPanelLayout);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const deletePanel = useDashboardStore((s) => s.deletePanel);
  
  const { createDashboard } = useCreateDashboardWithState();

  const dashboardTitle = dashboardJson?.dashboard?.title || "Untitled Dashboard";

  // Map panel id -> panel object
  const panelById = useMemo(() => {
    const m = new Map();
    for (const p of (dashboardJson?.dashboard?.panels || [])) {
      m.set(String(p.id), p);
    }
    return m;
  }, [dashboardJson]);

  // Panels that match search (like OptionsPanel does)
  const visiblePanels = useMemo(() => {
    const list = dashboardJson?.dashboard?.panels || [];
    const q = (searchQuery || "").toLowerCase().trim();
    if (!q) return list;
    return list.filter((p) => p.title?.toLowerCase().includes(q));
  }, [searchQuery, dashboardJson]);

  // Set of ids to show
  const visibleIds = useMemo(
    () => new Set(visiblePanels.map((p) => String(p.id))),
    [visiblePanels]
  );

  // Layout to render (filtered for view only)
  const renderLayout = useMemo(() => {
    if (!Array.isArray(panelLayout)) return [];
    if (!searchQuery?.trim()) return panelLayout; // full layout
    return panelLayout.filter((l) => visibleIds.has(l.i));
  }, [panelLayout, searchQuery, visibleIds]);

  // Only persist layout changes when NOT filtering
  const handleLayoutChange = useCallback(
    (newLayout) => {
      if (searchQuery?.trim()) return; // freeze while searching
      const prevMap = new Map(panelLayout.map((p) => [p.i, p.is_new]));
      const merged = newLayout.map((item) => ({
        ...item,
        is_new: prevMap.get(item.i) ?? false,
      }));
      setPanelLayout(merged);
    },
    [panelLayout, setPanelLayout, searchQuery]
  );

  const handlePanelCreate = useCallback(() => {
    if (!urlDashboardUid) return;
    setCreatingPanel(true);
    try {
      useDashboardStore.getState().addNewPanelToLayout();
    } catch (e) {
      console.error("Failed to create new panel:", e);
    } finally {
      setCreatingPanel(false);
    }
  }, [urlDashboardUid]);

  const handleDashboardCreate = useCallback(async () => {
    if (!urlFolderUid) return;
    setCreatingDashboard(true);
    try {
      const d = await createDashboard(urlFolderUid);
      if (d?.uid) navigate(`/folder/${urlFolderUid}/dashboard/${d.uid}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingDashboard(false);
    }
  }, [urlFolderUid, createDashboard, navigate]);

  const baseButtonClasses = `
    px-5 py-3 font-semibold text-sm
    border border-[#0bb3ff]/30 bg-[#0bb3ff]/15
    text-gray-100 transition-all duration-200
    hover:bg-[#0bb3ff]/25 disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer
  `;

  if (!urlDashboardUid || !dashboardJson?.dashboard) {
    return (
      <div className="flex flex-col flex-1 bg-[#141B29] p-4 h-full overflow-hidden pl-6.5 pb-0">
        <div
          className="relative overflow-hidden bg-transparent min-h-0 border border-[#374E97]"
          style={{
            width: "99%",
            height: "98%",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
            userSelect: "none",
          }}
        >
          <DashboardBackground />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-[#c7c9cc]">
            <h3 className="text-lg font-medium text-white mb-1">
              No Dashboard Selected
            </h3>
            <p className="text-[#9aa0a6] mb-6 text-sm">
              Please select a dashboard from the sidebar to view or edit it.
            </p>
            <button
              onClick={handleDashboardCreate}
              disabled={creatingDashboard}
              className={baseButtonClasses}
            >
              {creatingDashboard ? "Creating..." : "＋ Create New Dashboard"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No panels found
  if (!panelLayout?.length) {
    return (
      <div className="flex flex-col flex-1 bg-[#141B29] p-4 h-full overflow-hidden pl-6.5 pb-0">
        <div
          className="relative overflow-hidden bg-transparent min-h-0 border border-[#374E97] "
          style={{
            width: "99%",
            height: "98%",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
            userSelect: "none",
          }}
        >
          <DashboardBackground />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-[#c7c9cc]">
            <h3 className="text-lg text-white mb-2 font-medium">
              No Panels Found
            </h3>
            <p className="text-[#9aa0a6] mb-6 text-sm">
              This dashboard doesn't contain any panels yet.
            </p>
            <button
              onClick={handlePanelCreate}
              disabled={creatingPanel}
              className={baseButtonClasses}
            >
              {creatingPanel ? "Creating..." : "＋ Create New Panel"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-[#141B29] p-4 h-full overflow-hidden pl-6.5 pb-0">
      <div
        className={`relative flex-1 overflow-hidden ${isResizing ? "opacity-75" : ""} min-h-0`}
      >

        <div
          className="relative overflow-hidden border border-[#404350] "
          style={{
            width: "99%",
            height: "98%",
            backgroundColor: "#12131A",
            boxSizing: "border-box",
            userSelect: "none",
          }}
        >
          {/* Grid background behind panels */}
          <DashboardBackground />

          {/* Actual Grid Layout */}
          <GridLayout
            className="layout relative z-10 scroll-container"
            layout={renderLayout}
            onLayoutChange={handleLayoutChange}
            onResizeStart={() => setIsResizing(true)}
            onResizeStop={() => setIsResizing(false)}
            onDragStart={() => setIsResizing(true)}
            onDragStop={() => setIsResizing(false)}
            cols={24}
            rowHeight={30}
            margin={[10, 10]}
            containerPadding={[10, 10]}
            isDraggable
            isResizable
            autoSize={false}
            style={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              background: "transparent", // Let the <Background /> show through
            }}
          >
            {renderLayout.map((item) => {
              const panel = panelById.get(item.i);

              if (!panel) return null;

              // If temporary, render placeholder
              if (panel.temporary) {
                const handleDeletePanel = (e) => {
                  e.stopPropagation();
                  if (!panel?.id) return;
                  deletePanel(panel.id);
                };

                return (
                  <div
                    key={item.i}
                    className="flex flex-col h-full border border-dashed border-[#374E97] bg-[#12131A] rounded-md overflow-hidden"
                    title="Unsaved Panel — Save dashboard to confirm"
                  >
                    {/* Header */}
                    <div className="absolute w-full flex justify-end items-center text-xs text-gray-300 bg-[#12131A] p-1">
                      <button
                        onClick={handleDeletePanel}
                        title="Delete Panel"
                        className="cursor-pointer text-[#a8b2c1] bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548] transition-colors duration-200 text-xs p-1"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-center text-nowrap text-[#9AA0A6] text-sm">
                      Unsaved Panel - Save dashboard to confirm
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.i} className="panel-fade">
                  <MemoizedGridPanel panel={panel} />
                </div>
              );
            })}

          </GridLayout>
        </div>
      </div>
    </div>
  );

}

export default React.memo(DashboardGrid);