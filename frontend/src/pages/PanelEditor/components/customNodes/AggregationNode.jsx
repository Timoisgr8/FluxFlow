import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useNodeEditorStore } from "../../../../_stores/nodeEditor.store";

//frontend\src\pages\PanelEditor\components\customNodes\VisualisationNode.jsx
const AggregationNode = memo(({ data, isConnectable }) => {

  const aggregateTimeRange = useNodeEditorStore((s) => s.aggregateTimeRange);

  const handleStyle = {
    background: "#8b5cf6",
    width: 10,
    height: 10,
  };


  return (
    <div style={{
      padding: "12px",
      border: "2px solid #8b5cf6",
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
      <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#a78bfa" }}>
        {data.display_name || "Aggregation"}
      </div>
      <div style={{ fontSize: "12px", marginBottom: "4px" }}>
        <span style={{ color: "#94a3b8" }}>Function:</span> <strong>{data.function}</strong>
      </div>
      {aggregateTimeRange && (
        <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
          Window: {aggregateTimeRange}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={isConnectable}
      />
    </div>
  );
});

export default AggregationNode;