"use client";

import { useEffect, useState } from "react";
import { uploadCmsMedia } from "@/app/admin/cms-actions";

export default function MediaUploadForm() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form action={uploadCmsMedia} encType="multipart/form-data" className="mt-5 grid gap-3">
      <input type="hidden" name="return_to" value="/admin/media" />
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          if (!file) {
            setPreviewUrl("");
            setFileName("");
            return;
          }
          setFileName(file.name);
          setPreviewUrl(URL.createObjectURL(file));
        }}
        className="min-h-12 rounded-2xl border border-dashed border-taupe-300 bg-cream-50 px-4 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-sage-800 file:px-3 file:py-1.5 file:text-cream-50"
      />
      {previewUrl && (
        <div className="overflow-hidden rounded-2xl border border-taupe-200 bg-cream-100">
          <img src={previewUrl} alt={fileName || "Preview"} className="max-h-72 w-full object-contain" />
          <p className="border-t border-taupe-200 px-4 py-2 text-xs text-taupe-600">{fileName}</p>
        </div>
      )}
      <input name="alt_text" placeholder="Alt text / 图片说明" className="min-h-12 rounded-2xl border border-taupe-200 bg-cream-50 px-4 text-sm" />
      <button className="min-h-12 rounded-full bg-sage-800 px-5 text-sm font-semibold text-cream-50 hover:bg-sage-900">上传图片 · Upload</button>
    </form>
  );
}
