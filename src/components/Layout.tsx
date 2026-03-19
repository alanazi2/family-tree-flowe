import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  FaSitemap,
  FaUsers,
  FaUserCircle,
  FaSignOutAlt,
  FaCalendarAlt,
  FaCrown,
} from "react-icons/fa";

export default function Layout() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  async function doLogout() {
    await signOut();
    nav("/login");
  }

  return (
    <div className="shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand">
          <FaSitemap size={22} color="#E7D39A" />
          <div>
            <div className="brandTitle">آل محسن</div>
            <div className="brandSub">السجل الرسمي لشجرة العائلة</div>
          </div>
        </div>

        <div className="nav">
          <NavLink to="/dashboard">
            <FaUserCircle /> الصفحة العامة
          </NavLink>

          <NavLink to="/admin">
            <FaCrown /> لوحة إدارة العائلة
          </NavLink>

          <NavLink to="/admin/events">
            <FaCalendarAlt /> إدارة الفعاليات
          </NavLink>

          <NavLink to="/my-families">
            <FaUsers /> عوائلي
          </NavLink>

          <button className="btnGhost" onClick={doLogout} style={{ justifyContent: "center" }}>
            <FaSignOutAlt /> تسجيل خروج
          </button>
        </div>

        <div style={{ marginTop: 16 }} className="card">
          <div className="muted" style={{ fontSize: 12 }}>
            الحساب
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>
            {user?.email ?? "..."}
          </div>
        </div>

        <div style={{ marginTop: 10 }} className="muted">
          <Link to="/dashboard">العودة للرئيسية</Link>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}