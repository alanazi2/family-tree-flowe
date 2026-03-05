import React, { useEffect, useState } from "react";
import PageTransition from "../components/ui/PageTransition";
import AnimatedCard from "../components/ui/AnimatedCard";
import toast from "react-hot-toast";
import { joinFamilyByCode, listMyFamilies } from "../lib/db";
import { Link } from "react-router-dom";

export default function MyFamiliesPage() {
  const [code, setCode] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const x = await listMyFamilies();
    setItems(x as any);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, []);

  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      await joinFamilyByCode(code.trim());
      setCode("");
      toast.success("تم الانضمام للعائلة");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر الانضمام");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">عوائلي</h1>
        <p className="muted">انضم لعائلة بكود الدعوة ثم افتح شجرة العائلة.</p>

        <div className="grid2">
          <AnimatedCard title="انضمام لعائلة" subtitle="ادخل كود العائلة">
            <form className="form" onSubmit={onJoin}>
              <label className="label">كود الدعوة</label>
              <input className="input" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btnPrimary" disabled={busy}>{busy ? "جاري..." : "انضم"}</button>
            </form>
          </AnimatedCard>

          <AnimatedCard title="قائمة عوائلي" subtitle="افتح الشجرة">
            <table className="table">
              <thead>
                <tr>
                  <th>العائلة</th>
                  <th>دورك</th>
                  <th>فتح</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td>{x.family?.name}</td>
                    <td>{x.role}</td>
                    <td>
                      <Link className="btnGhost" to={`/tree/${x.family_id}`}>فتح الشجرة</Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr><td colSpan={3} className="muted">لم تنضم لأي عائلة بعد</td></tr>
                ) : null}
              </tbody>
            </table>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}