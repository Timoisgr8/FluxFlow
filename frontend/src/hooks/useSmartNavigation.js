import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import * as dashboardsApi from "../_api/dashboards.api";
import * as foldersApi from "../_api/folders.api";
import { folderKeys, dashboardKeys } from "../_queries/keys";

export function useSmartNavigation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { folderUid, dashboardUid, panelUid } = useParams();

  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToDefaultPage = useCallback(async () => {
    try {
      setIsNavigating(true);

      const folders = await queryClient.fetchQuery({
        queryKey: folderKeys.all,
        queryFn: () => foldersApi.getFolders(),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      if (!folders?.length) {
        navigate("/folder");
        return;
      }

      const dashboards = await queryClient.fetchQuery({
        queryKey: dashboardKeys.all(folders[0].uid),
        queryFn: () => dashboardsApi.getDashboards(folders[0].uid),
        staleTime: 2 * 60 * 1000, // 2 minutes
      });

      if (dashboards?.length) {
        navigate(`/folder/${folders[0].uid}/dashboard/${dashboards[0].uid}`);
      } else {
        navigate(`/folder/${folders[0].uid}`);
      }
    } catch (err) {
      console.error("Failed to fetch folders or dashboards:", err);
      navigate("/folder");
    } finally {
      setIsNavigating(false);
    }
  }, [queryClient, navigate]);

  const navigateToFirstDashboardIn = useCallback(async (folderUid) => {
    try {
      setIsNavigating(true);

      const folders = await queryClient.fetchQuery({
        queryKey: folderKeys.all,
        queryFn: () => foldersApi.getFolders(),
        staleTime: 5 * 60 * 1000,
      });

      if (!folders?.length) {
        navigate("/folder");
        return;
      }

      const dashboards = await queryClient.fetchQuery({
        queryKey: dashboardKeys.all(folderUid),
        queryFn: () => dashboardsApi.getDashboards(folderUid),
        staleTime: 2 * 60 * 1000,
      });

      if (dashboards?.length) {
        navigate(`/folder/${folderUid}/dashboard/${dashboards[0].uid}`);
      } else {
        navigate(`/folder/${folderUid}`);
      }
    } catch (err) {
      console.error("Failed to navigate to first dashboard:", err);
      navigate("/folder");
    } finally {
      setIsNavigating(false);
    }
  }, [queryClient, navigate]);

  const verifyDashboardPath = useCallback(async () => {
    if (!folderUid) return;

    try {
      setIsNavigating(true);

      const folders = await queryClient.fetchQuery({
        queryKey: folderKeys.all,
        queryFn: () => foldersApi.getFolders(),
        staleTime: 5 * 60 * 1000,
      });

      if (!folders?.length) {
        navigate("/folder");
        return;
      }

      const dashboards = await queryClient.fetchQuery({
        queryKey: dashboardKeys.all(folderUid),
        queryFn: () => dashboardsApi.getDashboards(folderUid),
        staleTime: 2 * 60 * 1000,
      });

      const dashboardExists = dashboards?.some(d => d.uid === dashboardUid);
      console.log("dashboardUid",dashboardUid)
      if (dashboardExists) {
        return;
      } else if (dashboards?.length) {
        console.log("Navigating to first dashboard because current UID invalid");
        navigate(`/folder/${folderUid}/dashboard/${dashboards[0].uid}`);
      } else {
        navigate(`/folder/${folderUid}`);
      }
    } catch (err) {
      console.error("Failed to verify dashboard path:", err);
      navigate("/folder");
    } finally {
      setIsNavigating(false);
    }
  }, [queryClient, navigate, folderUid, dashboardUid]);

  const verifyPanelEditorPath = useCallback(async () => {
    if (!folderUid || !dashboardUid || !panelUid) return;

    try {
      setIsNavigating(true);

      const folders = await queryClient.fetchQuery({
        queryKey: folderKeys.all,
        queryFn: () => foldersApi.getFolders(),
        staleTime: 5 * 60 * 1000,
      });

      if (!folders?.length) {
        navigate("/folder");
        return;
      }

      const dashboards = await queryClient.fetchQuery({
        queryKey: dashboardKeys.all(folderUid),
        queryFn: () => dashboardsApi.getDashboards(folderUid),
        staleTime: 2 * 60 * 1000,
      });

      const dashboardExists = dashboards?.some(d => d.uid === dashboardUid);

      if (dashboardExists) {
        const dashboardData = await queryClient.fetchQuery({
          queryKey: dashboardKeys.single(dashboardUid),
          queryFn: () => dashboardsApi.getDashboard(dashboardUid),
          staleTime: 1 * 60 * 1000, // 1 minute
        });

        const panelExists = dashboardData?.dashboard?.panels?.some(p => p.id === panelUid);

        if (panelExists) {
          return;
        } else {
          navigate(`/folder/${folderUid}/dashboard/${dashboardUid}`);
        }
      } else if (dashboards?.length) {
        navigate(`/folder/${folderUid}/dashboard/${dashboards[0].uid}`);
      } else {
        navigate(`/folder/${folderUid}`);
      }
    } catch (err) {
      console.error("Failed to verify panel editor path:", err);
      navigate("/folder");
    } finally {
      setIsNavigating(false);
    }
  }, [queryClient, navigate, folderUid, dashboardUid, panelUid]);

  return {
    navigateToDefaultPage,
    verifyDashboardPath,
    verifyPanelEditorPath,
    navigateToFirstDashboardIn,
    isNavigating,
  };
}