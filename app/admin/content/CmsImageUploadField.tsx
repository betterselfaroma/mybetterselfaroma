"use client";

import { useEffect, useState } from "react";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const COMPRESS_IF_OVER_BYTES = 1.5 * 1024 * 1024;
const MAX_DIMENSION = 2000;

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

async function compressImageForWeb(file: File) {
  if (file.type === "image/webp" && file.size <= COMPRESS_IF_OVER_BYTES) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image preview could not be loaded."));
      img.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    if (scale === 1 && file.size <= COMPRESS_IF_OVER_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[a-z0-9]+$/i, "") || "cms-image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch (error) {
    console.error("CMS image compression failed:", error);
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function CmsImageUploadField({
  name,
  label,
  help,
  currentUrl,
  clearName,
}: {
  name: string;
  label: string;
  help?: string;
  currentUrl?: string;
  clearName?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="grid gap-2 rounded-2xl border border-dashed border-gold-300/80 bg-cream-100/70 p-4">
      <label className="grid gap-1.5 text-sm font-semibold text-taupe-700">
        {label}
        <input
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl("");
            setFileName("");
            setFileSize("");
            setError("");

            if (!file) return;
            if (!ACCEPTED_TYPES.has(file.type)) {
              setError("Only JPG, PNG or WebP images are allowed.");
              input.value = "";
              return;
            }
            if (file.size > MAX_BYTES) {
              setError(`Image must be 5MB or smaller. Selected: ${formatBytes(file.size)}.`);
              input.value = "";
              return;
            }

            const prepared = await compressImageForWeb(file);
            if (prepared.size > MAX_BYTES) {
              setError(`Image is still larger than 5MB after optimization. Selected: ${formatBytes(prepared.size)}.`);
              input.value = "";
              return;
            }

            if (prepared !== file && typeof DataTransfer !== "undefined") {
              const transfer = new DataTransfer();
              transfer.items.add(prepared);
              input.files = transfer.files;
            }

            setFileName(prepared.name);
            setFileSize(prepared !== file ? `${formatBytes(prepared.size)} optimized` : formatBytes(prepared.size));
            setPreviewUrl(URL.createObjectURL(prepared));
          }}
          className="rounded-2xl border border-dashed border-gold-300 bg-cream-50 px-4 py-3 text-xs text-taupe-700 file:mr-3 file:rounded-full file:border-0 file:bg-sage-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream-50"
        />
      </label>

      {help && <p className="text-xs leading-5 text-taupe-500">{help}</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      {(previewUrl || currentUrl) && (
        <div className="overflow-hidden rounded-2xl border border-taupe-200 bg-cream-50">
          <img
            src={previewUrl || currentUrl}
            alt={fileName || "Current CMS image"}
            className="max-h-64 w-full object-contain"
          />
          <div className="border-t border-taupe-200 px-4 py-2 text-xs text-taupe-600">
            {previewUrl ? `New image: ${fileName}${fileSize ? ` · ${fileSize}` : ""}` : "Current image preview"}
          </div>
        </div>
      )}

      {clearName && currentUrl && (
        <label className="flex items-center gap-2 rounded-xl bg-cream-50 px-3 py-2 text-xs font-semibold text-taupe-700">
          <input name={clearName} type="checkbox" />
          Remove current image if no new image is uploaded.
        </label>
      )}
    </div>
  );
}
