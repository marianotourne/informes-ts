import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Reports } from "./components/Reports";
import { Clients } from "./components/Clients";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AguaReportForm } from "./components/reports/agua/AguaReportForm";
import { ViewReportAgua } from "./components/reports/agua/ViewReportAgua";
import { Toaster } from "@/components/ui/Toaster";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Layout>
                <Clients />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/agua/new"
          element={
            <ProtectedRoute>
              <AguaReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/agua/:id/edit"
          element={
            <ProtectedRoute>
              <AguaReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/agua/:id/view"
          element={
            <ProtectedRoute>
              <ViewReportAgua />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
