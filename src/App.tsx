import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NewReportAgua } from "./components/reports/agua/NewReportAgua";
import { EditReportAgua } from "./components/reports/agua/EditReportAgua";
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
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/agua/new"
          element={
            <ProtectedRoute>
              <NewReportAgua />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/agua/:id/edit"
          element={
            <ProtectedRoute>
              <EditReportAgua />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
