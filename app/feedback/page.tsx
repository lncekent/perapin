"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, CircleAlert, CircleCheckBig } from "lucide-react";
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
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [state, setState] = useState<"form" | "saving" | "done">("form");
  const [error, setError] = useState("");

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
      if (!response.ok) throw new Error(data.error);
      setState("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save feedback.");
      setState("form");
    }
  }

  return (
    <main className="bg-brand-wash flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>

        <Card variant="raised" padding="lg">
          {state === "done" ? (
            <div className="animate-fade-up flex flex-col items-center py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <CircleCheckBig className="size-7" aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Thank you!</h1>
              <p className="mt-1 text-sm text-slate-500">Your feedback was saved securely.</p>
              <Link href="/" className="mt-6">
                <Button variant="secondary" size="md">
                  Back to home
                </Button>
              </Link>
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
                            "flex size-12 items-center justify-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
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
