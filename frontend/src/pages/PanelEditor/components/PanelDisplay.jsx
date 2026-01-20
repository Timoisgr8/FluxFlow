import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDashboardStore } from "../../../_stores/dashboard.store";
import { useNodeEditorStore } from '../../../_stores/nodeEditor.store';

export default function PanelDisplay() {
  const { folderUid, dashboardUid, panelId } = useParams();
  const dashboardJson = useDashboardStore((s) => s.dashboardJson);
  const dashboardName = dashboardJson?.dashboard?.title || '';
  const [refreshKey, setRefreshKey] = useState(0);
  const [objectError, setObjectError] = useState(false);
  const objectRef = useRef(null);

  const refreshKeyTrigger = useNodeEditorStore((state) => state.refreshKeyTrigger);
  const setRefreshKeyTrigger = useNodeEditorStore((state) => state.setRefreshKeyTrigger);


  useEffect(() => {

    if (!refreshKeyTrigger) return;
    setRefreshKey(prev => prev + 1);
    setObjectError(false);
    // Reset after handling
    setRefreshKeyTrigger(false)
  }, [refreshKeyTrigger, setRefreshKeyTrigger]);


  // Expose refresh function globally or through context
  useEffect(() => {
    window.refreshPanelDisplay = () => {
      setRefreshKey(prev => prev + 1);
      setObjectError(false); // Reset error state on refresh
    };
    return () => {
      delete window.refreshPanelDisplay;
    };
  }, []);

  // Monitor object element
  useEffect(() => {
    const objectElement = objectRef.current;
    if (!objectElement) return;

    const handleError = () => {
      setObjectError(true);
    };

    const handleLoad = () => {
      setObjectError(false);
    };

    objectElement.addEventListener('error', handleError);
    objectElement.addEventListener('load', handleLoad);

    return () => {
      if (objectElement) {
        objectElement.removeEventListener('error', handleError);
        objectElement.removeEventListener('load', handleLoad);
      }
    };
  }, [refreshKey]); // Re-run when refreshKey changes

  const params = new URLSearchParams({
    theme: "dark",
    refresh: "30s",
    "orgId": "1",           // Lock to organization
    "from": "now-1h",       // Fixed time range
    "to": "now",            // Fixed time range
    "viewPanel": panelId,   // Focus on single panel
    _t: Date.now()          // Add timestamp to force refresh
  });

  const soloUrl = dashboardUid
    ? `http://localhost:3001/d-solo/${encodeURIComponent(dashboardUid)}/${encodeURIComponent(dashboardName)}?${params.toString()}&panelId=${encodeURIComponent(panelId)}`
    : null;

  return (
    <>
      <div style={{
        height: "100%",
        background: "#0f1114",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#0f1114',
          padding: '8px',
          overflow: 'hidden',
          position: 'relative',
          borderColor: '#404350'
        }}>
          {soloUrl && !objectError ? (
            <object
              ref={objectRef}
              key={refreshKey} // This will force remount when refreshKey changes
              data={soloUrl}
              type="text/html"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                borderRadius: 0,
                backgroundColor: '#0f1114',
                pointerEvents: 'auto'
              }}
              onError={() => setObjectError(true)}
              onLoad={() => setObjectError(false)}
            >
              {/* Fallback content if object fails to load */}
              <div style={{
                border: '1px dashed #404350',
                borderRadius: 0,
                fontSize: '13px',
                color: '#9aa0a6',
                fontWeight: 500,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '4px' }}>📊</div>
                  <div>Panel Visualization</div>
                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#7f868d' }}>
                    Object element not supported
                  </div>
                </div>
              </div>
            </object>
          ) : (
            <div style={{
              border: '1px dashed #404350',
              borderRadius: 0,
              fontSize: '13px',
              color: '#9aa0a6',
              fontWeight: 500,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '4px' }}>📊</div>
                <div>Panel Visualization</div>
                <div style={{ fontSize: '11px', marginTop: '2px', color: '#7f868d' }}>
                  {objectError ? 'Failed to load panel' :
                    !dashboardUid ? 'Missing dashboard UID' : 'Panel not available'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}