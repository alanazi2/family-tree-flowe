export type SystemRole = "super_admin" | "family_admin" | "member";

export type UserProfile = {
  user_id: string;
  first_name?: string | null;
  full_name?: string | null;
  father_name?: string | null;
  grandfather_name?: string | null;
  family_name?: string | null;
  phone?: string | null;
  national_address?: string | null;
  birth_date?: string | null;
  is_active?: boolean | null;
  status?: number | null;
  must_change_password_on_next_login?: boolean | null;
};

export type Family = {
  id: string;
  name?: string | null;
  family_name?: string | null;
  invite_code?: string | null;
  parent_family_id?: string | null;
  created_at?: string | null;
};

export type FamilyMembership = {
  id: string;
  family_id: string;
  user_id: string;
  role: "family_admin" | "member";
  created_at?: string | null;
};

export type Person = {
  id: string;
  family_id?: string | null;
  full_name: string;
  gender?: "male" | "female";
  birth_date?: string | null;
  death_date?: string | null;
  is_deceased?: boolean;
  created_at?: string | null;
};

export type Relationship = {
  id: string;
  family_id?: string | null;
  parent_id: string;
  child_id: string;
  parent_kind?: "father" | "mother";
  created_at?: string | null;
};

export type SeedRow = {
  uid: string;
  generation: number | null;
  name: string;
  fatherName: string | null;
  grandfatherName: string | null;
};