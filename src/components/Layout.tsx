import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { FaSitemap, FaShieldAlt, FaUsers, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

export default function Layout() {
  const { profile, systemRole, signOut } = useAuth();
  const nav = useNavigate();

  async function doLogout() {
    await signOut();
    nav("/login");
  }

  return (
    <div className="shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand">
          <FaSitemap size={22} />
          <div>
            <div className="brandTitle">شجرة العائلة</div>
            <div className="brandSub">
              {systemRole === "super_admin" ? "سوبر أدمن" : systemRole === "family_admin" ? "أدمن عائلة" : "مستخدم"}
            </div>
          </div>
        </div>

        <div className="nav">
          <NavLink to="/dashboard">
            <FaUserCircle /> لوحة المستخدم
          </NavLink>

          {(systemRole === "super_admin" || systemRole === "family_admin") && (
            <NavLink to="/admin">
              <FaUsers /> لوحة إدارة العائلة
            </NavLink>
          )}

          {systemRole === "super_admin" && (
            <>
              <NavLink to="/super">
                <FaShieldAlt /> لوحة السوبر أدمن
              </NavLink>
              <NavLink to="/families">
                <FaUsers /> العوائل (إدارة)
              </NavLink>
            </>
          )}

          <NavLink to="/my-families">
            <FaUsers /> عوائلي
          </NavLink>

          <button className="btnGhost" onClick={doLogout} style={{ justifyContent: "center" }}>
            <FaSignOutAlt /> تسجيل خروج
          </button>
        </div>

        <div style={{ marginTop: 16 }} className="card">
          <div className="muted" style={{ fontSize: 12 }}>الملف الشخصي</div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>{profile?.full_name ?? "..."}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            {profile?.user_id ?? ""}
          </div>
        </div>

        <div style={{ marginTop: 10 }} className="muted">
          <Link to="/dashboard">العودة</Link>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}