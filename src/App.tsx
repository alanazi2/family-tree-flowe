import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import RequireRole from "./auth/RequireRole";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import SuperAdminDashboardPage from "./pages/dashboards/SuperAdminDashboardPage";
import FamilyAdminDashboardPage from "./pages/dashboards/FamilyAdminDashboardPage";
import UserDashboardPage from "./pages/dashboards/UserDashboardPage";

import FamiliesPage from "./pages/FamiliesPage";
import MyFamiliesPage from "./pages/MyFamiliesPage";
import TreePage from "./pages/TreePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<UserDashboardPage />} />

        <Route
          path="super"
          element={
            <RequireRole allow={["super_admin"]}>
              <SuperAdminDashboardPage />
            </RequireRole>
          }
        />

        <Route
          path="admin"
          element={
            <RequireRole allow={["super_admin", "family_admin"]}>
              <FamilyAdminDashboardPage />
            </RequireRole>
          }
        />

        <Route
          path="families"
          element={
            <RequireRole allow={["super_admin"]}>
              <FamiliesPage />
            </RequireRole>
          }
        />

        <Route path="my-families" element={<MyFamiliesPage />} />

        <Route path="tree/:familyId" element={<TreePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}