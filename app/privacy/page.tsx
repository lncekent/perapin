import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { Navigation } from "@/components/shared/Navigation";

export default function PrivacyPolicyPage() {
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
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-1 text-sm text-slate-400">Last updated: August 16, 2026</p>

        {/* Content */}
        <div className="mt-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. Introduction</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              PeraPin (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, store, and
              protect your information when you use our merchant-pull micropayment platform on the
              Stellar Testnet.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Data We Collect</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We collect the following information when you register and use PeraPin:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-600">
              <li>
                <strong className="text-slate-900">Email address</strong> — used for authentication
                via OTP (one-time password).
              </li>
              <li>
                <strong className="text-slate-900">Stellar wallet addresses</strong> — public keys
                generated during registration and used for on-chain transactions.
              </li>
              <li>
                <strong className="text-slate-900">Transaction history</strong> — records of
                payments made through the platform, including amounts, timestamps, and transaction
                hashes.
              </li>
              <li>
                <strong className="text-slate-900">Role selection</strong> — whether you registered
                as a consumer or merchant.
              </li>
              <li>
                <strong className="text-slate-900">Business name</strong> — for merchant accounts
                only.
              </li>
            </ul>
          </section>

          {/* How Data is Stored */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">3. How Your Data is Stored</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-600">
              <li>
                User profiles and transaction records are stored in{" "}
                <strong className="text-slate-900">Supabase PostgreSQL</strong>, a managed database
                with encryption at rest.
              </li>
              <li>
                Stellar private keys are encrypted using{" "}
                <strong className="text-slate-900">AES-256-GCM</strong> before being stored in the
                database. The encryption key is stored separately in server environment variables
                and never in the database itself.
              </li>
              <li>
                Decrypted keys exist only in server memory during transaction signing and are
                immediately scrubbed after use.
              </li>
            </ul>
          </section>

          {/* PIN Security */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">4. PIN Security</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your 4-digit PIN is protected by design:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-600">
              <li>
                Your raw PIN is <strong className="text-slate-900">never transmitted</strong> to our
                servers. It is hashed client-side in your browser using SHA-256 with your public key
                as a salt.
              </li>
              <li>
                Only the resulting hash is sent to the server and stored on-chain in the Soroban
                smart contract.
              </li>
              <li>
                We have <strong className="text-slate-900">no ability</strong> to recover or view
                your raw PIN.
              </li>
              <li>
                Three consecutive failed PIN attempts trigger an automatic 15-minute lockout
                enforced on-chain.
              </li>
            </ul>
          </section>

          {/* Blockchain Data */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">5. Blockchain Transparency</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Transactions on the Stellar blockchain are{" "}
              <strong className="text-slate-900">public by nature</strong>. Once a payment is
              submitted to the Stellar Testnet, the transaction hash, wallet addresses, and amount
              are visible on public blockchain explorers (e.g., Stellar Expert). This is an inherent
              property of blockchain technology and cannot be reversed or hidden.
            </p>
          </section>

          {/* No Selling Data */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">6. We Do Not Sell Your Data</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We will <strong className="text-slate-900">never sell, rent, or share</strong> your
              personal information with third parties for marketing or advertising purposes. Your
              data is used solely to operate the PeraPin payment service.
            </p>
          </section>

          {/* Testnet Disclaimer */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">7. Testnet Disclaimer</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              PeraPin currently operates on the{" "}
              <strong className="text-slate-900">Stellar Testnet</strong> for educational and
              development purposes. All XLM tokens used are test tokens with no real monetary value.
              This project is built as an academic prototype and should not be used for real
              financial transactions.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold text-slate-900">8. Contact Us</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              If you have questions or concerns about this Privacy Policy or your data, please
              contact the PeraPin team through our GitHub repository or the feedback form within the
              application.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
