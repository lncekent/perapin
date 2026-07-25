"use client";

import { ReactNode } from "react";
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

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Icon shown in the header (should be decorative — aria-hidden set here). */
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  /** Visual tone of the confirm button. */
  tone?: "primary" | "danger";
  /** When true, the confirm button shows a spinner and the dialog can't be dismissed. */
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * ConfirmDialog — a focused yes/no confirmation for destructive or mutating
 * actions (log out, change PIN, etc.). Follows the shadcn composition rule of
 * a titled dialog, and shows a Spinner in the confirm button while the query
 * runs (the dialog is non-dismissible during that time).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loadingLabel = "Working…",
  tone = "primary",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (loading ? undefined : onOpenChange(next))}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          {icon && (
            <div
              aria-hidden="true"
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl ring-1",
                tone === "danger"
                  ? "bg-red-50 text-red-600 ring-red-100"
                  : "bg-brand-50 text-brand-600 ring-brand-100",
              )}
            >
              {icon}
            </div>
          )}
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "danger" : "primary"}
            size="md"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? (
              <>
                <Spinner /> {loadingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
