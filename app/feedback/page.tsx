"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

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
    <main className="flex min-h-screen justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-md">
        <Link href="/" className="text-sm text-blue-700">
          ← Back
        </Link>
        {state === "done" ? (
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold">Thank you!</h1>
            <p className="mt-2 text-slate-500">Your feedback was saved securely.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">PeraPin feedback</h1>
              <p className="mt-1 text-sm text-slate-500">Tell us about your payment experience.</p>
            </div>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <fieldset>
              <legend className="text-sm font-semibold">Rating</legend>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    aria-label={`${star} stars`}
                    onClick={() => setRating(star)}
                    className={`min-h-11 min-w-11 rounded-lg text-2xl ${star <= rating ? "bg-amber-100 text-amber-500" : "bg-slate-100 text-slate-400"}`}
                    key={star}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>
            <textarea
              required
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={5}
              placeholder="What worked well? What can we improve?"
              className="w-full rounded-xl border p-3 text-base"
            />
            <button
              disabled={!rating || state === "saving"}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {state === "saving" ? "Saving…" : "Submit feedback"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
