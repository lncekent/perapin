import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = ["Recipient", "Amount", "Confirm", "Done"] as const;

/**
 * SendFlowSteps — 4-step progress indicator for the consumer P2P "Send Money"
 * flow. Mirrors the merchant payment step indicator so the two flows feel
 * consistent. `current` is 1-based (1 = Recipient … 4 = Done).
 */
export function SendFlowSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <Card variant="ghost" padding="sm">
      <div className="flex items-center justify-between text-center">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div key={label} className="contents">
              <div className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[10px] font-bold ring-1",
                    done && "bg-brand-100 text-brand-700 ring-brand-200",
                    active && "bg-brand-600 text-white ring-brand-600",
                    !done && !active && "bg-white text-slate-400 ring-slate-200",
                  )}
                >
                  {done ? <CheckCircle2 className="size-3.5" /> : step}
                </span>
                <span
                  className={cn(
                    "text-[10px]",
                    done && "text-brand-700 font-medium",
                    active && "text-brand-700 font-semibold",
                    !done && !active && "font-medium text-slate-400",
                  )}
                >
                  {label}
                </span>
              </div>
              {step < STEPS.length && (
                <div className={cn("h-px flex-1", done ? "bg-brand-300" : "bg-slate-200")} />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
