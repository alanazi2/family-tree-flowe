import React from "react";
import PageTransition from "../../components/ui/PageTransition";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { Link } from "react-router-dom";

export default function FamilyAdminDashboardPage() {
  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">لوحة إدارة العائلة</h1>
        <p className="muted">إدارة شجرة عائلتك (أفراد/علاقات/تنظيم).</p>

        <div className="grid2">
          <AnimatedCard title="عوائلي" subtitle="افتح شجرة عائلتك وابدأ">
            <div className="rowWrap">
              <Link className="btnPrimary" to="/my-families">اذهب لصفحة عوائلي</Link>
            </div>
          </AnimatedCard>

          <AnimatedCard title="أفضل ممارسة" subtitle="تنظيم البيانات">
            <div className="muted" style={{ lineHeight: 1.8 }}>
              ابدأ بإضافة “الأصول” (الجيل الأول) ثم أضف الأبناء واربطهم.
              بعد ذلك أكمل بقية التفاصيل.
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}