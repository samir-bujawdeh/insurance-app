import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { UsersPage } from "@/pages/UsersPage";
import { PoliciesPage } from "@/pages/PoliciesPage";
import { ClaimsPage } from "@/pages/ClaimsPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { ProvidersPage } from "@/pages/ProvidersPage";
import { UploadPage } from "@/pages/UploadPage";
import { TariffsPage } from "@/pages/TariffsPage";
import { PlanCriteriaPage } from "@/pages/PlanCriteriaPage";
import { LogsPage } from "@/pages/LogsPage";
import { SettingsPage } from "@/pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/claims" element={<ClaimsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/providers" element={<ProvidersPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/tariffs" element={<TariffsPage />} />
              <Route path="/criteria" element={<PlanCriteriaPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
