import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "../components/ui/PageTransition";
import AnimatedCard from "../components/ui/AnimatedCard";
import toast from "react-hot-toast";
import { replaceMyInitialChildren, upsertMyProfileExtended } from "../lib/db";

type ChildInput = {
  child_name: string;
  child_birth_date: string;
};

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [grandfatherName, setGrandfatherName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalAddress, setNationalAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [hasChildren, setHasChildren] = useState(false);
  const [children, setChildren] = useState<ChildInput[]>([
    { child_name: "", child_birth_date: "" },
  ]);

  const [busy, setBusy] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "تسجيل الدخول" : "التسجيل الأولي"),
    [mode]
  );

  function updateChild(index: number, key: keyof ChildInput, value: string) {
    setChildren((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function addChildRow() {
    setChildren((prev) => [...prev, { child_name: "", child_birth_date: "" }]);
  }

  function removeChildRow(index: number) {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (!cleanEmail) throw new Error("أدخل البريد الإلكتروني");
      if (!cleanPassword) throw new Error("أدخل كلمة المرور");

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) throw error;

        toast.success("تم تسجيل الدخول");
        window.location.replace("/welcome-new-user");
        return;
      }

      if (!firstName.trim()) throw new Error("أدخل الاسم الأول");
      if (!fatherName.trim()) throw new Error("أدخل اسم الأب");
      if (!grandfatherName.trim()) throw new Error("أدخل اسم الجد");
      if (!familyName.trim()) throw new Error("أدخل اسم العائلة");
      if (!phone.trim()) throw new Error("أدخل رقم الجوال");
      if (!nationalAddress.trim()) throw new Error("أدخل العنوان الوطني");
      if (!birthDate) throw new Error("أدخل تاريخ الميلاد");

      const cleanedChildren = hasChildren
        ? children
            .map((c) => ({
              child_name: c.child_name.trim(),
              child_birth_date: c.child_birth_date || "",
            }))
            .filter((c) => c.child_name)
        : [];

      if (hasChildren && cleanedChildren.length === 0) {
        throw new Error("أدخل بيانات الأولاد أو اختر لا");
      }

      const { data, error } = await supabase.auth.signUp({
  email: cleanEmail,
  password: cleanPassword,
  options: {
    data: {
      first_name: firstName.trim(),
      father_name: fatherName.trim(),
      grandfather_name: grandfatherName.trim(),
      family_name: familyName.trim(),
      phone: phone.trim(),
      national_address: nationalAddress.trim(),
      birth_date: birthDate,
    },
  },
});

      if (error) throw error;
      if (!data.user) throw new Error("تعذر إنشاء المستخدم");

      if (!data.session) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (loginError) throw loginError;
      }

      await upsertMyProfileExtended({
        first_name: firstName.trim(),
        father_name: fatherName.trim(),
        grandfather_name: grandfatherName.trim(),
        family_name: familyName.trim(),
        phone: phone.trim(),
        national_address: nationalAddress.trim(),
        birth_date: birthDate,
      });

      await replaceMyInitialChildren(
        cleanedChildren.map((c) => ({
          child_name: c.child_name,
          child_birth_date: c.child_birth_date || null,
        }))
      );

      toast.success("تم التسجيل الأولي بنجاح");
      window.location.replace("/WelcomeNewUserPage");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "تعذر تنفيذ العملية");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="centerPage" dir="rtl">
      <PageTransition>
        <div style={{ maxWidth: 720, width: "100%" }}>
          <AnimatedCard
            title={title}
            subtitle={
              mode === "login"
                ? "ادخل البريد الإلكتروني وكلمة المرور"
                : "أدخل بياناتك الأساسية للتسجيل الأولي"
            }
            right={
              <button
                className="btnGhost"
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "تسجيل جديد" : "لدي حساب"}
              </button>
            }
          >
            <form onSubmit={onSubmit} className="form">
              {mode === "signup" && (
                <>
                  <div className="grid2">
                    <div>
                      <label className="label">الاسم الأول</label>
                      <input
                        className="input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">اسم الأب</label>
                      <input
                        className="input"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">اسم الجد</label>
                      <input
                        className="input"
                        value={grandfatherName}
                        onChange={(e) => setGrandfatherName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">اسم العائلة</label>
                      <input
                        className="input"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">رقم الجوال</label>
                      <input
                        className="input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">العنوان الوطني</label>
                      <input
                        className="input"
                        value={nationalAddress}
                        onChange={(e) => setNationalAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">تاريخ الميلاد</label>
                      <input
                        className="input"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <label className="label">هل لديك أولاد؟</label>
                  <select
                    className="select"
                    value={hasChildren ? "yes" : "no"}
                    onChange={(e) => setHasChildren(e.target.value === "yes")}
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم</option>
                  </select>

                  {hasChildren ? (
                    <div className="childrenBox">
                      {children.map((child, index) => (
                        <div key={index} className="childRow">
                          <div className="grid2">
                            <div>
                              <label className="label">اسم الابن / الابنة</label>
                              <input
                                className="input"
                                value={child.child_name}
                                onChange={(e) =>
                                  updateChild(index, "child_name", e.target.value)
                                }
                                required
                              />
                            </div>

                            <div>
                              <label className="label">تاريخ الميلاد</label>
                              <input
                                className="input"
                                type="date"
                                value={child.child_birth_date}
                                onChange={(e) =>
                                  updateChild(index, "child_birth_date", e.target.value)
                                }
                                required
                              />
                            </div>
                          </div>

                          {children.length > 1 ? (
                            <button
                              type="button"
                              className="btnDanger"
                              onClick={() => removeChildRow(index)}
                            >
                              حذف هذا الابن
                            </button>
                          ) : null}
                        </div>
                      ))}

                      <button type="button" className="btnGhost" onClick={addChildRow}>
                        إضافة ابن / ابنة
                      </button>
                    </div>
                  ) : null}
                </>
              )}

              <div className="grid2">
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label">كلمة المرور</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btnPrimary" disabled={busy}>
                {busy ? "جاري..." : mode === "login" ? "دخول" : "تسجيل أولي"}
              </button>
            </form>
          </AnimatedCard>
        </div>
      </PageTransition>
    </div>
  );

}


//RmsAdmin123456
//rms.admin@system.local