import { supabase } from "./supabaseClient";
import type {
  Family,
  FamilyMembership,
  Person,
  Relationship,
  SystemRole,
  UserProfile,
} from "../components/Tree/treeTypes";

function assertOk<T>(data: T | null, error: unknown): T {
  if (error) {
    const msg = (error as any)?.message ?? "Unknown error";
    throw new Error(msg);
  }
  if (!data) throw new Error("No data returned");
  return data;
}

// =========================
// Auth / Profile / Roles
// =========================

export async function getMyUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

export async function getMyProfile(): Promise<UserProfile> {
  const uid = await getMyUserId();

  const { data, error } = await supabase
    .from("user_profiles") // ✅ الصحيح
    .select("*")
    .eq("user_id", uid)
    .single();

  return assertOk<UserProfile>(data as any, error);
}

export async function upsertMyProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const uid = await getMyUserId();

  // ملاحظة: جدولك مفتاحه user_id (مو id)
  const row = { ...payload, user_id: uid };

  const { data, error } = await supabase
    .from("user_profiles") // ✅ الصحيح
    .upsert(row as any, { onConflict: "user_id" })
    .select("*")
    .single();

  return assertOk<UserProfile>(data as any, error);
}

export async function getMySystemRole(): Promise<SystemRole> {
  const uid = await getMyUserId();

  // جدولك ظاهر في القائمة: user_system_roles وفيه (user_id, role)
  const { data, error } = await supabase
    .from("user_system_roles")
    .select("role")
    .eq("user_id", uid)
    .single();

  if (error) {
    // إذا ما فيه صف — اعتبره member
    return "member";
  }

  const role = (data as any)?.role as SystemRole | undefined;
  return role ?? "member";
}

// =========================
// Families
// =========================

export async function listFamilies(): Promise<Family[]> {
  const { data, error } = await supabase
    .from("families")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function createFamily(input: {
  family_name: string;
  parent_family_id?: string | null;
}): Promise<Family> {
  // IMPORTANT:
  // تأكد من أعمدة جدول families عندك:
  // غالبًا الاسم: family_name وليس name
  // وفيه parent_family_id (اختياري)

  const row: any = {
    family_name: input.family_name,
    parent_family_id: input.parent_family_id ?? null,
  };

  const { data, error } = await supabase.from("families").insert([row]).select("*").single();
  return assertOk<Family>(data as any, error);
}

export async function deleteFamily(familyId: string): Promise<void> {
  // أغلب جداول Supabase يكون المفتاح id (uuid)
  const { error } = await supabase.from("families").delete().eq("id", familyId);
  if (error) throw new Error(error.message);
}

// =========================
// Memberships
// =========================

export async function listMyFamilies(): Promise<(FamilyMembership & { family: Family })[]> {
  // يعتمد على وجود علاقة FK من family_memberships.family_id إلى families.id
  const { data, error } = await supabase
    .from("family_memberships")
    .select("*, family:families(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function joinFamilyByCode(code: string): Promise<void> {
  const uid = await getMyUserId();

  // تأكد أن families فيها invite_code
  const { data: fam, error: e1 } = await supabase
    .from("families")
    .select("*")
    .eq("invite_code", code)
    .single();

  if (e1) throw new Error(e1.message);

  const { error } = await supabase.from("family_memberships").insert([
    {
      family_id: (fam as any).id,
      user_id: uid,
      role: "member",
    },
  ]);

  if (error) throw new Error(error.message);
}

export async function setFamilyMemberRole(args: {
  familyId: string;
  userId: string;
  role: "family_admin" | "member";
}) {
  const { error } = await supabase
    .from("family_memberships")
    .update({ role: args.role })
    .eq("family_id", args.familyId)
    .eq("user_id", args.userId);

  if (error) throw new Error(error.message);
}

// =========================
// Persons
// =========================

export async function listPersons(familyId: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function createPerson(
  familyId: string,
  payload: {
    full_name: string;
    gender: "male" | "female";
    birth_date?: string | null;
    is_deceased?: boolean;
    death_date?: string | null;
  }
): Promise<Person> {
  const row: any = {
    family_id: familyId,
    full_name: payload.full_name,
    gender: payload.gender,
    birth_date: payload.birth_date ?? null,
    is_deceased: payload.is_deceased ?? false,
    death_date: payload.death_date ?? null,
  };

  const { data, error } = await supabase.from("persons").insert([row]).select("*").single();
  return assertOk<Person>(data as any, error);
}

export async function deletePerson(personId: string): Promise<void> {
  const { error } = await supabase.from("persons").delete().eq("id", personId);
  if (error) throw new Error(error.message);
}

// =========================
// Relationships
// =========================
//
// عندك حالتين محتملة:
// 1) جدول relationships موجود (من سكربت المطور القديم)
// 2) أنت سويت جدول parent_child أبسط
//
// الكود تحت يحاول يستخدم relationships أولاً، وإذا ما موجود يرجع لـ parent_child.

async function tableExists(table: string): Promise<boolean> {
  // حل بسيط: نجرب select limit 1
  const { error } = await supabase.from(table).select("*").limit(1);
  return !error;
}

export async function listRelationships(familyId: string): Promise<Relationship[]> {
  const useRelationships = await tableExists("relationships");
  const table = useRelationships ? "relationships" : "parent_child";

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function createParentChild(params: {
  family_id: string;
  parent_id: string;
  child_id: string;
  parent_kind?: "father" | "mother";
}): Promise<Relationship> {
  const useRelationships = await tableExists("relationships");
  const table = useRelationships ? "relationships" : "parent_child";

  const payload: any = {
    family_id: params.family_id,
    parent_id: params.parent_id,
    child_id: params.child_id,
    parent_kind: params.parent_kind ?? "father",
  };

  const { data, error } = await supabase.from(table).insert([payload]).select("*").single();
  return assertOk<Relationship>(data as any, error);
}

export async function deleteRelationship(id: string): Promise<void> {
  const useRelationships = await tableExists("relationships");
  const table = useRelationships ? "relationships" : "parent_child";

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// =========================
// Aliases للتوافق
// =========================
export async function listFamilyMembers(familyId: string): Promise<Person[]> {
  return listPersons(familyId);
}

export async function listParentChild(familyId: string): Promise<Relationship[]> {
  return listRelationships(familyId);
}