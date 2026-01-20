// src/_queries/dashboards.query.js
import { useQuery } from "@tanstack/react-query";
import * as api from "../_api/dashboards.api";
import { dashboardKeys } from "./keys";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// Dashboards in a folder
export function useDashboards(folderUid) {
  return useQuery({
    queryKey: dashboardKeys.all(folderUid),
    queryFn: () => api.getDashboards(folderUid),
    enabled: !!folderUid, // don’t run unless folderUid is provided
  });
}

// Full dashboard JSON (with panels etc.)
export function useDashboard(dashboardUid) {
  return useQuery({
    queryKey: dashboardKeys.single(dashboardUid),
    queryFn: () => api.getDashboard(dashboardUid),
    enabled: !!dashboardUid,
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderUid, title = "", overwrite = false }) => {
      const existingDashboards =
        queryClient.getQueryData(dashboardKeys.all(folderUid)) || [];

      const generateUniqueTitle = (baseTitle = "New Dashboard") => {
        const existing = new Set(
          existingDashboards.map((d) => (d.title || "").toLowerCase())
        );
        if (!existing.has(baseTitle.toLowerCase())) return baseTitle;

        let i = 2;
        while (existing.has(`${baseTitle} (${i})`.toLowerCase())) i++;
        return `${baseTitle} (${i})`;
      };

      const finalTitle = title.trim() || generateUniqueTitle("New Dashboard");

      const payload = {
        dashboard: {
          title: finalTitle,
          panels: [],
          schemaVersion: 39,
          timezone: "browser",
        },
        overwrite,
        ...(folderUid ? { folderUid } : { folderId: 0 }),
      };

      const result = await api.createNewDashboard(payload);
      return { ...result, title: finalTitle };
    },
    onSuccess: (data, variables) => {
      const { folderUid } = variables;

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(folderUid),
      });

      queryClient.setQueryData(dashboardKeys.all(folderUid), (oldData) => {
        if (!oldData) return [data];
        return [data, ...oldData];
      });

      if (data.uid) {
        queryClient.setQueryData(dashboardKeys.single(data.uid), {
          dashboard: {
            id: data.id,
            uid: data.uid,
            title: data.title,
            panels: [],
            schemaVersion: 39,
            timezone: "browser",
            version: data.version || 0,
          },
          meta: {
            isStarred: false,
            url: data.url,
            folderId: data.folderId,
            folderUid: variables.folderUid,
            slug: data.slug,
          },
        });
      }
    },
    onError: (error) => {
      console.error("Failed to create dashboard:", error);
    },
  });
}

// Update an existing dashboard
export function useUpdateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderUid, dashboard }) =>
      api.updateDashboard(folderUid, dashboard),
    onSuccess: (data, variables) => {
      const { folderUid, dashboard } = variables;

      if (dashboard.uid) {
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.single(dashboard.uid),
        });
      }

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(folderUid),
      });

      queryClient.setQueryData(dashboardKeys.all(folderUid), (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((item) =>
          item.uid === dashboard.uid
            ? { ...item, title: dashboard.title, version: data.version }
            : item
        );
      });
    },
    onError: (error) => {
      console.error("Failed to update dashboard:", error);
    },
  });
}

// Delete a dashboard
export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid }) => api.deleteDashboard(uid),
    onSuccess: (data, variables) => {
      const { uid, folderUid } = variables;

      queryClient.removeQueries({
        queryKey: dashboardKeys.single(uid),
      });

      queryClient.setQueryData(dashboardKeys.all(folderUid), (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((item) => item.uid !== uid);
      });

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(folderUid),
      });
    },
    onError: (error) => {
      console.error("Failed to delete dashboard:", error);
    },
  });
}

// Convenience hook for creating dashboards with state
export function useCreateDashboardWithState() {
  const createMutation = useCreateDashboard();

  return {
    creating: createMutation.isPending,
    createDashboard: async (folderUid, title = "") => {
      if (!folderUid) {
        throw new Error("folderUid is required to create a dashboard");
      }

      try {
        return await createMutation.mutateAsync({
          folderUid,
          title,
          overwrite: false,
        });
      } catch (error) {
        console.error("Error creating dashboard:", error);
        throw error;
      }
    },
    error: createMutation.error,
    isError: createMutation.isError,
    reset: createMutation.reset,
  };
}