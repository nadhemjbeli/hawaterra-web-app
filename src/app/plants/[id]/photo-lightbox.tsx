"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

const SWIPE_THRESHOLD = 10000;
function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export function PhotoLightbox({
  photos,
  index,
  open,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const [direction, setDirection] = useState(0);

  useLockBodyScroll(open);

  function paginate(step: number) {
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= photos.length) return;
    setDirection(step);
    onNavigate(nextIndex);
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const photo = photos[index];

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm tabular-nums opacity-80">
              {photos.length > 1 ? `${index + 1} / ${photos.length}` : ""}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={photo.id}
                src={photo.url}
                alt={photo.caption ?? ""}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 32 },
                  opacity: { duration: 0.2 },
                }}
                drag={photos.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_e, info: PanInfo) => {
                  const swipe = swipePower(info.offset.x, info.velocity.x);
                  if (swipe < -SWIPE_THRESHOLD) paginate(1);
                  else if (swipe > SWIPE_THRESHOLD) paginate(-1);
                }}
                className="max-h-full max-w-full touch-none object-contain"
              />
            </AnimatePresence>

            {photos.length > 1 && index > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white"
              >
                ‹
              </button>
            )}
            {photos.length > 1 && index < photos.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white"
              >
                ›
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
