export type SystemRole = "super_admin" | "family_admin" | "member";

export type UserProfile = {
  user_id: string;
  full_name?: string | null;
  is_active?: boolean | null;
  status?: number | null;
  must_change_password_on_next_login?: boolean | null;
};

export type Family = {
  id: string;
  family_name?: string;
};

export type FamilyMembership = {
  id: string;
  family_id: string;
  user_id: string;
  role: "family_admin" | "member";
};

export type Person = {
  id: string;
  full_name: string;
  gender?: "male" | "female";
  family_id?: string;
  birth_date?: string | null;
  death_date?: string | null;
  is_deceased?: boolean;
};

export type Relationship = {
  id: string;
  family_id?: string;
  parent_id: string;
  child_id: string;
  parent_kind?: "father" | "mother";
};

export type SeedRow = {
  uid: string;
  generation: number | null;
  name: string;
  fatherName: string | null;
  grandfatherName: string | null;
};