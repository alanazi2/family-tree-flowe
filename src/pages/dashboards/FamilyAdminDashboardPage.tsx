import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../../components/ui/PageTransition";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { createPerson, deletePerson, listPersons } from "../../lib/db";

type PersonRow = {
  id: string;
  full_name: string;
  gender?: "male" | "female";
  birth_date?: string | null;
  is_deceased?: boolean;
};

const DEMO_FAMILY_ID = "demo-family";

export default function FamilyAdminDashboardPage() {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDate, setBirthDate] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const rows = await listPersons(DEMO_FAMILY_ID);
      setPeople(rows as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAddPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      setBusy(true);

      await createPerson(DEMO_FAMILY_ID, {
        full_name: fullName.trim(),
        gender,
        birth_date: birthDate || null,
        is_deceased: false,
        death_date: null,
      });

      setFullName("");
      setGender("male");
      setBirthDate("");
      await load();
    } catch (e) {
      console.error(e);
      alert("تعذر إضافة الشخص");
    } finally {
      setBusy(false);
    }
  }

  async function onDeletePerson(id: string) {
    const ok = window.confirm("هل أنت متأكد من حذف هذا الشخص؟");
    if (!ok) return;

    try {
      await deletePerson(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("تعذر حذف الشخص");
    }
  }

  const count = useMemo(() => people.length, [people]);

  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">لوحة إدارة آل محسن</h1>
        <p className="muted">إدارة الأفراد وبياناتهم الشخصية وربطهم في الشجرة.</p>

        <div className="grid2">
          <AnimatedCard title="إحصائية" subtitle="عدد الأشخاص">
            <div className="kpi">
              <strong>{count}</strong>
              <span>إجمالي الأفراد المسجلين</span>
            </div>
          </AnimatedCard>

          <AnimatedCard title="إضافة شخص جديد" subtitle="إدخال أولي سريع">
            <form className="form" onSubmit={onAddPerson}>
              <label className="label">الاسم الكامل</label>
              <input
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <label className="label">الجنس</label>
              <select
                className="select"
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>

              <label className="label">تاريخ الميلاد</label>
              <input
                className="input"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />

              <button className="btnPrimary" disabled={busy}>
                {busy ? "جاري الإضافة..." : "إضافة الشخص"}
              </button>
            </form>
          </AnimatedCard>
        </div>

        <div style={{ marginTop: 20 }} className="card">
          <div className="rowWrap" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: "#E7D39A" }}>الأشخاص</h3>
            <Link className="btnGhost" to="/tree/demo">
              عرض الشجرة
            </Link>
          </div>

          {loading ? (
            <div className="muted">جاري التحميل...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الجنس</th>
                  <th>الميلاد</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id}>
                    <td>{person.full_name}</td>
                    <td>{person.gender === "female" ? "أنثى" : "ذكر"}</td>
                    <td>{person.birth_date || "-"}</td>
                    <td>{person.is_deceased ? "متوفى" : "حي"}</td>
                    <td>
                      <div className="rowWrap">
                        <Link className="btnGhost" to={`/person/${person.id}`}>
                          البروفايل
                        </Link>
                        <button
                          className="btnDanger"
                          onClick={() => onDeletePerson(person.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageTransition>
  );
}