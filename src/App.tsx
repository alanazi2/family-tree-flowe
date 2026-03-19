import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import WelcomeNewUserPage from "./pages/WelcomeNewUserPage";
import SuperAdminDashboardPage from "./pages/dashboards/SuperAdminDashboardPage";
import FamilyAdminDashboardPage from "./pages/dashboards/FamilyAdminDashboardPage";
import UserDashboardPage from "./pages/dashboards/UserDashboardPage";

import FamiliesPage from "./pages/FamiliesPage";
import MyFamiliesPage from "./pages/MyFamiliesPage";
import TreePage from "./pages/TreePage";
import PersonProfilePage from "./pages/PersonProfilePage";
import EventsAdminPage from "./pages/admin/EventsAdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/welcome-new-user" element={<WelcomeNewUserPage />} />

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
        <Route path="super" element={<SuperAdminDashboardPage />} />
        <Route path="admin" element={<FamilyAdminDashboardPage />} />
        <Route path="admin/events" element={<EventsAdminPage />} />
        <Route path="families" element={<FamiliesPage />} />
        <Route path="my-families" element={<MyFamiliesPage />} />
        <Route path="tree/:familyId" element={<TreePage />} />
        <Route path="person/:personId" element={<PersonProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}