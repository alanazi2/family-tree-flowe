import React from "react";
import PageTransition from "../../components/ui/PageTransition";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { useAuth } from "../../auth/useAuth";
import { Link } from "react-router-dom";

export default function UserDashboardPage() {
  const { profile, systemRole } = useAuth();

  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">لوحة المستخدم</h1>
        <p className="muted">هنا تبدأ. انضم لعائلة أو اذهب للشجرة.</p>

        <div className="grid2">
          <AnimatedCard title="ملفك الشخصي" subtitle="بياناتك الأساسية">
            <div className="kpi">
              <strong>{profile?.full_name ?? "..."}</strong>
              <span>الدور: {systemRole}</span>
            </div>
          </AnimatedCard>

          <AnimatedCard title="عوائلي" subtitle="انضم لعائلة أو افتح شجرة">
            <div className="rowWrap">
              <Link className="btnPrimary" to="/my-families">اذهب لصفحة عوائلي</Link>
              {systemRole === "super_admin" ? (
                <Link className="btnGhost" to="/families">إدارة كل العوائل</Link>
              ) : null}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}