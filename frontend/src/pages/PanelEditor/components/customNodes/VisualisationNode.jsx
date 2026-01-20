import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
//frontend\src\pages\PanelEditor\components\customNodes\VisualisationNode.jsx
const VisualisationNode = memo(({ data, isConnectable }) => {

  const handleStyle = {
    background: "#f59e0b",
    width: 10,
    height: 10,
  };

  return (
    <div style={{
      padding: "12px",
      border: "2px solid #f59e0b",
      borderRadius: "8px",
      background: "#1e293b",
      minWidth: "180px",
      color: "white"
    }}>
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#fbbf24" }}>
        {data.display_name || "Visualisation"}
      </div>
      <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
        Output: {data.output_name || "default"}
      </div>
    </div>
  );
});

export default VisualisationNode;