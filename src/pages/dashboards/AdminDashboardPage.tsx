import React from "react";
import PageTransition from "../../components/ui/PageTransition";
import AnimatedCard from "../../components/ui/AnimatedCard";

export default function AdminDashboardPage() {
  return (
    <div dir="rtl" style={{ padding: 16 }}>
      <PageTransition>
        <div style={{ display: "grid", gap: 12 }}>
          <h1 className="pageTitle">لوحة الأدمن</h1>
          <p className="muted">هنا إدارة العوائل والأفراد والصلاحيات.</p>

          <AnimatedCard title="الإدارة" subtitle="قريباً">
            <div className="muted">
              إضافة/حذف أفراد، إدارة العائلة، إدارة الفعاليات، إدارة الشجرة.
            </div>
          </AnimatedCard>
        </div>
      </PageTransition>
    </div>
  );
}