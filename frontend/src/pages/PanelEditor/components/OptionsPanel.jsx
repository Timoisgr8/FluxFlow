import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardStore } from "../../../_stores/dashboard.store";
import { useUpdateDashboard } from "../../../_queries/dashboards.query";
import { useNodeEditorStore } from "../../../_stores/nodeEditor.store";

function OptionsPanel() {

  const fluxPreviewRef = useRef(null);

  const { folderUid, dashboardUid, panelId } = useParams();
  const queryClient = useQueryClient();

  const dashboardJson = useDashboardStore((s) => s.dashboardJson);
  const syncDashboardJson = useDashboardStore((s) => s.syncDashboardJson);

  const updateDashboardMutation = useUpdateDashboard();

  const localTitle = useNodeEditorStore((state) => state.localTitle);
  const setLocalTitle = useNodeEditorStore((state) => state.setLocalTitle);

  const localDescription = useNodeEditorStore((state) => state.localDescription);
  const setLocalDescription = useNodeEditorStore((state) => state.setLocalDescription);

  const [showCode, setShowCode] = useState(false);

  const previewFlux = useNodeEditorStore((s) => s.previewFlux);
  const setNodeSelectionPanelEvent = useNodeEditorStore((state) => state.setNodeSelectionPanelEvent);

  useEffect(() => {
    const applyMonospace = () => {
      if (fluxPreviewRef.current) {
        fluxPreviewRef.current.style.setProperty("font-family", "monospace", "important");
        console.log("Monospace applied");
        return true;
      }
      return false;
    };
    if (applyMonospace()) return;
    const observer = new MutationObserver(() => {
      if (applyMonospace()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    if (!dashboardJson && dashboardUid) {
      syncDashboardJson(dashboardUid, queryClient);
    }
  }, [dashboardJson, dashboardUid, queryClient, syncDashboardJson]);

  const currentPanel = dashboardJson?.dashboard?.panels?.find(
    (panel) => panel.id === parseInt(panelId)
  );

  useEffect(() => {
    if (currentPanel) {
      setLocalTitle(currentPanel.title || "");
      setLocalDescription(currentPanel.description || "");
    } else {
      setLocalTitle("");
      setLocalDescription("");
    }
  }, [currentPanel]);

  const handleTitleChange = useCallback((e) => setLocalTitle(e.target.value), []);
  const handleDescriptionChange = useCallback((e) => setLocalDescription(e.target.value), []);

  const saveChanges = useCallback(async () => {
    if (!currentPanel || !dashboardJson?.dashboard) return;
    try {
      setNodeSelectionPanelEvent({
        type: "RUN_QUERY",
        payload: {},
      })

    } catch (err) {
      console.error("Failed to save dashboard:", err);
    }
  }, [
    currentPanel,
    dashboardJson,
    panelId,
    localTitle,
    localDescription,
    folderUid,
    updateDashboardMutation,
  ]);

  // === Empty state ===
  if (!currentPanel) {
    return (
      <div className="h-full bg-[#141B29]">
        <div
          className="h-full overflow-y-auto border border-[#404350]"
          style={{ backgroundColor: "transparent", boxSizing: "border-box", userSelect: "none" }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Panel Options</h3>
            </div>
            <p className="mt-1 text-[#9aa0a6] text-sm">No panel selected</p>
          </div>
        </div>
      </div>
    );
  }

  // === Main panel ===
  return (
    <div className="h-full bg-[#141B29]">
      <div
        className="scroll-container h-full overflow-y-auto"
        style={{ backgroundColor: "#12131A", boxSizing: "border-box", userSelect: "none" }}
      >
        <div className="p-4">
          <div className="flex items-center justify-left relative">
            <h2 className="text-base md:text-lg font-medium whitespace-nowrap text-white">
              Panel Options
            </h2>

            {/* Right-side buttons */}
            <div className="ml-auto relative flex items-center justify-end">
              <div className="flex items-center justify-end relative min-w-[220px]">
                {/* 👆 tune min-w until Save Changes sits where you want */}

                {/* Save Changes - fixed anchor point */}
                <button
                  onClick={saveChanges}
                  disabled={updateDashboardMutation.isPending}
                  className="
          flex items-center gap-1 whitespace-nowrap px-2 py-1 h-8 text-sm text-center cursor-pointer text-[#a8b2c1]
          bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548]
          transition-colors duration-200 absolute right-[110px]
        "
                >
                  {updateDashboardMutation.isPending ? "Saving..." : "Save Changes"}
                </button>

                {/* Show Code / Show Options - dynamic width */}
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="
          flex items-center gap-1 whitespace-nowrap px-2 py-1 h-8 text-sm text-center cursor-pointer text-[#a8b2c1]
          bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548]
          transition-colors duration-200 absolute right-0
        "
                >
                  {showCode ? "Show Options" : "Show Code"}
                </button>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-2 text-[11px] md:text-xs text-[#9aa0a6]">
            Panel ID: {panelId}
          </div>

          {/* Body */}
          <div className="mt-4 flex flex-col gap-3">
            {showCode ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#c7c9cc]">Flux (Preview)</label>
                <textarea
                  readOnly
                  value={
                    previewFlux ||
                    'No Flux yet.\nBuild your graph and click "Run Query" in the canvas.'
                  }
                  refProp={fluxPreviewRef}
                  className="border border-[#404350] px-3 py-2 pl-1 min-h-[200px] resize-y focus:outline-none focus:ring-2 focus:ring-[#374E97] bg-[#0f1117] text-[#e5e7eb]/60 font-mono text-sm"
                />
              </div>
            ) : (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-[#c7c9cc]">Title</span>
                  <input
                    type="text"
                    value={localTitle}
                    onChange={handleTitleChange}
                    placeholder="Panel title"
                    className="bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm h-8 focus:outline-none mt-1 mb-1 pl-3 
            transition-colors duration-200 focus:text-[#ffffff] focus:border-[#5C6BE9]"
                    disabled={updateDashboardMutation.isPending}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-[#c7c9cc]">Description</span>
                  <textarea
                    value={localDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Panel description"
                    className="bg-[#1B1C22] text-[#E6E6F2] placeholder-[#71757D] border border-[#2A2B31] p-1 text-sm min-h-32 resize-y focus:outline-none mt-1 mb-1 pl-3 
            transition-colors duration-200 focus:text-[#E6E6F2] focus:border-[#5C6BE9]"
                    disabled={updateDashboardMutation.isPending}
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(OptionsPanel);
