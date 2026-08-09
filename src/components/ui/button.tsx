"use client";

import { motion } from "motion/react";
import type { ButtonHTMLAttributes } from "react";
import { buttonClassName, type ButtonVariant } from "./button-styles";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: NativeButtonProps & { variant?: ButtonVariant }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={buttonClassName(variant, className)}
      {...props}
    />
  );
}
