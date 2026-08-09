"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

type SpeciesGroup = {
  id: string;
  name: string;
  plants: unknown[];
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function SpeciesList({ groups }: { groups: SpeciesGroup[] }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
    >
      {groups.map((group) => (
        <motion.li key={group.id} variants={item}>
          <Link href={`/plants?species=${group.id}`}>
            <Card className="flex items-center justify-between transition-shadow hover:shadow-md active:scale-[0.99]">
              <span className="text-base font-medium text-ink">
                {group.name}
              </span>
              <span className="text-sm text-ink-muted">
                {group.plants.length}{" "}
                {group.plants.length === 1 ? "plant" : "plants"}
              </span>
            </Card>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
