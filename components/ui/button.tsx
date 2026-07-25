"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — the single source of truth for actionable hierarchy in PeraPin.
 * Radii, focus rings, motion, and min touch target (44px) are standardized
 * here so every screen inherits the same tactile, trustworthy feel.
 *
 * Note: this is PeraPin's design-system button (brand "money" variant, etc.),
 * intentionally kept in place of shadcn's default generic button.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:shadow-card",
        secondary:
          "border border-slate-200 bg-white text-slate-800 shadow-soft hover:bg-slate-50 hover:border-slate-300",
        outline:
          "border border-slate-200 bg-white text-slate-700 shadow-soft hover:bg-slate-50 hover:border-slate-300",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        danger: "bg-red-600 text-white shadow-soft hover:bg-red-700",
        money: "bg-money-gradient text-white shadow-money hover:brightness-110",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-5 text-sm",
        lg: "min-h-14 px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
