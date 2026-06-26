import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotConfigured from "@/components/membership/NotConfigured";
import { requireAdmin } from "@/lib/supabase/auth";
import AdminAppShell from "@/components/admin/AdminAppShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const user = await requireAdmin();

  return (
    <AdminAppShell userEmail={user.email}>{children}</AdminAppShell>
  );
}
