"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteObservation } from "./actions";

type Observation = {
  id: string;
  type: string;
  notes: string;
  observed_at: string;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
};

export function ObservationList({
  plantId,
  observations,
}: {
  plantId: string;
  observations: Observation[];
}) {
  const [toDelete, setToDelete] = useState<Observation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;

    setError(null);
    setIsDeleting(true);
    try {
      const result = await deleteObservation(plantId, toDelete.id);
      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError(
        "Something went wrong deleting that observation. Please try again.",
      );
    } finally {
      setIsDeleting(false);
      setToDelete(null);
    }
  }

  if (observations.length === 0) {
    return <p className="text-sm text-ink-muted">No observations yet.</p>;
  }

  return (
    <>
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2"
      >
        <AnimatePresence>
          {observations.map((obs) => (
            <motion.li key={obs.id} variants={item} exit="exit" layout>
              <Card className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Badge>{obs.type.replace("_", " ")}</Badge>
                  <span className="ml-auto text-xs text-ink-muted">
                    {new Date(obs.observed_at).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setToDelete(obs)}
                    aria-label="Delete observation"
                    className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-base leading-none text-ink-muted hover:bg-background hover:text-error"
                  >
                    ×
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm text-ink">
                  {obs.notes}
                </p>
              </Card>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {error && <p className="text-sm text-error">{error}</p>}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this observation?"
        description="This can't be undone."
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
