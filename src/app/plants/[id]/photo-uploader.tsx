"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { recordPlantPhoto } from "./actions";
import { buttonClassName } from "@/components/ui/button-styles";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// crypto.randomUUID() only exists in secure contexts (HTTPS or localhost).
// Testing over a plain http:// LAN address (e.g. from a phone) doesn't
// qualify, so this avoids depending on it just to name a file.
function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function PhotoUploader({
  plantId,
  userId,
}: {
  plantId: string;
  userId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be smaller than 10 MB.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${plantId}/${randomId()}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("plant-photos")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError("Upload failed. Please try again.");
        return;
      }

      const result = await recordPlantPhoto(plantId, path);

      if (result.error) {
        await supabase.storage.from("plant-photos").remove([path]);
        setError(result.error);
      }
    } catch {
      setError("Something went wrong uploading that photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        className={`cursor-pointer active:scale-[0.97] transition-transform ${buttonClassName("primary", "w-full")}`}
      >
        {isUploading ? "Uploading…" : "+ Add photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
