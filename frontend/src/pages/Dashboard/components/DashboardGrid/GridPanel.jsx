import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboardStore } from "../../../../_stores/dashboard.store";
import { MdDelete } from "react-icons/md";

export default function GridPanel({ panel }) {
  const [isHovered, setIsHovered] = useState(false);
  const [objectError, setObjectError] = useState(false);
  const objectRef = useRef(null);
  const navigate = useNavigate();
  const { folderUid, dashboardUid } = useParams();

  const dashboardJson = useDashboardStore((s) => s.dashboardJson);
  const deletePanel = useDashboardStore((s) => s.deletePanel);

  const panelChanges = useDashboardStore((s) => s.panelChanges);

  useEffect(() => {
    const el = objectRef.current;
    if (!el) return;

    const onError = () => setObjectError(true);
    const onLoad = () => setObjectError(false);

    el.addEventListener("error", onError);
    el.addEventListener("load", onLoad);

    return () => {
      el.removeEventListener("error", onError);
      el.removeEventListener("load", onLoad);
    };
  }, []);

  const editPanel = useCallback(() => {
    if (!panel?.id || !folderUid || !dashboardUid) return;

    if (panelChanges[0] !== 0 || panelChanges[1] !== 0) {
      const proceed = window.confirm(
        "You have unsaved changes. If you continue, your progress may be lost. Do you want to proceed?"
      );
      if (!proceed) return; // user cancelled
    }

    navigate(`/folder/${folderUid}/dashboard/${dashboardUid}/panel/${panel.id}`);
  }, [panel?.id, folderUid, dashboardUid, navigate, panelChanges]);

  const handleDeletePanel = useCallback(
    (e) => {
      e.stopPropagation();
      if (!panel?.id) return;
      deletePanel(panel.id);
    },
    [panel?.id, deletePanel]
  );

  const dashboardName = dashboardJson?.dashboard?.title || `Dashboard ${dashboardUid}`;
  const params = new URLSearchParams({
    theme: "dark",
    refresh: "30s",
    orgId: "1",
    from: "now-1h",
    to: "now",
    viewPanel: panel.id,
  });

  const soloUrl = dashboardUid
    ? `http://localhost:3001/d-solo/${encodeURIComponent(
      dashboardUid
    )}/${encodeURIComponent(dashboardName)}?${params.toString()}&panelId=${encodeURIComponent(
      panel.id
    )}`
    : null;

  // If no panel exists
  if (!panel) {
    return (
      <div className="flex items-center justify-center h-full text-[#aaa] border border-[#444] bg-[#111] text-sm">
        No panel data provided.
      </div>
    );
  }

  // Main panel container
  return (
    <div
      className={`flex flex-col h-full border border-[#374E97] bg-[#0f1114] transition-all duration-200 overflow-hidden ${isHovered ? "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : ""
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-center text-xs text-gray-300 border-b border-[#374E97]/50 bg-[#0f1114] px-2 py-1">
        <span className="font-medium text-gray-200 truncate">
          {panel.title || `Panel_${panel.id}`}
        </span>
        <div className="flex gap-1">
          <button
            onClick={editPanel}
            title="Edit Panel"
            className="cursor-pointer text-[#a8b2c1] bg-transparent hover:text-white transition-colors duration-200 text-xs mr-1"
          >
            Edit
          </button>
          <button
            onClick={handleDeletePanel}
            title="Delete Panel"
            className="cursor-pointer text-[#a8b2c1]  bg-transparent border border-transparent hover:bg-[#222531] hover:text-white hover:border-[#2d3548] transition-colors duration-200 text-xs mr-1 p-1"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 flex items-center justify-center bg-[#0f1114] text-[#9aa0a6] text-sm p-2 overflow-hidden ">
        {soloUrl && !objectError ? (
          <object
            ref={objectRef}
            key={`${dashboardUid}-${panel.id}`}
            data={soloUrl}
            type="text/html"
            className="w-full h-full border border-[#404350] bg-[#0f1114]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full border border-[#374E97] text-[#9aa0a6] text-sm">
            <div className="mb-1">No data</div>
          </div>
        )}
      </div>
    </div>
  );
}
