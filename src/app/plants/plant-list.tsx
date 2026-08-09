"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type PlantRow = {
  id: string;
  code: string;
  status: string;
  plant_species: { common_name: string } | null;
  cultivar: { name: string } | null;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function PlantList({ plants }: { plants: PlantRow[] }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
    >
      {plants.map((plant) => (
        <motion.li key={plant.id} variants={item}>
          <Link href={`/plants/${plant.id}`}>
            <Card className="flex flex-col gap-1.5 transition-shadow hover:shadow-md active:scale-[0.99]">
              <span className="text-base font-medium text-ink">
                {plant.code}
              </span>
              <span className="text-sm text-ink-muted">
                {plant.plant_species?.common_name}
                {plant.cultivar?.name ? ` · ${plant.cultivar.name}` : ""}
              </span>
              <StatusBadge status={plant.status} />
            </Card>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
