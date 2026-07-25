"use client";

import { ReactNode } from "react";
import { CircleCheckBig, CircleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type OperationStatus = "idle" | "loading" | "success" | "error";

export interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: OperationStatus;
  loadingTitle?: string;
  loadingDescription?: ReactNode;
  successTitle?: string;
  successDescription?: ReactNode;
  errorTitle?: string;
  errorDescription?: ReactNode;
  /** Extra content shown under the success description (e.g. a receipt). */
  children?: ReactNode;
  successActionLabel?: string;
  onSuccessAction?: () => void;
  errorActionLabel?: string;
  onErrorAction?: () => void;
}

/**
 * StatusDialog — reports the outcome of an async operation as a modal with
 * three guided states: loading → success ("correct") or error. Uses a Spinner
 * for loading, and on-brand / semantic-destructive icons for the result so it
 * stays within the theme tokens (no raw status colors), per the shadcn rules.
 */
export function StatusDialog({
  open,
  onOpenChange,
  status,
  loadingTitle = "Processing…",
  loadingDescription,
  successTitle = "Success",
  successDescription,
  errorTitle = "Something went wrong",
  errorDescription,
  children,
  successActionLabel = "Done",
  onSuccessAction,
  errorActionLabel = "Try again",
  onErrorAction,
}: StatusDialogProps) {
  const dismissible = status !== "loading";

  return (
    <Dialog open={open} onOpenChange={(next) => (dismissible ? onOpenChange(next) : undefined)}>
      <DialogContent showCloseButton={dismissible}>
        <DialogHeader className="items-center text-center">
          <div
            aria-hidden="true"
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl ring-1",
              status === "success" && "bg-brand-50 text-brand-600 ring-brand-100",
              status === "error" && "bg-red-50 text-red-600 ring-red-100",
              status === "loading" && "bg-slate-50 text-slate-500 ring-slate-100",
            )}
          >
            {status === "loading" && <Spinner className="size-7" />}
            {status === "success" && <CircleCheckBig className="size-7" />}
            {status === "error" && <CircleAlert className="size-7" />}
          </div>

          <DialogTitle className="text-lg font-bold">
            {status === "loading" && loadingTitle}
            {status === "success" && successTitle}
            {status === "error" && errorTitle}
          </DialogTitle>

          {status === "loading" && loadingDescription && (
            <DialogDescription>{loadingDescription}</DialogDescription>
          )}
          {status === "success" && successDescription && (
            <DialogDescription>{successDescription}</DialogDescription>
          )}
          {status === "error" && errorDescription && (
            <DialogDescription>{errorDescription}</DialogDescription>
          )}
        </DialogHeader>

        {status === "success" && children}

        {status !== "loading" && (
          <DialogFooter className="sm:justify-center">
            {status === "success" ? (
              <Button type="button" variant="primary" size="md" block onClick={onSuccessAction}>
                {successActionLabel}
              </Button>
            ) : (
              <Button type="button" variant="primary" size="md" block onClick={onErrorAction}>
                {errorActionLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
