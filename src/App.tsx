import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Reports } from "./components/Reports";
import { Clients } from "./components/Clients";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AguaReportForm } from "./components/reports/agua/AguaReportForm";
import { ViewReportAgua } from "./components/reports/agua/ViewReportAgua";
import { Toaster } from "@/components/ui/Toaster";
import { AlimentosReportForm } from "./components/reports/alimentos/AlimentosReportForm";
import { ViewReportAlimentos } from "./components/reports/alimentos/ViewReportAlimentos";
import { NutricionReportForm } from "./components/reports/nutricion/NutricionReportForm";
import { ViewReportNutricion } from "./components/reports/nutricion/ViewReportNutricion";

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
            <ProtectedRoute soloInternos>
              <Layout>
                <Clients />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/agua/new"
          element={
            <ProtectedRoute soloInternos>
              <AguaReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/agua/:id/edit"
          element={
            <ProtectedRoute soloInternos>
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

        <Route
          path="/reports/alimentos/new"
          element={
            <ProtectedRoute soloInternos>
              <AlimentosReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/alimentos/:id/edit"
          element={
            <ProtectedRoute soloInternos>
              <AlimentosReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/alimentos/:id/view"
          element={
            <ProtectedRoute>
              <ViewReportAlimentos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/nutricion/new"
          element={
            <ProtectedRoute soloInternos>
              <NutricionReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/nutricion/:id/edit"
          element={
            <ProtectedRoute soloInternos>
              <NutricionReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/nutricion/:id/view"
          element={
            <ProtectedRoute>
              <ViewReportNutricion />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
