import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — EquipCheck",
  description:
    "EquipCheck terms of service. Read the terms governing use of our AI equipment validation platform.",
};

export default function TermsOfServicePage() {
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
              href="/privacy"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              Privacy Policy
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
            Terms of Service
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
                ["#acceptance", "Acceptance of Terms"],
                ["#description", "Description of Service"],
                ["#registration", "Account Registration"],
                ["#acceptable-use", "Acceptable Use"],
                ["#billing", "Billing"],
                ["#ai-disclaimer", "AI Disclaimer"],
                ["#ip", "Intellectual Property"],
                ["#data", "Data Handling"],
                ["#liability", "Limitation of Liability"],
                ["#availability", "Service Availability"],
                ["#termination", "Termination"],
                ["#changes", "Changes to Terms"],
                ["#governing-law", "Governing Law"],
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
              <section id="acceptance">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  1. Acceptance of Terms
                </h2>
                <p className="mt-3">
                  By accessing or using EquipCheck (&ldquo;the Service&rdquo;),
                  you agree to be bound by these Terms of Service. If you do not
                  agree to these terms, do not use the Service.
                </p>
              </section>

              <section id="description">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  2. Description of Service
                </h2>
                <p className="mt-3">
                  EquipCheck is an AI-powered equipment validation tool that
                  compares equipment lists against master specifications to
                  identify mismatches, missing items, and quantity discrepancies.
                  The Service is provided as a software-as-a-service (SaaS)
                  platform.
                </p>
              </section>

              <section id="registration">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  3. Account Registration
                </h2>
                <p className="mt-3">
                  To access certain features, you must create an account. You are
                  responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your
                  account. You must provide accurate and complete information
                  when creating your account.
                </p>
              </section>

              <section id="acceptable-use">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  4. Acceptable Use
                </h2>
                <p className="mt-3">You agree not to:</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>
                    Attempt to gain unauthorized access to the Service or its
                    systems
                  </li>
                  <li>
                    Interfere with or disrupt the Service or its infrastructure
                  </li>
                  <li>
                    Use automated tools to scrape or extract data from the
                    Service beyond normal API usage
                  </li>
                  <li>
                    Resell or redistribute the Service without written
                    authorization
                  </li>
                  <li>
                    Upload files containing malware or malicious content
                  </li>
                </ul>
              </section>

              <section id="billing">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  5. Subscription Plans and Billing
                </h2>
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-4 py-2.5 font-semibold text-slate-700">
                          Plan
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-slate-700">
                          Price
                        </th>
                        <th className="px-4 py-2.5 font-semibold text-slate-700">
                          Validations
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Free
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">$0</td>
                        <td className="px-4 py-2.5 text-slate-600">
                          3 per month
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Professional
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          $149/month
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          75 per month
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          Business
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          $299/month
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          Unlimited
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  Paid subscriptions are billed monthly through Stripe. You may
                  cancel your subscription at any time through the billing
                  portal. Cancellations take effect at the end of the current
                  billing period. We do not offer prorated refunds for partial
                  months.
                </p>
              </section>

              <section id="ai-disclaimer">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  6. AI-Generated Results &mdash; Disclaimer
                </h2>
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">
                    EquipCheck&rsquo;s validation results are generated by
                    artificial intelligence and are provided as a
                    decision-support tool, not as a substitute for professional
                    judgment.
                  </p>
                </div>
                <ul className="mt-4 list-disc space-y-1.5 pl-5">
                  <li>
                    Results should be reviewed by qualified personnel before
                    making purchasing or deployment decisions
                  </li>
                  <li>
                    We do not guarantee 100% accuracy of validation results
                  </li>
                  <li>
                    AI may misinterpret ambiguous item descriptions or
                    non-standard naming conventions
                  </li>
                  <li>
                    You are solely responsible for verifying results before
                    acting on them
                  </li>
                </ul>
              </section>

              <section id="ip">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  7. Intellectual Property
                </h2>
                <p className="mt-3">
                  You retain all rights to your uploaded files and data.
                  EquipCheck does not claim ownership of any content you upload.
                  The Service, including its design, code, and branding, is the
                  property of EquipCheck.
                </p>
              </section>

              <section id="data">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  8. Data Handling
                </h2>
                <p className="mt-3">
                  Your use of the Service is also governed by our{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Privacy Policy
                  </Link>
                  . Uploaded equipment files are processed in memory and deleted
                  immediately after validation. We do not retain your uploaded
                  files.
                </p>
              </section>

              <section id="liability">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  9. Limitation of Liability
                </h2>
                <p className="mt-3">
                  To the maximum extent permitted by law, EquipCheck shall not be
                  liable for any indirect, incidental, special, consequential, or
                  punitive damages, including but not limited to loss of profits,
                  data, or business opportunities, arising from your use of the
                  Service.
                </p>
                <p className="mt-3">
                  Our total liability for any claim arising from the Service
                  shall not exceed the amount you paid us in the 12 months
                  preceding the claim.
                </p>
              </section>

              <section id="availability">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  10. Service Availability
                </h2>
                <p className="mt-3">
                  We strive to maintain high availability but do not guarantee
                  uninterrupted access to the Service. We may perform
                  maintenance, updates, or modifications that temporarily affect
                  availability. We will make reasonable efforts to notify users
                  of planned downtime.
                </p>
              </section>

              <section id="termination">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  11. Termination
                </h2>
                <p className="mt-3">
                  We reserve the right to suspend or terminate your account if
                  you violate these Terms. You may delete your account at any
                  time. Upon termination, your account data will be permanently
                  deleted in accordance with our Privacy Policy.
                </p>
              </section>

              <section id="changes">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  12. Changes to Terms
                </h2>
                <p className="mt-3">
                  We may update these Terms from time to time. Continued use of
                  the Service after changes constitutes acceptance of the updated
                  Terms. We will notify you of material changes via email or
                  in-app notification.
                </p>
              </section>

              <section id="governing-law">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  13. Governing Law
                </h2>
                <p className="mt-3">
                  These Terms shall be governed by and construed in accordance
                  with applicable law, without regard to conflict of law
                  principles.
                </p>
              </section>

              <section id="contact">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  14. Contact Us
                </h2>
                <p className="mt-3">
                  If you have any questions about these Terms, please contact us
                  at{" "}
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
              href="/privacy"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Privacy Policy
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
