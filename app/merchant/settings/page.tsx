"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Wallet,
  Calendar,
  Store,
  Save,
  Copy,
  Check,
  X,
  MessageSquareText,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCachedFetch, setCachedValue } from "@/lib/use-cached-fetch";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface Profile {
  user: {
    id: string;
    email: string;
    role: string;
    fullName?: string | null;
    businessName?: string;
    stellarPublicKey: string;
    createdAt: string;
  };
  balanceXlm: string;
  isLocked: boolean;
  pinSetupRequired: boolean;
}

export default function MerchantSettingsPage() {
  const { data: profile, refetch } = useCachedFetch<Profile>("me", async () => {
    const r = await fetch("/api/user/me");
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Unable to load profile.");
    return d;
  });

  const wallet = profile?.user.stellarPublicKey ?? "";
  const email = profile?.user.email ?? "";
  const role = profile?.user.role ?? "merchant";
  const fullName = profile?.user.fullName ?? "";
  const businessName = profile?.user.businessName ?? "";
  const memberSince = profile?.user.createdAt
    ? new Date(profile.user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const [editFullName, setEditFullName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const editValue = newBusinessName ?? businessName;
  const nameValue = editFullName ?? fullName;

  async function saveFullName() {
    const trimmed = nameValue.trim();
    if (trimmed === fullName) {
      setEditFullName(null);
      return;
    }
    if (trimmed.length > 100) {
      toast.add({
        title: "Too long",
        description: "Full name must be 100 characters or less.",
        type: "error",
      });
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/user/full-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update.");
      if (profile) {
        setCachedValue("me", { ...profile, user: { ...profile.user, fullName: data.fullName } });
      }
      await refetch();
      setEditFullName(null);
      toast.add({
        title: "Name updated",
        description: "Your full name has been saved.",
        type: "success",
      });
    } catch (err: any) {
      toast.add({ title: "Update failed", description: err.message, type: "error" });
    } finally {
      setSavingName(false);
    }
  }

  async function handleCopy() {
    const ok = await copyToClipboard(wallet);
    if (ok) {
      setCopied(true);
      toast.add({
        title: "Copied!",
        description: "Wallet address copied to clipboard.",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleSave() {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.add({
        title: "Invalid name",
        description: "Business name cannot be empty.",
        type: "error",
      });
      return;
    }
    if (trimmed.length > 50) {
      toast.add({
        title: "Too long",
        description: "Business name must be 50 characters or less.",
        type: "error",
      });
      return;
    }
    if (trimmed === businessName) {
      setNewBusinessName(null);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/business-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update.");

      // Update the cached profile
      if (profile) {
        setCachedValue("me", { ...profile, user: { ...profile.user, businessName: data.businessName } });
      }
      await refetch();
      setNewBusinessName(null);
      toast.add({
        title: "Business name updated",
        description: `Your store is now "${data.businessName}".`,
        type: "success",
      });
    } catch (err: any) {
      toast.add({
        title: "Update failed",
        description: err.message || "Could not save business name.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your store account and preferences.</p>
      </div>

      {/* Account Info Card */}
      <Card variant="surface" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="text-brand-600 size-4" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">Account Info</h2>
          <Badge variant="secondary" className="ml-auto capitalize">
            {role}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <User className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Full Name
              </p>
              {editFullName !== null ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    maxLength={100}
                    autoFocus
                    placeholder="Enter your full name"
                    className="focus:border-brand-400 focus:ring-brand-200 h-8 min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-800 outline-none focus:ring-1"
                  />
                  <button
                    onClick={saveFullName}
                    disabled={savingName}
                    className="bg-brand-600 hover:bg-brand-700 flex size-8 flex-shrink-0 items-center justify-center rounded-lg text-white transition-colors disabled:opacity-50"
                    aria-label="Save name"
                  >
                    {savingName ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Check className="size-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditFullName(null)}
                    className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Cancel"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {fullName || <span className="text-slate-400 italic">Not set</span>}
                  </p>
                  <button
                    onClick={() => setEditFullName(fullName)}
                    className="text-brand-600 flex-shrink-0 text-[11px] font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Mail className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Email
              </p>
              <p className="truncate text-sm font-medium text-slate-800">{email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Wallet className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Wallet Address
              </p>
              <p className="font-mono text-xs text-slate-600">
                {wallet ? `${wallet.slice(0, 8)}…${wallet.slice(-8)}` : "—"}
              </p>
            </div>
            {wallet && (
              <button
                onClick={handleCopy}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Copy wallet address"
              >
                {copied ? (
                  <Check className="size-3.5 text-green-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Store className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Business Name
              </p>
              <p className="text-sm font-medium text-slate-800">{businessName || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Calendar className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Member Since
              </p>
              <p className="text-sm font-medium text-slate-800">{memberSince}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Rename Business Card */}
      <Card variant="surface" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <Store className="text-brand-600 size-4" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">Rename Business</h2>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="businessName">Business Name</FieldLabel>
            <FieldDescription>
              This name is shown to consumers during payments. Max 50 characters.
            </FieldDescription>
            <Input
              id="businessName"
              type="text"
              maxLength={50}
              placeholder="Enter your store name"
              value={editValue}
              onChange={(e) => setNewBusinessName(e.target.value)}
            />
          </Field>
          <Button
            onClick={handleSave}
            disabled={saving || editValue.trim() === businessName}
            block
            size="lg"
          >
            {saving ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden="true" /> Save Business Name
              </>
            )}
          </Button>
        </FieldGroup>
      </Card>

      {/* Feedback Link */}
      <Link href="/feedback" className="group block">
        <Card variant="surface" padding="sm" interactive>
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-xl p-2 ring-1">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Send feedback</p>
              <p className="text-[11px] text-slate-400">Tell us about your merchant experience</p>
            </div>
            <ChevronRight
              className="group-hover:text-brand-500 h-5 w-5 flex-shrink-0 text-slate-300 transition-colors"
              aria-hidden="true"
            />
          </div>
        </Card>
      </Link>
    </div>
  );
}
