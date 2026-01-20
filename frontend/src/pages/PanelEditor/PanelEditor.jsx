// src/pages/PanelEditor/PanelEditor.js

import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
// REMOVED: Header and NavigationBar are no longer needed here
import { useSmartNavigation } from '../../hooks/useSmartNavigation';
import { ReactFlowProvider } from "@xyflow/react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import NodeSelectionPanel from './components/NodeSelectionPanel';
import NodeCanvas from "./components/NodeCanvas";
import PanelDisplay from './components/PanelDisplay';
import OptionsPanel from './components/OptionsPanel';

import { useDashboardStore } from "../../_stores/dashboard.store";

export default function PanelEditor() {
  const { folderUid, dashboardUid, panelId } = useParams();
  const { isLoading: navLoading } = useSmartNavigation(folderUid, dashboardUid);

  const setPanelChanges = useDashboardStore((s) => s.setPanelChanges);


  if (navLoading) {
    // The main layout will still be visible during this loading state
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        Loading Editor...
      </div>
    );
  }

  useEffect(() => {
    setPanelChanges([0, 0]);
  }, []);


  return (

    <div style={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }}>

      <ReactFlowProvider>
        <div style={{ height: '100%', width: '100%', display: 'flex' }}>
          <Allotment>
            {/* Left Pane: Node Selection */}
            <Allotment.Pane minSize={320} preferredSize="5%">
              <NodeSelectionPanel />
            </Allotment.Pane>


            {/* Middle Pane: Node Canvas */}
            <Allotment.Pane minSize={200} preferredSize="70%" className="border-l-1 border-r-1 border-[#414350]">
              <NodeCanvas />
            </Allotment.Pane>

            {/* Right Pane: Vertical Split for Panel Display and Options Panel */}
            <Allotment.Pane minSize={200} preferredSize="25%">
              <Allotment vertical={true}>
                {/* Top: Panel Display */}
                <Allotment.Pane preferredSize="65%">
                  <PanelDisplay />
                </Allotment.Pane>


                <Allotment.Pane minSize={350} className="border-t-1 border-[#414350]">
                  <OptionsPanel />
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        </div>
      </ReactFlowProvider>
    </div>
  );
}