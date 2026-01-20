// NodeCanvas.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ControlButton
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useParams } from "react-router-dom";
import { useDashboard, useUpdateDashboard } from "../../../_queries/dashboards.query";
import { useBuckets, useBucketMetadata } from "../../../_queries/datasources.query";
import { useNodeEditorStore } from '../../../_stores/nodeEditor.store';

import AggregationNode from './customNodes/AggregationNode';
import FilterNode from './customNodes/FilterNode';
import SourceNode from './customNodes/SourceNode';
import VisualisationNode from './customNodes/VisualisationNode';

import { FaUndo, FaPlay } from "react-icons/fa";

const nodeTypes = {
  filterNode: FilterNode,
  aggregationNode: AggregationNode,
  sourceNode: SourceNode,
  visualisationNode: VisualisationNode
};

// --------------------
// Custom hook: generateFlux
// --------------------
function useGenerateFlux(nodes, edges) {
  const aggregateTimeRange = useNodeEditorStore((s) => s.aggregateTimeRange);
  const sourceTimeRange = useNodeEditorStore((s) => s.sourceTimeRange);

  return useCallback(() => {
    const nodeLookup = {};
    for (const node of nodes) nodeLookup[node.id] = node;

    function getParents(nodeId) {
      const parents = [];
      for (const edge of edges) {
        if (edge.target === nodeId) parents.push(edge.source);
      }
      return parents;
    }

    function nodeToFlux(node) {
      const { nodeType, key, value, function: fn, bucket, output_name } = node.data;

      switch (nodeType) {
        case 'sourceNode':
          return `from(bucket: "${bucket}") |> range(start: -${sourceTimeRange})`;

        case 'filterNode':
          return `|> filter(fn: (r) => r.${key} == "${value}")`;

        case 'aggregationNode':
          return `|> aggregateWindow(every: ${aggregateTimeRange}, fn: ${fn}, createEmpty: false)`;

        case 'visualisationNode':
          return `|> yield(name: "${output_name || 'visualisation'}")`;

        default:
          return '';
      }
    }

    function buildFlux(nodeId) {
      const node = nodeLookup[nodeId];
      if (!node) return "";

      let fluxText = getParents(nodeId).map(buildFlux).join("\n");
      fluxText += nodeToFlux(node);
      return fluxText.trim();
    }

    return nodes
      .filter(n => n.data?.nodeType === "visualisationNode")
      .map(n => ({ outputId: n.id, flux: buildFlux(n.id) }));
  }, [nodes, edges, aggregateTimeRange, sourceTimeRange]);
}

// --------------------
// NodeCanvas component
// --------------------
export default function NodeCanvas() {
  const nodeSelectionPanelEvent = useNodeEditorStore((state) => state.nodeSelectionPanelEvent);
  const setNodeSelectionPanelEvent = useNodeEditorStore((state) => state.setNodeSelectionPanelEvent);
  const refreshKeyTrigger = useNodeEditorStore((state) => state.refreshKeyTrigger);
  const setRefreshKeyTrigger = useNodeEditorStore((state) => state.setRefreshKeyTrigger);
  const setPreviewFlux = useNodeEditorStore((s) => s.setPreviewFlux);

  const setAggregateTimeRange = useNodeEditorStore((s) => s.setAggregateTimeRange);
  const aggregateTimeRange = useNodeEditorStore((s) => s.aggregateTimeRange);

  const setSourceTimeRange = useNodeEditorStore((s) => s.setSourceTimeRange);
  const sourceTimeRange = useNodeEditorStore((s) => s.sourceTimeRange);

  const { data: buckets, isLoading: bucketsLoading } = useBuckets();
  const [bucketName, setBucketName] = useState(null);

  // When buckets are loaded, safely pick the third bucket
  useEffect(() => {
    if (!bucketsLoading && buckets?.length >= 3) {
      console.log("Buckets data:", buckets);
      setBucketName(buckets[2]); // safely set bucketName when available
    }
  }, [buckets, bucketsLoading]);

  // Only call useBucketMetadata when bucketName is defined
  const { data: metadata, isLoading: metadataLoading } = useBucketMetadata(bucketName);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  function resetNodes() {
    if (bucketName) {
      setNodes([
        {
          id: "0",
          type: "sourceNode",
          data: {
            nodeType: "sourceNode",
            display_name: "Data Source",
            bucket: bucketName,
          },
          position: { x: 200, y: 100 },
          draggable: true,
          deletable: false,
        },
        {
          id: "1",
          type: "visualisationNode",
          data: {
            nodeType: "visualisationNode",
            display_name: "Visualisation",
            output_name: "visualisation",
          },
          position: { x: 500, y: 400 },
          draggable: true,
          deletable: false,
        },
      ]);
      setEdges([
        {
          id: 'e0-1',
          source: '0',
          target: '1',
        },
      ]);
    }
  }

  useEffect(() => {
    resetNodes();
  }, [bucketName]);


  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [nodeId, setNodeId] = useState(2);
  const [isRunning, setIsRunning] = useState(false);

  const generateFlux = useGenerateFlux(nodes, edges);

  // --------------------
  // Node creation functions
  // --------------------
  const addNode = useCallback((nodeData) => {
    const newNode = {
      id: String(nodeId),
      type: nodeData.nodeType,
      data: nodeData,
      position: { x: 100, y: 100 },
      draggable: true,
      deletable: nodeData.nodeType !== 'visualisationNode'
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  }, [nodeId, setNodes]);

  const addMeasurementNode = useCallback((measurement) => {
    if (!metadata?.tags?._measurement?.includes(measurement)) {
      alert(`Invalid measurement: ${measurement}`);
      return;
    }
    addNode({
      nodeType: "filterNode",
      display_name: "Measurement Filter",
      key: "_measurement",
      value: measurement
    });
  }, [metadata, addNode]);

  const addFieldNode = useCallback((field) => {
    if (!metadata?.tags?._field?.includes(field)) {
      alert(`Invalid field: ${field}`);
      return;
    }
    addNode({
      nodeType: "filterNode",
      display_name: "Field Filter",
      key: "_field",
      value: field
    });
  }, [metadata, addNode]);

  const addTagNode = useCallback((tagKey, tagValue) => {
    const tagArray = metadata?.tags?.[tagKey];
    if (!tagArray || !tagArray.includes(tagValue)) {
      alert(`Invalid tag: ${tagKey}=${tagValue}`);
      return;
    }
    addNode({
      nodeType: "filterNode",
      display_name: "Tag Filter",
      key: tagKey,
      value: tagValue
    });
  }, [metadata, addNode]);

  const addSourceNode = useCallback((bucket, range) => {
    addNode({
      nodeType: "sourceNode",
      display_name: "Data Source",
      bucket: bucket || "mybucket",
      range: range || "24h"
    });
  }, [addNode]);

  const addAggregationNode = useCallback((functionName) => {
    addNode({
      nodeType: "aggregationNode",
      display_name: `${functionName.charAt(0).toUpperCase() + functionName.slice(1)} Aggregation`,
      function: functionName,
    });
  }, [addNode]);

  // --------------------
  // React Flow connections with error handling
  // --------------------
  const VALID_CONNECTIONS = {
    sourceNode: ["filterNode", "aggregationNode", "visualisationNode"],
    filterNode: ["filterNode", "aggregationNode", "visualisationNode"],
    aggregationNode: ["visualisationNode"],
    visualisationNode: []
  };

  const onConnect = useCallback((params) => {
    const { source, target } = params;

    if (source === target) {
      alert("Cannot connect a node to itself.");
      return;
    }

    const edgeExists = edges.some(e => e.source === source && e.target === target);
    if (edgeExists) {
      alert("This connection already exists.");
      return;
    }

    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) {
      alert("Invalid nodes in connection.");
      return;
    }

    const sourceType = sourceNode.data?.nodeType;
    const targetType = targetNode.data?.nodeType;

    const allowedTargets = VALID_CONNECTIONS[sourceType] || [];
    if (!allowedTargets.includes(targetType)) {
      alert(`Invalid connection: cannot connect ${sourceType} → ${targetType}`);
      return;
    }

    if (sourceType === "aggregationNode" && targetType === "aggregationNode") {
      alert("Cannot chain aggregations directly.");
      return;
    }

    if (sourceType === "sourceNode" && targetType === "aggregationNode") {
      alert("Aggregations should come after filter nodes.");
      return;
    }

    setEdges(eds => addEdge(params, eds));
  }, [edges, nodes, setEdges]);

  // --------------------
  // Handle panel events
  // --------------------
  const { folderUid, dashboardUid, panelId } = useParams();
  const { data: dashData } = useDashboard(dashboardUid);
  const updateMutation = useUpdateDashboard();

  useEffect(() => {
    if (!nodeSelectionPanelEvent) return;

    const { type, payload } = nodeSelectionPanelEvent;
    if (type === "ADD_NODE") {
      switch (payload?.nodeType) {
        case "filterNode":
          if (payload.key === "_measurement") addMeasurementNode(payload.value);
          else if (payload.key === "_field") addFieldNode(payload.value);
          else addTagNode(payload.key, payload.value);
          break;
        case "sourceNode":
          addSourceNode(payload.bucket, payload.range);
          break;
        case "aggregationNode":
          addAggregationNode(payload.function);
          break;
        default:
          console.warn(`Unknown nodeType: ${payload?.nodeType}`);
      }
    } else if (type === "RUN_QUERY") {
      runQuery();
    } else if (type === "SAVE_PRESET") {
      const { presetId, presetLabel } = nodeSelectionPanelEvent.payload;
      const savedPresets = JSON.parse(localStorage.getItem('presets') || '[]');

      // Find existing preset by id
      const existingIndex = savedPresets.findIndex(p => p.id === presetId);

      if (existingIndex !== -1) {
        // Append nodes and edges to existing preset
        const existingPreset = savedPresets[existingIndex];
        existingPreset.nodes = [...(existingPreset.nodes || []), ...nodes];
        existingPreset.edges = [...(existingPreset.edges || []), ...edges];
        existingPreset.label = presetLabel; // optionally update label
        existingPreset.aggregateTimeRange = aggregateTimeRange;
        existingPreset.sourceTimeRange = sourceTimeRange;
        savedPresets[existingIndex] = existingPreset;
      } else {
        // Add as new preset
        savedPresets.push({
          id: presetId,
          label: presetLabel,
          nodes: nodes,
          edges: edges,
          aggregateTimeRange: aggregateTimeRange,
          sourceTimeRange: sourceTimeRange
        });
      }

      localStorage.setItem('presets', JSON.stringify(savedPresets));
      useNodeEditorStore.getState().setRefreshKeyTrigger(prev => !prev);
    } else if (type === "LOAD_PRESET") {
      const { presetId } = nodeSelectionPanelEvent.payload;
      const savedPresets = JSON.parse(localStorage.getItem('presets') || '[]');
      const preset = savedPresets.find(p => p.id === presetId);

      if (!preset) {
        console.warn(`Preset with id "${presetId}" not found.`);
        return
      }

      // Restore nodes and edges into React Flow
      setNodes(preset.nodes || []);
      setEdges(preset.edges || []);
      setAggregateTimeRange(preset.aggregateTimeRange || "5m");
      setSourceTimeRange(preset.sourceTimeRange || "1h");

    } else if (type === "DELETE_PRESET") {
      //Logic is handled in ./NodeSelectionPanel.jsx
    } else if (type === "ADD_EXISTING_PRESET") {
      const { presetId } = nodeSelectionPanelEvent.payload;
      const savedPresets = JSON.parse(localStorage.getItem('presets') || '[]');
      const preset = savedPresets.find(p => p.id === presetId);

      if (!preset) {
        console.warn(`Preset with id "${presetId}" not found.`);
        return;
      }

      // Find max id in current nodes
      let maxNodeId = nodeId;
      nodes.forEach(node => {
        const id = parseInt(node.id);
        if (!isNaN(id) && id >= maxNodeId) {
          maxNodeId = id + 1;
        }
      });

      // Create mapping from old IDs to new IDs
      const idMap = {};
      let currentNewId = maxNodeId;

      // Map preset nodes (skip source node "0" and visualisation node "1")
      const newNodes = preset.nodes
        .filter(node => node.id !== "0" && node.id !== "1")
        .map(node => {
          const newId = String(currentNewId);
          idMap[node.id] = newId;
          currentNewId++;

          return {
            ...node,
            id: newId,
            position: {
              x: node.position.x + 100, // Offset to avoid overlap
              y: node.position.y + 100
            }
          };
        });

      // Map preset edges (skip those connected to "0" or "1")
      const newEdges = preset.edges
        .filter(edge =>
          edge.source !== "0" && edge.source !== "1" &&
          edge.target !== "0" && edge.target !== "1"
        )
        .map(edge => ({
          ...edge,
          id: `e${idMap[edge.source]}-${idMap[edge.target]}`,
          source: idMap[edge.source],
          target: idMap[edge.target]
        }));

      // Add new nodes and edges to existing ones
      setNodes(prevNodes => [...prevNodes, ...newNodes]);
      setEdges(prevEdges => [...prevEdges, ...newEdges]);
      setNodeId(currentNewId);

      // Update time ranges if different
      if (preset.aggregateTimeRange) setAggregateTimeRange(preset.aggregateTimeRange);
      if (preset.sourceTimeRange) setSourceTimeRange(preset.sourceTimeRange);
    }

    setNodeSelectionPanelEvent(null);
  }, [
    nodeSelectionPanelEvent,
    setNodeSelectionPanelEvent,
    addMeasurementNode,
    addFieldNode,
    addTagNode,
    addSourceNode,
    addAggregationNode
  ]);

  // --------------------
  // Flux preview
  // --------------------
  useEffect(() => {
    const fluxResults = generateFlux();
    if (!fluxResults || fluxResults.length === 0) {
      setPreviewFlux(
        'No Flux yet.\nAdd connections and include a "Visualisation" node to complete the pipeline.'
      );
      return;
    }

    const formatWithLineNumbers = (s) =>
      (s || "")
        .trim()
        .split("\n")
        .map((line, i) => `${String(i + 1).padStart(3, " ")} │ ${line}`)
        .join("\n");

    const preview = fluxResults
      .map(r => {
        const nodeLines = (r.flux || "")
          .split(/(?=\|>)/)
          .map(l => l.trim())
          .filter(Boolean)
          .join("\n");

        return formatWithLineNumbers(nodeLines);
      })
      .join("\n\n");

    setPreviewFlux(preview);
  }, [nodes, edges, generateFlux, setPreviewFlux]);

  // --------------------
  // Run query and save dashboard
  // --------------------
  const runQuery = useCallback(async () => {
    setIsRunning(true);

    const fluxResults = generateFlux();
    if (!fluxResults || fluxResults.length === 0) {
      alert("No valid query generated.");
      setIsRunning(false);
      return;
    }

    const flux = fluxResults[0].flux;

    const hasSource = nodes.some(n => n.data?.nodeType === "sourceNode");
    const hasVis = nodes.some(n => n.data?.nodeType === "visualisationNode");
    if (!hasSource || !hasVis) {
      alert("Query requires source and visualisation nodes.");
      setIsRunning(false);
      return;
    }

    // Pull the latest title/description directly from Zustand
    const { localTitle, localDescription } = useNodeEditorStore.getState();

    const original = dashData.dashboard;
    const pid = Number(panelId);

    const updatedPanels = original.panels.map(panel => {
      if (panel.id !== pid) return panel;

      const targets = Array.isArray(panel.targets) && panel.targets.length > 0
        ? panel.targets.map(t => ({ ...t }))
        : [{ refId: "A", query: "", datasource: panel.datasource }];

      targets[0].query = flux;

      // Sync in title & description here
      return {
        ...panel,
        title: localTitle,
        description: localDescription,
        targets,
      };
    });

    const updatedDashboard = {
      ...original,
      panels: updatedPanels,
      version: (original.version ?? 0) + 1,
    };

    await updateMutation.mutateAsync({ folderUid, dashboard: updatedDashboard });
    setIsRunning(false);
    setRefreshKeyTrigger(true);
  }, [
    nodes,
    edges,
    dashData,
    panelId,
    folderUid,
    updateMutation,
    setRefreshKeyTrigger,
    generateFlux,
  ]);

  return (
    <div style={{ height: "100%", width: "100%", background: "#12131A", color: "white", display: "flex" }}>
      <div style={{ width: "100%", height: "100%", right: "0px" }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            nodesDraggable
            proOptions={{ hideAttribution: true }}

          >

            <Controls showInteractive={false} style={{ bottom: 10, right: 10, position: "absolute", left: "auto", flexDirection: 'column-reverse' }}>
              <ControlButton onClick={runQuery}>
                <FaPlay />
              </ControlButton>
              <ControlButton onClick={resetNodes}>
                <FaUndo />
              </ControlButton>

            </Controls>
            <Background />

          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div >
  );
}
