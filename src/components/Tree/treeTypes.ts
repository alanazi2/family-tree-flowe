export type SystemRole = "super_admin" | "family_admin" | "member";

export type Gender = "male" | "female";

export type UserProfile = {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  system_role: SystemRole;
  is_active: boolean;
  status: number;
  must_change_password_on_next_login: boolean;
  created_at: string;
};

export type Family = {
  id: string;
  name: string;
  parent_family_id: string | null;
  created_at: string;
  created_by: string;
  invite_code: string;
};

export type Person = {
  id: string;
  family_id: string;
  full_name: string;
  gender: Gender;
  birth_date: string | null;
  death_date: string | null;
  is_deceased: boolean;
  created_at: string;
  created_by: string;
};

export type Relationship = {
  id: string;
  family_id: string;
  parent_id: string;
  child_id: string;
  parent_kind: "father" | "mother";
  created_at: string;
  created_by: string;
};

export type FamilyMembership = {
  id: string;
  family_id: string;
  user_id: string;
  role: "admin" | "member";
  created_at: string;
};