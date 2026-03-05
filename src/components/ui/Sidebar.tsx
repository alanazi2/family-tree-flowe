import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUsers, FaProjectDiagram, FaCrown } from "react-icons/fa";
import { useAuth } from "../../auth/useAuth";

export default function Sidebar() {
  const { systemRole } = useAuth();

  return (
    <aside className="sidebar">
      <NavLink className="sideLink" to="/">
        <FaHome /> الرئيسية
      </NavLink>

      <NavLink className="sideLink" to="/families">
        <FaUsers /> العوائل
      </NavLink>

      <NavLink className="sideLink" to="/tree">
        <FaProjectDiagram /> الشجرة
      </NavLink>

      {systemRole === "super_admin" || systemRole === "family_admin" ? (
        <NavLink className="sideLink" to="/dashboards/admin">
          <FaCrown /> لوحة الإدارة
        </NavLink>
      ) : (
        <NavLink className="sideLink" to="/dashboards/user">
          <FaCrown /> لوحتي
        </NavLink>
      )}
    </aside>
  );
}