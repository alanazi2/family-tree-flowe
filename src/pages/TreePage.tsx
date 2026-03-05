import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import toast from "react-hot-toast";

import PageTransition from "../components/ui/PageTransition";
import AnimatedCard from "../components/ui/AnimatedCard";
import FamilyMemberNode from "../components/Tree/FamilyMemberNode";
import { layoutDagre, toNodesEdges } from "../components/Tree/useFamilyTree";
import { createParentChild, createPerson, listParentChild, listFamilyMembers } from "../lib/db";
import type { Person } from "../components/Tree/treeTypes";
import { useAuth } from "../auth/useAuth";

const nodeTypes = { member: FamilyMemberNode };

export default function TreePage() {
  const { familyId } = useParams();
  const { systemRole } = useAuth();

  const canEdit = systemRole === "super_admin" || systemRole === "family_admin";

  const [persons, setPersons] = useState<Person[]>([]);
  const [rels, setRels] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");

  const [parentId, setParentId] = useState("");
  const [childId, setChildId] = useState("");

  async function load() {
    if (!familyId) return;
    const [p, r] = await Promise.all([listFamilyMembers(familyId), listParentChild(familyId)]);
    setPersons(p);
    setRels(r as any);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, [familyId]);

  const { nodes, edges } = useMemo(() => {
    const x = toNodesEdges(persons, rels);
    const laid = layoutDagre(x.nodes, x.edges);
    return { nodes: laid, edges: x.edges };
  }, [persons, rels]);

  async function onAddPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!familyId) return;
    if (!fullName.trim()) return;

    setBusy(true);
    try {
      await createPerson(familyId, { full_name: fullName.trim(), gender });
      setFullName("");
      toast.success("تمت إضافة الشخص");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الإضافة");
    } finally {
      setBusy(false);
    }
  }

  async function onLink(e: React.FormEvent) {
    e.preventDefault();
    if (!familyId) return;
    if (!parentId || !childId) return;

    setBusy(true);
    try {
      await createParentChild({ family_id: familyId, parent_id: parentId, child_id: childId, parent_kind: "father" });
      toast.success("تم الربط");
      setParentId("");
      setChildId("");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل الربط");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">شجرة العائلة</h1>
        <p className="muted">عرض الشجرة باستخدام React Flow + dagre.</p>

        {canEdit ? (
          <div className="grid2" style={{ marginBottom: 14 }}>
            <AnimatedCard title="إضافة فرد" subtitle="بيانات أساسية">
              <form className="form" onSubmit={onAddPerson}>
                <label className="label">الاسم الكامل</label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />

                <label className="label">الجنس</label>
                <select className="select" value={gender} onChange={(e) => setGender(e.target.value as any)}>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>

                <button className="btnPrimary" disabled={busy}>{busy ? "..." : "إضافة"}</button>
              </form>
            </AnimatedCard>

            <AnimatedCard title="ربط أب/أم مع ابن" subtitle="Parent → Child">
              <form className="form" onSubmit={onLink}>
                <label className="label">الأب/الأم</label>
                <select className="select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">اختر</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>

                <label className="label">الابن/الابنة</label>
                <select className="select" value={childId} onChange={(e) => setChildId(e.target.value)}>
                  <option value="">اختر</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>

                <button className="btnPrimary" disabled={busy}>{busy ? "..." : "ربط"}</button>
              </form>
            </AnimatedCard>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="muted">* لا تملك صلاحية التعديل. يمكنك فقط العرض.</div>
          </div>
        )}

        <div className="rfWrap">
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </PageTransition>
  );
}