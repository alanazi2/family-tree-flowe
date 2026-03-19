import React from "react";
import { NavLink } from "react-router-dom";
import { FaCalendarAlt, FaCrown, FaSitemap, FaUsers } from "react-icons/fa";
import { useAuth } from "../../auth/useAuth";

export default function Sidebar() {
  const { systemRole } = useAuth();

  return (
    <div className="nav" dir="rtl">
      <NavLink to="/dashboard">
        <FaSitemap /> الصفحة العامة
      </NavLink>

      {(systemRole === "family_admin" || systemRole === "super_admin") && (
        <NavLink to="/admin">
          <FaCrown /> لوحة إدارة العائلة
        </NavLink>
      )}

      {(systemRole === "family_admin" || systemRole === "super_admin") && (
        <NavLink to="/admin/events">
          <FaCalendarAlt /> إدارة الفعاليات
        </NavLink>
      )}

      <NavLink to="/my-families">
        <FaUsers /> عوائلي
      </NavLink>
    </div>
  );
}