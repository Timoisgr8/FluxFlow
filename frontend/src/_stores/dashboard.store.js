import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { dashboardKeys } from "../_queries/keys";
import * as api from "../_api/dashboards.api";

export const useDashboardStore = create(

  devtools((set, get) => ({
    // -----------------------------
    // UI state
    // -----------------------------
    isCollapsed: false,
    toggleCollapse: () =>
      set(
        (state) => ({ isCollapsed: !state.isCollapsed }),
        false,
        { type: "toggleCollapse" }
      ),
    setCollapse: (val) =>
      set({ isCollapsed: val }, false, { type: "setCollapse" }),

    // -----------------------------
    // Search (shared between components)
    // -----------------------------
    searchQuery: "",
    setSearchQuery: (q) =>
      set({ searchQuery: q }, false, { type: "setSearchQuery" }),

    // -----------------------------
    // Dashboard & Panels (client state only)
    // -----------------------------
    dashboardJson: null,
    panelLayout: [],
    panelChanges: [0, 0], // [pre-existing, temporary] represent tallies of panel changes (add or remove)
    setPanelChanges: (val) => set({ panelChanges: val }),

    // -----------------------------
    // Sync dashboard from TanStack Query (or API if not cached)
    // -----------------------------
    syncDashboardJson: async (dashboardUid, queryClient) => {
      // If no params provided, try to use current dashboard UID
      const currentDashboardUid = dashboardUid || get().dashboardJson?.dashboard?.uid;

      if (!currentDashboardUid) {
        console.warn("No dashboard UID available for sync");
        return;
      }

      // If no queryClient provided, we can't fetch from cache
      if (!queryClient) {
        console.warn("No queryClient provided for sync");
        return;
      }

      try {
        // Try to get from TanStack cache
        let data = await queryClient.fetchQuery({
          queryKey: dashboardKeys.single(currentDashboardUid),
          queryFn: () => api.getDashboard(currentDashboardUid),
        });

        // Convert panels to layout
        const layout = get().panelsToLayout(data?.dashboard?.panels || []);

        // Update store in a single call
        set(
          { dashboardJson: data, panelLayout: layout, panelChanges: [0, 0] },
          false,
          { type: "syncDashboardJson" }
        );



        return data;
      } catch (error) {
        console.error("Failed to sync dashboard:", error);
        throw error;
      }
    },

    // -----------------------------
    // Set dashboard data (for when TanStack Query updates)
    // -----------------------------
    setDashboardJson: (dashboardJson) => {
      const cleanedPanels =
        dashboardJson?.dashboard?.panels?.map((p) => ({
          ...p,
          temporary: false, // remove temporary flag when data comes from API
        })) || [];

      const layout = get().panelsToLayout(cleanedPanels);

      set(
        {
          dashboardJson: {
            ...dashboardJson,
            dashboard: {
              ...dashboardJson.dashboard,
              panels: cleanedPanels,
            },
          },
          panelLayout: layout,
        },
        false,
        { type: "setDashboardJson" }
      );
    },


    // -----------------------------
    // Panel layout helpers
    // -----------------------------
    setPanelLayout: (layout) =>
      set({ panelLayout: layout }, false, { type: "setPanelLayout" }),

    updatePanelLayout: (updatedLayout) =>
      set({ panelLayout: updatedLayout }, false, { type: "updatePanelLayout" }),

    addNewPanelToLayout: (options = {}) =>
      set((state) => {
        const { isTemporary = true } = options; // Default: temporary placeholder
        const prevLayout = state.panelLayout;
        const prevPanels = state.dashboardJson?.dashboard?.panels || [];

        // Find next available ID
        const maxId = Math.max(
          0,
          ...prevLayout.map((p) => parseInt(p.i, 10) || 0),
          ...prevPanels.map((p) => p.id || 0)
        );
        const newId = maxId + 1;

        // Compute placement
        const newY =
          prevLayout.length > 0
            ? Math.max(...prevLayout.map((p) => p.y + p.h))
            : 0;

        // Layout for grid
        const newPanelLayout = {
          i: String(newId),
          x: 0,
          y: newY,
          w: 6,
          h: 4,
          is_new: true,
        };

        // Panel JSON — temporary placeholder
        const newPanelData = {
          id: newId,
          title: isTemporary ? `Unsaved Panel ${newId}` : `New Panel ${newId}`,
          gridPos: { x: 0, y: newY, w: 6, h: 4 },
          type: isTemporary ? "placeholder" : "timeseries", // no iframe render
          targets: [],
          temporary: isTemporary,
        };

        // Update dashboard JSON safely
        const updatedDashboardJson = state.dashboardJson
          ? {
            ...state.dashboardJson,
            dashboard: {
              ...state.dashboardJson.dashboard,
              panels: [...prevPanels, newPanelData],
            },
          }
          : state.dashboardJson;



        return {
          panelChanges: [
            state.panelChanges ? state.panelChanges[0] : 0,
            state.panelChanges ? state.panelChanges[1] + 1 : 1
          ],
          panelLayout: [...prevLayout, newPanelLayout],
          dashboardJson: updatedDashboardJson,
        };
      }),


    // Converts an array of panels to react-grid-layout format
    panelsToLayout: (panelsArray) => {
      if (!Array.isArray(panelsArray)) return [];
      return panelsArray.map((p) => ({
        i: String(p.id),
        x: p.gridPos?.x ?? 0,
        y: p.gridPos?.y ?? 0,
        w: p.gridPos?.w ?? 6,
        h: p.gridPos?.h ?? 4,
        is_new: false,
      }));
    },

    // Helper to extract panels from full dashboard JSON and set panelLayout
    extractPanelsFromDashboard: (dashboardJson) => {
      if (!dashboardJson?.dashboard?.panels) {
        set({ panelLayout: [] }, false, { type: "extractPanelsFromDashboard" });
        return [];
      }
      const panels = dashboardJson.dashboard.panels;
      const layout = get().panelsToLayout(panels);
      set({ panelLayout: layout }, false, { type: "extractPanelsFromDashboard" });
      return panels;
    },

    getCurrentPanel: (panels) => {
      const { selectedPanelId } = get();
      if (!selectedPanelId || !Array.isArray(panels)) return null;
      return panels.find((p) => p.id === selectedPanelId) || null;
    },

    // Client-side panel deletion (updates layout and local dashboard state)
    deletePanel: (panelId) => {
      const { dashboardJson, panelLayout } = get();

      if (!panelId || !dashboardJson) return;

      const target_panel = dashboardJson.dashboard.panels.find(p => p.id === panelId);

      if (!target_panel) return; // safety check

      const updatedDashboardJson = {
        ...dashboardJson,
        dashboard: {
          ...dashboardJson.dashboard,
          panels: dashboardJson.dashboard.panels.filter(p => p.id !== panelId),
        },
      };

      const updatedPanelLayout = panelLayout.filter(item => item.i !== String(panelId));

      var currentPanelChanges = get().panelChanges;
      set(
        {
          panelChanges: [
            currentPanelChanges[0] + (target_panel.temporary ? 0 : 1),
            currentPanelChanges[1] - (target_panel.temporary ? 1 : 0),
          ],
          dashboardJson: updatedDashboardJson,
          panelLayout: updatedPanelLayout,
        },
        false,
        { type: "deletePanel" }
      );
    },

    // Clear dashboard state (useful for navigation or after deletion)
    clearDashboard: () =>
      set(
        { dashboardJson: null, panelLayout: [] },
        false,
        { type: "clearDashboard" }
      ),
  }))
);