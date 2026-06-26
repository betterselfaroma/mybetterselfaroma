import AdminBrandMark from "@/components/admin/AdminBrandMark";

export default function Loading() {
  return (
    <div className="flex min-h-[62vh] flex-col items-center justify-center px-6 text-center">
      <AdminBrandMark size="lg" />
      <p className="mt-5 font-serif text-2xl font-semibold text-ink">香气读懂你的心</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-sage-700">Admin App</p>
      <div className="mt-8 h-2 w-44 overflow-hidden rounded-full bg-cream-200">
        <span className="block h-full w-1/2 animate-pulse rounded-full bg-sage-700" />
      </div>
      <p className="mt-4 text-sm text-taupe-600">正在准备后台数据…</p>
    </div>
  );
}
