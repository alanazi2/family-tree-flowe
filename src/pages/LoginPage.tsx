import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import PageTransition from "../components/ui/PageTransition";
import AnimatedCard from "../components/ui/AnimatedCard";
import toast from "react-hot-toast";
import { upsertMyProfile } from "../lib/db";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => (mode === "login" ? "تسجيل الدخول" : "تسجيل جديد"), [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // بعد التسجيل: نكتب profile
        if (data.user) {
          await upsertMyProfile({
            full_name: fullName || "مستخدم جديد",
            system_role: "member",
            is_active: true,
            status: 1,
            must_change_password_on_next_login: false,
          } as any);
        }

        toast.success("تم إنشاء الحساب ✅");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "تعذر العملية");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="centerPage" dir="rtl">
      <PageTransition>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <AnimatedCard
            title={title}
            subtitle={mode === "login" ? "ادخل بريدك وكلمة المرور" : "أنشئ حسابك وابدأ بإضافة عائلتك"}
            right={
              <button className="btnGhost" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "مستخدم جديد؟" : "لدي حساب"}
              </button>
            }
          >
            <form onSubmit={onSubmit} className="form">
              {mode === "signup" && (
                <>
                  <label className="label">الاسم الكامل</label>
                  <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </>
              )}

              <label className="label">البريد الإلكتروني</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

              <label className="label">كلمة المرور</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <button className="btnPrimary" disabled={busy}>
                {busy ? "جاري..." : mode === "login" ? "دخول" : "تسجيل"}
              </button>

              <div className="muted" style={{ fontSize: 12 }}>
                * إذا كنت مفعّل “Email confirmations” في Supabase قد تحتاج تأكيد البريد أولاً.
              </div>
            </form>
          </AnimatedCard>
        </div>
      </PageTransition>
    </div>
  );
}