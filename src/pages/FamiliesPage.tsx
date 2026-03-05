import React, { useEffect, useState } from "react";
import PageTransition from "../components/ui/PageTransition";
import AnimatedCard from "../components/ui/AnimatedCard";
import toast from "react-hot-toast";
import { createFamily, deleteFamily, listFamilies } from "../lib/db";
import type { Family } from "../components/Tree/treeTypes";
import { Link } from "react-router-dom";

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | "">( "" );
  const [busy, setBusy] = useState(false);

  async function load() {
    const f = await listFamilies();
    setFamilies(f);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    try {
      await createFamily({ family_name: name.trim(), parent_family_id: parentId || null });
      setName("");
      setParentId("");
      toast.success("تم إنشاء العائلة");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل إنشاء العائلة");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("متأكد من حذف العائلة؟")) return;
    try {
      await deleteFamily(id);
      toast.success("تم الحذف");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الحذف");
    }
  }

  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">إدارة العوائل</h1>
        <p className="muted">السوبر أدمن يضيف ويحذف العوائل ويحدد عائلة أم.</p>

        <div className="grid2">
          <AnimatedCard title="إنشاء عائلة جديدة" subtitle="عائلة تحت عائلة (اختياري)">
            <form className="form" onSubmit={onCreate}>
              <label className="label">اسم العائلة</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

              <label className="label">العائلة الأم (اختياري)</label>
              <select className="select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">بدون</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <button className="btnPrimary" disabled={busy}>
                {busy ? "جاري..." : "إنشاء"}
              </button>
            </form>
          </AnimatedCard>

          <AnimatedCard title="كل العوائل" subtitle="فتح الشجرة أو حذف">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الكود</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {families.map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td style={{ fontFamily: "monospace" }}>{f.invite_code}</td>
                    <td>
                      <div className="rowWrap">
                        <Link className="btnGhost" to={`/tree/${f.id}`}>فتح الشجرة</Link>
                        <button className="btnDanger" onClick={() => onDelete(f.id)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {families.length === 0 ? (
                  <tr><td colSpan={3} className="muted">لا يوجد عوائل</td></tr>
                ) : null}
              </tbody>
            </table>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}