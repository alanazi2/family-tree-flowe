import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import AnimatedCard from "../components/ui/AnimatedCard";
import {
  getPersonProfile,
  listPersons,
  upsertPersonProfile,
  updatePerson,
} from "../lib/db";

export default function PersonProfilePage() {
  const { personId } = useParams();
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [isDeceased, setIsDeceased] = useState(false);

  const [bio, setBio] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [residence, setResidence] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!personId) return;

    try {
      setLoading(true);

      const persons = await listPersons("demo-family");
      const person = persons.find((x: any) => x.id === personId);
      if (!person) throw new Error("Person not found");

      setFullName(person.full_name ?? "");
      setGender(person.gender ?? "male");
      setBirthDate(person.birth_date ?? "");
      setDeathDate(person.death_date ?? "");
      setIsDeceased(!!person.is_deceased);

      const profile = await getPersonProfile(personId);
      setBio(profile?.bio ?? "");
      setBirthPlace(profile?.birth_place ?? "");
      setResidence(profile?.residence ?? "");
      setPhone(profile?.phone ?? "");
      setEmail(profile?.email ?? "");
      setOccupation(profile?.occupation ?? "");
      setNotes(profile?.notes ?? "");
    } catch (e) {
      console.error(e);
      alert("تعذر تحميل البروفايل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [personId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!personId) return;

    try {
      setBusy(true);

      await updatePerson(personId, {
        full_name: fullName,
        gender,
        birth_date: birthDate || null,
        is_deceased: isDeceased,
        death_date: deathDate || null,
      });

      await upsertPersonProfile(personId, {
        bio,
        birth_place: birthPlace,
        residence,
        phone,
        email,
        occupation,
        notes,
      });

      alert("تم حفظ البيانات بنجاح");
      await load();
    } catch (e) {
      console.error(e);
      alert("تعذر حفظ البيانات");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 24, direction: "rtl" }}>جاري التحميل...</div>;
  }

  return (
    <PageTransition>
      <div>
        <div className="rowWrap" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <h1 className="pageTitle">البروفايل الشخصي</h1>
          <button className="btnGhost" onClick={() => nav(-1)}>
            رجوع
          </button>
        </div>

        <form onSubmit={onSave}>
          <div className="grid2">
            <AnimatedCard title="البيانات الأساسية" subtitle="بيانات الشخص الرئيسية">
              <div className="form">
                <label className="label">الاسم الكامل</label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />

                <label className="label">الجنس</label>
                <select className="select" value={gender} onChange={(e) => setGender(e.target.value as any)}>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>

                <label className="label">تاريخ الميلاد</label>
                <input className="input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />

                <label className="label">هل هو متوفى؟</label>
                <select className="select" value={isDeceased ? "yes" : "no"} onChange={(e) => setIsDeceased(e.target.value === "yes")}>
                  <option value="no">لا</option>
                  <option value="yes">نعم</option>
                </select>

                <label className="label">تاريخ الوفاة</label>
                <input className="input" type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} />
              </div>
            </AnimatedCard>

            <AnimatedCard title="بيانات إضافية" subtitle="البروفايل والتفاصيل">
              <div className="form">
                <label className="label">نبذة</label>
                <textarea className="textarea" value={bio} onChange={(e) => setBio(e.target.value)} />

                <label className="label">مكان الميلاد</label>
                <input className="input" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />

                <label className="label">مكان السكن</label>
                <input className="input" value={residence} onChange={(e) => setResidence(e.target.value)} />

                <label className="label">رقم الجوال</label>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />

                <label className="label">البريد الإلكتروني</label>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label className="label">الوظيفة</label>
                <input className="input" value={occupation} onChange={(e) => setOccupation(e.target.value)} />

                <label className="label">ملاحظات</label>
                <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </AnimatedCard>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btnPrimary" disabled={busy}>
              {busy ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}