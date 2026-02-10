import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — EquipCheck",
  description:
    "EquipCheck privacy policy. Learn how we handle your data with zero-retention architecture.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-[#0F172A]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-xl font-bold text-white"
          >
            EquipCheck
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
            <Link
              href="/login"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Legal
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: February 2026
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Table of contents — desktop sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-8 space-y-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                On this page
              </p>
              {[
                ["#introduction", "Introduction"],
                ["#info-collected", "Information We Collect"],
                ["#zero-retention", "Zero Data Retention"],
                ["#how-we-use", "How We Use Info"],
                ["#third-party", "Third-Party Services"],
                ["#security", "Data Security"],
                ["#your-rights", "Your Rights"],
                ["#cookies", "Cookies"],
                ["#changes", "Changes"],
                ["#contact", "Contact Us"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-slate-500 transition-colors hover:text-blue-600"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="space-y-10 text-[15px] leading-relaxed text-slate-700">
              <section id="introduction">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  1. Introduction
                </h2>
                <p className="mt-3">
                  EquipCheck (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                  &ldquo;our&rdquo;) operates the EquipCheck equipment
                  validation service. This Privacy Policy explains how we
                  collect, use, and protect your information when you use our
                  service.
                </p>
              </section>

              <section id="info-collected">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  2. Information We Collect
                </h2>

                <h3 className="mt-5 font-display text-base font-semibold text-slate-800">
                  Account Information
                </h3>
                <p className="mt-2">
                  When you create an account, we collect:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Email address</li>
                  <li>
                    Password (stored as a secure hash by our authentication
                    provider)
                  </li>
                </ul>

                <h3 className="mt-5 font-display text-base font-semibold text-slate-800">
                  Usage Data
                </h3>
                <p className="mt-2">
                  We track basic usage metrics to improve our service:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Number of validations performed</li>
                  <li>Industry type detected (e.g., electrical, HVAC)</li>
                  <li>Timestamps of activity</li>
                  <li>Referral source (if applicable)</li>
                </ul>

                <h3 className="mt-5 font-display text-base font-semibold text-slate-800">
                  Payment Information
                </h3>
                <p className="mt-2">
                  Payment processing is handled entirely by Stripe. We never
                  store your credit card number, CVV, or full billing details on
                  our servers. We only store your Stripe customer ID to manage
                  your subscription.
                </p>
              </section>

              <section id="zero-retention">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  3. Equipment Files &mdash; Zero Data Retention
                </h2>
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-900">
                    We do not store your uploaded equipment files or
                    specification documents.
                  </p>
                </div>
                <ul className="mt-4 list-disc space-y-1.5 pl-5">
                  <li>
                    Files are processed in memory during validation
                  </li>
                  <li>
                    Files are permanently deleted immediately after validation
                    completes
                  </li>
                  <li>Files are never written to persistent storage</li>
                  <li>
                    Files are never used for AI training or model improvement
                  </li>
                  <li>Files are never shared with third parties</li>
                  <li>
                    Validation results (match/mismatch summaries) are stored in
                    your account for your reference, but the original file
                    contents are not
                  </li>
                </ul>
              </section>

              <section id="how-we-use">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  4. How We Use Your Information
                </h2>
                <p className="mt-3">
                  We use the information we collect to:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Provide and maintain the EquipCheck service</li>
                  <li>Process your equipment validations</li>
                  <li>Manage your account and subscription</li>
                  <li>
                    Send transactional emails (account confirmation, password
                    reset)
                  </li>
                  <li>Improve the accuracy of our validation engine</li>
                  <li>Monitor service health and prevent abuse</li>
                </ul>
              </section>

              <section id="third-party">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  5. Third-Party Services
                </h2>
                <p className="mt-3">
                  We use the following third-party services:
                </p>
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-4 py-2.5 font-semibold text-slate-700">
                          Service
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-slate-700">
                          Purpose
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Supabase
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          Authentication and database hosting
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Google Gemini API
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          AI-powered equipment comparison (your data is sent to
                          Google for processing but is not retained by Google for
                          training per their API terms)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Stripe
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          Payment processing
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Vercel
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          Application hosting
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Resend
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          Transactional email delivery
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="security">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  6. Data Security
                </h2>
                <p className="mt-3">
                  We implement industry-standard security measures including TLS
                  encryption for all data in transit, secure authentication via
                  Supabase, and row-level security policies ensuring users can
                  only access their own data.
                </p>
              </section>

              <section id="your-rights">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  7. Your Rights
                </h2>
                <p className="mt-3">You have the right to:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Access your account data</li>
                  <li>Delete your account and all associated data</li>
                  <li>Export your validation history</li>
                  <li>Opt out of non-essential communications</li>
                </ul>
              </section>

              <section id="cookies">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  8. Cookies
                </h2>
                <p className="mt-3">
                  We use essential cookies only for authentication session
                  management. We do not use advertising cookies or third-party
                  tracking cookies.
                </p>
              </section>

              <section id="changes">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  9. Changes to This Policy
                </h2>
                <p className="mt-3">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by updating the &ldquo;Last
                  updated&rdquo; date at the top of this page.
                </p>
              </section>

              <section id="contact">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  10. Contact Us
                </h2>
                <p className="mt-3">
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:support@equipcheck.app"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    support@equipcheck.app
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              &larr; Back to EquipCheck
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/terms"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} EquipCheck. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
