import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useNodeEditorStore } from "../../../../_stores/nodeEditor.store";
// frontend\src\pages\PanelEditor\components\customNodes\SourceNode.jsx
const SourceNode = memo(({ data, isConnectable }) => {

  const sourceTimeRange = useNodeEditorStore((s) => s.sourceTimeRange);

  const handleStyle = {
    background: "#10b981",
    width: 10,
    height: 10,
  };

  return (
    <div style={{
      padding: "12px",
      border: "2px solid #10b981",
      borderRadius: "8px",
      background: "#1e293b",
      minWidth: "180px",
      color: "white"
    }}>
      <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#34d399" }}>
        {data.display_name || "Data Source"}
      </div>
      <div style={{ fontSize: "12px", marginBottom: "4px" }}>
        <span style={{ color: "#94a3b8" }}>Bucket:</span> <strong>{data.bucket}</strong>
      </div>
      <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
        Range: {sourceTimeRange}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={isConnectable}
      />
    </div>
  );
});

export default SourceNode;
