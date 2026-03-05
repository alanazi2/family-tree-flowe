import React from "react";
import { FaSitemap, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../auth/useAuth";

export default function Topbar() {
  const { user, signOut } = useAuth();

  return (
    <div className="topbar">
      <div className="brand">
        <FaSitemap />
        <div>
          <div className="brandTitle">شجرة العائلة</div>
          <div className="brandSub">نظام إدخال ذاتي للعوائل</div>
        </div>
      </div>

      <div className="topbarRight">
        <div className="chip">{user?.email ?? "زائر"}</div>
        <button className="btn" onClick={signOut}>
          <FaSignOutAlt /> خروج
        </button>
      </div>
    </div>
  );
}