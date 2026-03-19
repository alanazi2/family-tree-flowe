import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { SystemRole } from "../components/Tree/treeTypes";

export default function RequireRole({
  allow,
  children,
}: {
  allow: SystemRole[];
  children: React.ReactNode;
}) {
  const { loading, user, systemRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 24, direction: "rtl" }}>جاري التحقق من الصلاحيات...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allow.includes(systemRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}