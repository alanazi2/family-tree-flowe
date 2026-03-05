import React, { useEffect, useState } from "react";
import PageTransition from "../../components/ui/PageTransition";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { listFamilies } from "../../lib/db";

export default function SuperAdminDashboardPage() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    listFamilies().then((x) => setCount(x.length)).catch(console.error);
  }, []);

  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">لوحة السوبر أدمن</h1>
        <p className="muted">إدارة النظام بالكامل (عائلات/صلاحيات/محتوى).</p>

        <div className="grid2">
          <AnimatedCard title="إحصائيات" subtitle="نظرة سريعة">
            <div className="kpi">
              <strong>{count}</strong>
              <span>عدد العوائل (كل النظام)</span>
            </div>
          </AnimatedCard>

          <AnimatedCard title="ملاحظات مهمة" subtitle="عن إنشاء السوبر أدمن">
            <div className="muted" style={{ lineHeight: 1.8 }}>
              - إنشاء مستخدمين Auth مباشرة بـ SQL غير متاح في Supabase Hosted. <br />
              - أنشئ الحسابات من Auth → Users أو من واجهة التسجيل. <br />
              - ثم اجعلهم سوبر أدمن بتحديث profile.system_role إلى <b>super_admin</b>.
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}