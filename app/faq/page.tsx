"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowLeft, HelpCircle, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/shared/Footer";
import { Navigation } from "@/components/shared/Navigation";

const faqItems = [
  {
    question: "What is PeraPin?",
    answer:
      "PeraPin is a micropayment system for offline consumers using QR stickers on the Stellar blockchain. It enables people to pay for goods at sari-sari stores, school canteens, and PUVs — even when their smartphone is dead, offline, or left at home.",
  },
  {
    question: "How does offline payment work?",
    answer:
      "The consumer's phone doesn't need to be active. The merchant scans the consumer's QR sticker (which is just their public wallet address) and the consumer enters their 4-digit PIN on the merchant's phone. The merchant's device handles the entire transaction.",
  },
  {
    question: "Is my PIN safe?",
    answer:
      "Yes, it's hashed client-side using SHA-256 before leaving the browser. The raw PIN is never transmitted or stored anywhere — not on our servers, not in our database. Only the cryptographic hash is used for verification.",
  },
  {
    question: "What happens if I enter the wrong PIN?",
    answer:
      "After 3 failed attempts, your wallet locks for 15 minutes. This lockout is enforced by the Soroban smart contract on the Stellar blockchain, making it tamper-proof. After 15 minutes, you can try again.",
  },
  {
    question: "How do I fund my wallet?",
    answer:
      "Use the Testnet Friendbot. Go to Fund Wallet in your dashboard and follow the steps. Since PeraPin runs on Stellar Testnet, you can get free test XLM tokens instantly to try out the system.",
  },
  {
    question: "Can I lose real money?",
    answer:
      "No. PeraPin runs on Stellar Testnet. The XLM tokens have no real-world value. This is a demonstration and testing environment, so you can experiment freely without any financial risk.",
  },
  {
    question: "What if I lose my QR sticker?",
    answer:
      "Your QR code is just your public wallet address. You can reprint it anytime from your dashboard under the QR Code section. Simply print a new sticker and attach it to your ID, notebook, or wherever you prefer.",
  },
  {
    question: "How do I change my PIN?",
    answer:
      "Go to Settings > Change PIN. You'll need to enter your current PIN to verify your identity before setting a new one. The new PIN will be hashed and stored on-chain just like the original.",
  },
  {
    question: "Who can see my transactions?",
    answer:
      "Stellar blockchain transactions are public — anyone can see that a transfer happened between two addresses. However, only you can access your PeraPin dashboard and detailed transaction history with names and dates.",
  },
  {
    question: "How do merchants get started?",
    answer:
      'Register as a merchant with your business name and email. Once verified, use the "Accept Payment" button on your dashboard to scan consumer QR codes. No special hardware or card terminal needed — just your smartphone camera.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <Navigation />
      <main className="bg-brand-wash flex min-h-screen flex-col items-center gap-10 px-6 pt-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-brand-100 flex size-12 items-center justify-center rounded-2xl">
                <HelpCircle className="text-brand-600 size-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Frequently Asked Questions
                </h1>
                <p className="text-sm text-slate-500">
                  Everything you need to know about using PeraPin
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <Card
                key={index}
                className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                onClick={() => toggle(index)}
              >
                <div className="flex items-center justify-between p-4">
                  <h2 className="pr-4 text-sm font-semibold text-slate-800">{item.question}</h2>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-slate-400 transition-transform duration-200",
                      openIndex === index && "text-brand-600 rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-slate-100 px-4 pt-3 pb-4 text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Still have questions? */}
          <Card className="p-6 pb-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-brand-50 flex size-12 items-center justify-center rounded-full">
                <MessageSquare className="text-brand-600 size-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Still have questions?</h2>
              <p className="max-w-sm text-sm text-slate-500">
                We&apos;d love to hear from you. Send us your feedback or questions and we&apos;ll
                get back to you as soon as possible.
              </p>
              <Link
                href="/feedback"
                className="bg-brand-600 hover:bg-brand-700 mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                <MessageSquare className="size-4" aria-hidden="true" />
                Send Feedback
              </Link>
            </div>
          </Card>
        </div>
        <Footer />
      </main>
    </div>
  );
}
