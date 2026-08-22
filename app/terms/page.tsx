import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { Navigation } from "@/components/shared/Navigation";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <Navigation />

      <div className="mx-auto max-w-2xl px-5 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
        </Link>

        {/* Header */}
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-1 text-sm text-slate-400">Last updated: August 16, 2026</p>

        {/* Content */}
        <div className="mt-8 space-y-8">
          {/* Acceptance */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              By accessing or using PeraPin, you agree to be bound by these Terms of Service. If you
              do not agree to these terms, please do not use the platform. Your continued use of
              PeraPin constitutes acceptance of any updates or modifications to these terms.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Service Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              PeraPin is a <strong className="text-slate-900">testnet micropayment system</strong>{" "}
              built on the Stellar blockchain using Soroban smart contracts. It enables
              merchant-pull payments where consumers can pay using a static QR code sticker, even
              without an active smartphone. The platform facilitates XLM test token transfers on the
              Stellar Testnet for educational and demonstration purposes.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">3. User Responsibilities</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              As a user of PeraPin, you agree to:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-600">
              <li>
                <strong className="text-slate-900">Keep your PIN secure</strong> — do not share your
                4-digit PIN with anyone. Your PIN is the primary authorization method for payments.
              </li>
              <li>
                <strong className="text-slate-900">Protect your credentials</strong> — do not share
                your login email OTP codes or account access with others.
              </li>
              <li>
                <strong className="text-slate-900">Safeguard your QR sticker</strong> — while the QR
                code alone cannot authorize payments (a PIN is required), you should treat it as
                personal identification.
              </li>
              <li>
                <strong className="text-slate-900">Use the platform lawfully</strong> — do not
                attempt to exploit, hack, or abuse the system or other users.
              </li>
              <li>
                <strong className="text-slate-900">Provide accurate information</strong> — register
                with a valid email address and accurate role selection.
              </li>
            </ul>
          </section>

          {/* Testnet Nature */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Testnet Nature — No Real Money</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              PeraPin operates exclusively on the{" "}
              <strong className="text-slate-900">Stellar Testnet</strong>. All XLM tokens used
              within the platform are test tokens issued by Stellar&apos;s Friendbot service and
              have <strong className="text-slate-900">no real monetary value</strong>. You
              acknowledge that:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-600">
              <li>No real cryptocurrency or fiat currency is involved in any transaction.</li>
              <li>Test tokens cannot be exchanged for real money.</li>
              <li>The Stellar Testnet may be reset periodically, which could erase all data.</li>
              <li>This platform is a prototype for educational and demonstration purposes.</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">5. Limitation of Liability</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              PeraPin is an <strong className="text-slate-900">educational project</strong>{" "}
              developed as a prototype. The service is provided &quot;as is&quot; without warranties
              of any kind, either express or implied. To the fullest extent permitted by law:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-600">
              <li>
                We are not liable for any loss of test tokens, data, or service interruptions.
              </li>
              <li>We make no guarantees about uptime, availability, or performance.</li>
              <li>We are not responsible for any damages arising from your use of the platform.</li>
              <li>
                The smart contract code is provided for educational purposes and has not undergone a
                formal security audit.
              </li>
            </ul>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">6. Account Termination</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We reserve the right to suspend or terminate your account at our discretion if you
              violate these terms, abuse the platform, or engage in activities that harm other users
              or the system. You may also request account deletion by contacting the PeraPin team.
              Upon termination, your off-chain data will be removed, but on-chain transaction
              history on the Stellar Testnet will remain as blockchain data is immutable.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">7. Changes to Terms</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We may update these Terms of Service from time to time. Changes will be reflected by
              updating the &quot;Last updated&quot; date at the top of this page. Your continued use
              of PeraPin after changes are posted constitutes acceptance of the revised terms. We
              encourage you to review this page periodically.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">8. Governing Law</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              These Terms of Service shall be governed by and construed in accordance with the laws
              of the <strong className="text-slate-900">Republic of the Philippines</strong>. Any
              disputes arising from or relating to the use of PeraPin shall be subject to the
              exclusive jurisdiction of the courts of the Philippines.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
