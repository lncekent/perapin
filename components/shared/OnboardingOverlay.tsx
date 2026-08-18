"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  storageKey: string;
  /** Server-side flag indicating onboarding was already completed. When true, never show. */
  onboardingCompleted?: boolean;
  onComplete?: () => void;
}

/**
 * Determines if the onboarding overlay should be shown.
 * Priority: if the server says onboarding is already done → never show.
 * Otherwise, use localStorage as a quick cache for the current session.
 */
function shouldShowOnboarding(storageKey: string, onboardingCompleted?: boolean): boolean {
  // Server already confirmed onboarding is done — skip entirely
  if (onboardingCompleted) return false;
  if (typeof window === "undefined") return false;
  // localStorage acts as a fast cache (prevents flash before server responds)
  const completed = localStorage.getItem(storageKey);
  if (completed === "true") return false;
  // New user: show onboarding
  return true;
}

export function OnboardingOverlay({ steps, storageKey, onboardingCompleted, onComplete }: OnboardingOverlayProps) {
  const [visible, setVisible] = useState(() => shouldShowOnboarding(storageKey, onboardingCompleted));
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Portal requires DOM — only render after mount
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // If server data arrives after initial render and says onboarding is done, hide immediately
  // We sync localStorage here so subsequent navigations don't flash the modal.
  useEffect(() => {
    if (onboardingCompleted) {
      localStorage.setItem(storageKey, "true");
    }
  }, [onboardingCompleted, storageKey]);

  // Derive visibility: if server confirms completed, override state
  const isVisible = visible && !onboardingCompleted;

  // Lock body scroll while visible
  useEffect(() => {
    if (isVisible && mounted) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isVisible, mounted]);

  function dismiss() {
    // 1. Persist in localStorage for instant next-render check
    localStorage.setItem(storageKey, "true");
    // 2. Persist server-side so it survives across devices/browsers
    fetch("/api/user/onboarding", { method: "POST" }).catch(() => {
      // Non-critical — localStorage already prevents re-show on this device
    });
    setVisible(false);
    onComplete?.();
  }

  function next() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismiss();
    }
  }

  function prev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  if (!mounted || !isVisible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="animate-fade-up relative w-full max-w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30 ring-1 ring-black/5">
        {/* Top accent bar */}
        <div className="from-brand-500 via-brand-400 to-brand-600 h-1.5 bg-gradient-to-r" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="text-brand-500 size-3.5" aria-hidden="true" />
            <span className="text-brand-600 text-[11px] font-semibold">Quick Tour</span>
          </div>
          <button
            onClick={dismiss}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Skip tour"
          >
            Skip <X className="size-3" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <div className="from-brand-50 to-brand-100 text-brand-600 ring-brand-200/50 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="mb-5 space-y-2 text-center">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{step.title}</h3>
            <p className="mx-auto max-w-[280px] text-[13px] leading-relaxed text-slate-500">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="mb-4 flex justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "bg-brand-600 w-7"
                    : i < currentStep
                      ? "bg-brand-300 w-2"
                      : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <p className="mb-4 text-center text-[11px] font-medium text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {!isFirst && (
              <Button variant="ghost" size="md" onClick={prev} className="flex-shrink-0 px-3">
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <Button variant="primary" size="lg" onClick={next} block className="font-semibold">
              {isLast ? (
                "Get Started!"
              ) : (
                <>
                  Next <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
