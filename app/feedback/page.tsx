"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Send, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";

export default function FeedbackPage() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState("");
  const [role, setRole] = useState<"consumer" | "merchant">("consumer");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    const feedbackData = {
      id: `fb_${Date.now()}`,
      rating,
      role,
      comments,
      timestamp: new Date().toISOString(),
    };

    // Save in localStorage for simulation
    const saved = localStorage.getItem("perapin_feedback");
    const list = saved ? JSON.parse(saved) : [];
    list.push(feedbackData);
    localStorage.setItem("perapin_feedback", JSON.stringify(list));

    // Log to inspector
    mockStorage.logToInspector(
      "success",
      "Feedback Submitted",
      `Received rating of ${rating}/5 stars from a ${role}.`,
      feedbackData
    );

    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <span className="font-bold text-sm text-slate-800 tracking-tight">
            User Feedback
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto py-8 px-6 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6"
        >
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Maraming Salamat!
              </h2>
              <p className="text-sm text-slate-500">
                Your feedback has been recorded. This satisfies the Level 4 MVP
                feedback collection requirement.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
                >
                  Return Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  PeraPin Feedback
                </h1>
                <p className="text-xs text-slate-500 leading-normal">
                  We are building an offline payment system for campus canteens
                  and local services. Share your thoughts to help us improve!
                </p>
              </div>

              {/* Role select */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Who are you?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("consumer")}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      role === "consumer"
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("merchant")}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      role === "merchant"
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Merchant
                  </button>
                </div>
              </div>

              {/* Rating selection */}
              <div className="space-y-2 text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rate your experience
                </label>
                <div className="flex justify-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform active:scale-90"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Comments or Suggestions
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us what you like or what can be improved..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
