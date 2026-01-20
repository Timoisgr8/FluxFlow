// src/app.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDashboardStore } from "./_stores/dashboard.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCheckSession } from "./_queries/auth.query";
import Error from "./pages/Error/Error";

// Components & Pages
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PanelEditor from "./pages/PanelEditor/PanelEditor";
import Header from "./components/Header";
import NavigationBar from "./components/NavigationBar";
import OptionsPanel from "./pages/Dashboard/components/OptionsPanel";

// DevTools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

// Protected routes wrapper
function ProtectedLayout() {
  const { data: session, isLoading } = useCheckSession();
  if (isLoading) return <div className="bg-[#0c0d12] min-h-screen overflow-hidden">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Login wrapper
function LoginRoute() {
  const { data: session, isLoading } = useCheckSession();
  if (isLoading) return <div className="bg-[#0c0d12] min-h-screen overflow-hidden">Loading...</div>;
  if (session) return <Navigate to="/folder" replace />;
  return <Login />;
}

// Memoize Dashboard to prevent unnecessary re-renders
const MemoizedDashboard = React.memo(Dashboard, () => true);

// AppLayout with conditional rendering
function AppLayout() {
  const { folderUid, panelId } = useParams();
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapse, clearDashboard } = useDashboardStore();

  React.useEffect(() => {
    console.log("AppLayout Mounted. Should only appear once.");
  }, []);

  const isPanelOpen = Boolean(panelId);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1 flex-row overflow-hidden">
        {/* Animated Options Panel */}
        <div
          className={`
            transition-all duration-500 ease-in-out 
            overflow-hidden
            bg-[#12131A]
            ${isPanelOpen ? "w-0" : isCollapsed ? "w-[32px]" : "w-[400px] opacity-100"}
          `}
        >
          <OptionsPanel
            isCollapsed={isCollapsed}
            toggleCollapse={toggleCollapse}
            style={{ width: "100%", height: "100%" }}
            onDeleteSuccess={() => {
              clearDashboard();
              navigateToFirstDashboardIn(folderUid);
            }}
          />
        </div>

        {/* Main content area (expands when panel is open) */}
        <div
          className={`
            flex flex-col flex-1 overflow-hidden
            transition-all duration-500 ease-in-out
            ${isPanelOpen ? "ml-0" : "ml-0"}
          `}
        >
          <NavigationBar />
          {!panelId ? <MemoizedDashboard /> : <PanelEditor />}
        </div>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          {/* Protected section */}
          <Route element={<ProtectedLayout />}>
            <Route path="/folder" element={<Error />} />

            {/* Single route that handles all dashboard variations */}
            <Route path="/folder/:folderUid" element={<AppLayout />} />
            <Route path="/folder/:folderUid/dashboard/:dashboardUid" element={<AppLayout />} />
            <Route path="/folder/:folderUid/dashboard/:dashboardUid/panel/:panelId" element={<AppLayout />} />
          </Route>

          <Route path="*" element={<Navigate to="/folder" replace />} />
        </Routes>
        {/*<ReactQueryDevtools initialIsOpen={false} position="top-right" />*/}
      </Router>
    </QueryClientProvider>
  );
}