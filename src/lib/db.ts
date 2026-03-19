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
    .from("user_profiles")
    .select("*")
    .eq("user_id", uid)
    .single();

  return assertOk<UserProfile>(data as any, error);
}

export async function upsertMyProfile(
  payload: Partial<UserProfile>
): Promise<UserProfile> {
  const uid = await getMyUserId();

  const row = { ...payload, user_id: uid };

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(row as any, { onConflict: "user_id" })
    .select("*")
    .single();

  return assertOk<UserProfile>(data as any, error);
}

export async function getMySystemRole(): Promise<SystemRole> {
  const uid = await getMyUserId();

  const { data, error } = await supabase
    .from("user_system_roles")
    .select("role")
    .eq("user_id", uid)
    .single();

  if (error) return "member";

  const role = (data as any)?.role as SystemRole | undefined;
  return role ?? "member";
}

export async function upsertMyProfileExtended(payload: {
  first_name: string;
  father_name?: string | null;
  grandfather_name?: string | null;
  family_name?: string | null;
  phone?: string | null;
  national_address?: string | null;
  birth_date?: string | null;
}) {
  const uid = await getMyUserId();

  const fullName = [
    payload.first_name?.trim(),
    payload.father_name?.trim(),
    payload.grandfather_name?.trim(),
    payload.family_name?.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const row = {
    user_id: uid,
    first_name: payload.first_name ?? null,
    full_name: fullName,
    father_name: payload.father_name ?? null,
    grandfather_name: payload.grandfather_name ?? null,
    family_name: payload.family_name ?? null,
    phone: payload.phone ?? null,
    national_address: payload.national_address ?? null,
    birth_date: payload.birth_date ?? null,
    is_active: true,
    status: 1,
    must_change_password_on_next_login: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
export async function replaceMyInitialChildren(
  children: { child_name: string; child_birth_date?: string | null }[]
) {
  const uid = await getMyUserId();

  const { error: deleteError } = await supabase
    .from("user_initial_children")
    .delete()
    .eq("user_id", uid);

  if (deleteError) throw new Error(deleteError.message);

  if (!children.length) return [];

  const rows = children.map((child) => ({
    user_id: uid,
    child_name: child.child_name,
    child_birth_date: child.child_birth_date ?? null,
  }));

  const { data, error } = await supabase
    .from("user_initial_children")
    .insert(rows)
    .select("*");

  if (error) throw new Error(error.message);
  return data ?? [];
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
  const row: any = {
    family_name: input.family_name,
    parent_family_id: input.parent_family_id ?? null,
  };

  const { data, error } = await supabase
    .from("families")
    .insert([row])
    .select("*")
    .single();

  return assertOk<Family>(data as any, error);
}

export async function deleteFamily(familyId: string): Promise<void> {
  const { error } = await supabase.from("families").delete().eq("id", familyId);
  if (error) throw new Error(error.message);
}

// =========================
// Memberships
// =========================

export async function listMyFamilies(): Promise<
  (FamilyMembership & { family: Family })[]
> {
  const { data, error } = await supabase
    .from("family_memberships")
    .select("*, family:families(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function joinFamilyByCode(code: string): Promise<void> {
  const uid = await getMyUserId();

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

  const { data, error } = await supabase
    .from("persons")
    .insert([row])
    .select("*")
    .single();

  return assertOk<Person>(data as any, error);
}

export async function updatePerson(
  personId: string,
  payload: Partial<{
    full_name: string;
    gender: "male" | "female";
    birth_date: string | null;
    is_deceased: boolean;
    death_date: string | null;
  }>
): Promise<Person> {
  const { data, error } = await supabase
    .from("persons")
    .update(payload)
    .eq("id", personId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as any;
}

export async function deletePerson(personId: string): Promise<void> {
  const { error } = await supabase.from("persons").delete().eq("id", personId);
  if (error) throw new Error(error.message);
}

// =========================
// Person Profiles
// =========================

export type PersonProfile = {
  person_id: string;
  bio?: string | null;
  birth_place?: string | null;
  residence?: string | null;
  phone?: string | null;
  email?: string | null;
  occupation?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function getPersonProfile(
  personId: string
): Promise<PersonProfile | null> {
  const { data, error } = await supabase
    .from("person_profiles")
    .select("*")
    .eq("person_id", personId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as any;
}

export async function upsertPersonProfile(
  personId: string,
  payload: Omit<PersonProfile, "person_id">
): Promise<PersonProfile> {
  const row = {
    person_id: personId,
    ...payload,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("person_profiles")
    .upsert(row, { onConflict: "person_id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as any;
}

// =========================
// Relationships
// =========================

async function tableExists(table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select("*").limit(1);
  return !error;
}

export async function listRelationships(
  familyId: string
): Promise<Relationship[]> {
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

  const { data, error } = await supabase
    .from(table)
    .insert([payload])
    .select("*")
    .single();

  return assertOk<Relationship>(data as any, error);
}

export async function deleteRelationship(id: string): Promise<void> {
  const useRelationships = await tableExists("relationships");
  const table = useRelationships ? "relationships" : "parent_child";

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// =========================
// Events
// =========================

export type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  family_id?: string | null;
  is_public: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function listEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function listUpcomingEvents(): Promise<EventItem[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", today)
    .eq("is_public", true)
    .order("event_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function createEvent(payload: {
  title: string;
  description?: string | null;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  family_id?: string | null;
  is_public?: boolean;
}): Promise<EventItem> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const { data, error } = await supabase
    .from("events")
    .insert([
      {
        ...payload,
        created_by: userId,
        is_public: payload.is_public ?? true,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as any;
}

export async function updateEvent(
  eventId: string,
  payload: Partial<{
    title: string;
    description: string | null;
    event_date: string;
    event_time: string | null;
    location: string | null;
    is_public: boolean;
  }>
): Promise<EventItem> {
  const { data, error } = await supabase
    .from("events")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as any;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
}

// =========================
// Aliases للتوافق
// =========================

export async function listFamilyMembers(familyId: string): Promise<Person[]> {
  return listPersons(familyId);
}

export async function listParentChild(
  familyId: string
): Promise<Relationship[]> {
  return listRelationships(familyId);
}
 