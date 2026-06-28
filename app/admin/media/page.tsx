import CopyButton from "@/components/member/CopyButton";
import { Card, EmptyState, PageTitle } from "@/components/membership/ui";
import { deleteCmsMedia, updateCmsMedia } from "@/app/admin/cms-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MediaAsset } from "@/lib/cms-types";
import MediaUploadForm from "./MediaUploadForm";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { q?: string; notice?: string; error?: string };
};

function formatBytes(size?: number | null) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function resultMessage(message?: string) {
  if (!message) return "";
  return decodeURIComponent(message);
}

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const q = searchParams?.q?.trim() ?? "";
  const supabase = createAdminClient();
  let query = supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) query = query.or(`file_name.ilike.%${q}%,alt_text.ilike.%${q}%`);
  const { data, error: loadError } = await query;
  const assets = (data ?? []) as MediaAsset[];
  const notice = resultMessage(searchParams?.notice);
  const error = resultMessage(searchParams?.error || loadError?.message);
  const returnTo = `/admin/media${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="space-y-6">
      <PageTitle title="图片素材 · Media" subtitle="上传、预览、复制 URL、编辑 alt text 和删除网站图片素材。" />

      {notice && <div className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">{notice}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card className="rounded-[1.65rem] border-gold-300/40 bg-gradient-to-br from-cream-50 via-cream-50 to-gold-300/10">
        <h2 className="font-serif text-xl font-semibold text-ink">上传图片 · Upload Image</h2>
        <p className="mt-2 text-sm leading-6 text-taupe-600">
          支持 JPG / PNG / WebP，单张最多 5MB。选择图片后会先显示本地预览，上传后保存到 Supabase Storage 的 site-media bucket。
        </p>
        <MediaUploadForm />
      </Card>

      <Card className="rounded-[1.65rem]">
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/admin/media">
          <input name="q" defaultValue={q} placeholder="搜索文件名 / alt text" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
          <button className="min-h-12 rounded-full border border-sage-300 px-5 text-sm font-semibold text-sage-800">搜索</button>
        </form>
      </Card>

      {assets.length === 0 ? (
        <Card><EmptyState>暂无图片素材 · No media assets</EmptyState></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {assets.map((asset) => (
            <Card key={asset.id} className="rounded-[1.65rem]">
              <div className="overflow-hidden rounded-2xl border border-taupe-200 bg-cream-100">
                {asset.public_url ? (
                  <img src={asset.public_url} alt={asset.alt_text ?? asset.file_name ?? "Media"} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-sm text-taupe-500">No preview</div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <p className="break-all font-semibold text-ink">{asset.file_name || asset.file_path || "Untitled"}</p>
                <p className="text-xs text-taupe-500">
                  {formatBytes(asset.size_bytes)} · {asset.mime_type || "-"} · {asset.created_at ? new Date(asset.created_at).toLocaleString("en-SG") : "-"}
                </p>
                {asset.public_url && (
                  <div className="break-all rounded-xl bg-cream-100 px-3 py-2 font-mono text-[11px] text-taupe-600">
                    {asset.public_url}
                  </div>
                )}
              </div>
              <div className="mt-4 grid gap-2">
                {asset.public_url && <CopyButton text={asset.public_url} label="复制 URL" copiedLabel="已复制" toast="图片 URL 已复制" />}
                <form action={updateCmsMedia} className="grid gap-2">
                  <input type="hidden" name="return_to" value={returnTo} />
                  <input type="hidden" name="id" value={asset.id} />
                  <input name="alt_text" defaultValue={asset.alt_text ?? ""} placeholder="Alt text" className="min-h-11 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
                  <button className="min-h-10 rounded-full border border-sage-300 px-4 text-sm font-semibold text-sage-800">保存说明</button>
                </form>
                <form action={deleteCmsMedia}>
                  <input type="hidden" name="return_to" value={returnTo} />
                  <input type="hidden" name="id" value={asset.id} />
                  <input type="hidden" name="file_path" value={asset.file_path ?? ""} />
                  <button className="min-h-10 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700">删除图片</button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
