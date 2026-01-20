import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
// frontend\src\pages\PanelEditor\components\customNodes\FilterNode.jsx
const FilterNode = memo(({ data, isConnectable }) => {

  
  const handleStyle = {
    background: "#3b82f6",
    width: 10,
    height: 10,
  };


  return (
    <div style={{
      padding: "12px",
      border: "2px solid #3b82f6",
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
      <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#60a5fa" }}>
        {data.display_name || "Filter"}
      </div>
      <div style={{ fontSize: "12px", marginBottom: "4px" }}>
        <span style={{ color: "#94a3b8" }}>Key:</span> <strong>{data.key}</strong>
      </div>
      <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
        {data.value}
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

export default FilterNode;
