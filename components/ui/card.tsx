import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card — the standard surface primitive. Unifies the drifting
 * rounded-2xl/3xl + shadow-xs/sm/md usage into three deliberate tiers.
 */
const cardVariants = cva("rounded-3xl transition-shadow", {
  variants: {
    variant: {
      surface: "border border-slate-200 bg-white shadow-soft",
      raised: "border border-slate-200 bg-white shadow-card",
      money: "bg-money-gradient text-white shadow-money",
      ghost: "bg-slate-50/60 border border-slate-100",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    },
    interactive: {
      true: "hover:shadow-card active:scale-[0.99] cursor-pointer",
    },
  },
  defaultVariants: {
    variant: "surface",
    padding: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export { Card, cardVariants };
