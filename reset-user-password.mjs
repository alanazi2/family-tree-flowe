import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetUserPassword() {
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  const user = usersData.users.find((u) => u.email === "rms.admin@system.local");
  if (!user) throw new Error("User not found");

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: "RmsAdmin123456",
    email_confirm: true,
  });

  if (error) throw error;
  console.log("Password updated:", data.user?.email);
}

resetUserPassword().catch(console.error);