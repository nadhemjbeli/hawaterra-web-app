"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { deletePlantPhoto } from "./actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PhotoLightbox } from "./photo-lightbox";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  storage_path: string;
};

export function PhotoGallery({
  plantId,
  photos,
}: {
  plantId: string;
  photos: Photo[];
}) {
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  async function confirmDelete() {
    if (!photoToDelete) return;

    setError(null);
    setIsDeleting(true);
    try {
      const result = await deletePlantPhoto(
        plantId,
        photoToDelete.id,
        photoToDelete.storage_path,
      );
      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong deleting that photo. Please try again.");
    } finally {
      setIsDeleting(false);
      setPhotoToDelete(null);
    }
  }

  if (photos.length === 0) {
    return <p className="text-sm text-ink-muted">No photos yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {photos.map((photo, i) => (
            <motion.li
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className="block w-full cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => setPhotoToDelete(photo)}
                aria-label="Delete photo"
                className="absolute right-1.5 top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-lg leading-none text-white"
              >
                ×
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {error && <p className="text-sm text-error">{error}</p>}

      <ConfirmDialog
        open={photoToDelete !== null}
        title="Delete this photo?"
        description="This can't be undone."
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPhotoToDelete(null)}
      />

      <PhotoLightbox
        photos={photos}
        index={openIndex ?? 0}
        open={openIndex !== null}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </div>
  );
}
