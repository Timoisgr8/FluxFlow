import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useNodeEditorStore = create(devtools((set) => ({
  nodeSelectionPanelEvent: null,
  setNodeSelectionPanelEvent: (value) => set({ nodeSelectionPanelEvent: value }),

  // Flux preview string
  previewFlux: "",
  setPreviewFlux: (flux) => set({ previewFlux: flux || "" }),

  // Aggregate time range
  aggregateTimeRange: "5m",
  setAggregateTimeRange: (range) => set({ aggregateTimeRange: range }),

  // Source time range
  sourceTimeRange: "1h",
  setSourceTimeRange: (range) => set({ sourceTimeRange: range }),

  refreshKeyTrigger: false,
  setRefreshKeyTrigger: (value) => set({ refreshKeyTrigger: value }),

  localTitle: "",
  setLocalTitle: (title) => set({ localTitle: title }),

  localDescription: "",
  setLocalDescription: (description) => set({ localDescription: description }),

})));