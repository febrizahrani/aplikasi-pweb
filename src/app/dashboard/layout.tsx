import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile -如果 users table doesn't exist, default to karyawan
  let role = "karyawan";
  try {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      role = (profile as { role?: string }).role || "karyawan";
    }
  } catch {
    // users table might not exist yet
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm no-print">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="lg:hidden w-10" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
