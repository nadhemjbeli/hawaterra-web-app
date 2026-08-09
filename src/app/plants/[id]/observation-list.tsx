"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
};

export function ObservationList({
  observations,
}: {
  observations: Observation[];
}) {
  if (observations.length === 0) {
    return <p className="text-sm text-ink-muted">No observations yet.</p>;
  }

  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-2"
    >
      {observations.map((obs) => (
        <motion.li key={obs.id} variants={item}>
          <Card className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Badge>{obs.type.replace("_", " ")}</Badge>
              <span className="text-xs text-ink-muted">
                {new Date(obs.observed_at).toLocaleString()}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-ink">
              {obs.notes}
            </p>
          </Card>
        </motion.li>
      ))}
    </motion.ul>
  );
}
