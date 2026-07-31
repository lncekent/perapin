"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, CircleAlert, CircleCheckBig, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [state, setState] = useState<"checking" | "unauth" | "form" | "saving" | "done">(
    "checking",
  );
  const [error, setError] = useState("");

  // Return to the previous page (e.g. the consumer/merchant dashboard the user
  // came from) rather than always the landing page. Fall back to home when the
  // feedback page was opened directly with no in-app history.
  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  // Feedback is tied to the signed-in account (its role + id are recorded
  // server-side). Confirm there is a session before showing the form so a
  // logged-out visitor sees a clear prompt instead of a failed submission.
  useEffect(() => {
    let active = true;
    fetch("/api/user/me")
      .then((response) => {
        if (!active) return;
        setState(response.ok ? "form" : "unauth");
      })
      .catch(() => active && setState("unauth"));
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState("saving");
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comments }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Session expired between load and submit — send them to sign in.
        if (response.status === 401 || data.error === "AUTH_REQUIRED") {
          setState("unauth");
          return;
        }
        throw new Error(data.error);
      }
      setState("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save feedback.");
      setState("form");
    }
  }

  return (
    <main className="bg-brand-wash flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </button>

        <Card variant="raised" padding="lg">
          {state === "checking" ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Spinner />
              <p className="mt-3 text-sm text-slate-500">Loading…</p>
            </div>
          ) : state === "unauth" ? (
            <div className="animate-fade-up flex flex-col items-center py-12 text-center">
              <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-14 items-center justify-center rounded-2xl ring-1">
                <LogIn className="size-7" aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Sign in to share feedback</h1>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Feedback is linked to your PeraPin account. Sign in as a consumer or merchant to
                tell us about your payment experience.
              </p>
              <Link href="/login" className="mt-6 w-full max-w-xs">
                <Button block size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          ) : state === "done" ? (
            <div className="animate-fade-up flex flex-col items-center py-12 text-center">
              <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-14 items-center justify-center rounded-2xl ring-1">
                <CircleCheckBig className="size-7" aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Thank you!</h1>
              <p className="mt-1 text-sm text-slate-500">Your feedback was saved securely.</p>
              <Button variant="secondary" size="md" className="mt-6" onClick={goBack}>
                Go back
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">PeraPin feedback</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Tell us about your payment experience.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <CircleAlert aria-hidden="true" />
                  <AlertTitle>Couldn’t save feedback</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FieldGroup>
                <FieldSet>
                  <FieldLegend variant="label">How was your experience?</FieldLegend>
                  <FieldDescription>Tap a star to rate from 1 to 5.</FieldDescription>
                  <div className="mt-1 flex gap-2" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= rating;
                      return (
                        <button
                          type="button"
                          key={star}
                          role="radio"
                          aria-checked={active}
                          aria-label={`${star} star${star === 1 ? "" : "s"}`}
                          onClick={() => setRating(star)}
                          className={cn(
                            "focus-visible:outline-brand-500 flex size-12 items-center justify-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                            active
                              ? "border-brand-200 bg-brand-50 text-brand-600"
                              : "border-slate-200 bg-white text-slate-300 hover:bg-slate-50",
                          )}
                        >
                          <Star
                            className={cn("size-6", active && "fill-current")}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>
                </FieldSet>

                <Field>
                  <FieldLabel htmlFor="comments">Comments</FieldLabel>
                  <Textarea
                    id="comments"
                    name="comments"
                    required
                    rows={5}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="What worked well? What can we improve?"
                    className="min-h-28 text-base"
                  />
                  <FieldDescription>Your notes help us improve the payment flow.</FieldDescription>
                </Field>

                <Button type="submit" disabled={!rating || state === "saving"} block size="lg">
                  {state === "saving" ? (
                    <>
                      <Spinner /> Saving…
                    </>
                  ) : (
                    "Submit feedback"
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
