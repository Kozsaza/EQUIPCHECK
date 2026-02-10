import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — EquipCheck",
  description: "EquipCheck privacy policy. Learn how we handle your data with zero-retention architecture.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-[#0F172A]">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Link href="/" className="font-display text-xl font-bold text-white">
            EquipCheck
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: February 2026</p>

        <div className="prose prose-slate mt-10 max-w-none">
          <h2>1. Introduction</h2>
          <p>
            EquipCheck (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the EquipCheck
            equipment validation service. This Privacy Policy explains how we collect, use, and protect
            your information when you use our service.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Password (stored as a secure hash by our authentication provider)</li>
          </ul>

          <h3>Usage Data</h3>
          <p>We track basic usage metrics to improve our service:</p>
          <ul>
            <li>Number of validations performed</li>
            <li>Industry type detected (e.g., electrical, HVAC)</li>
            <li>Timestamps of activity</li>
            <li>Referral source (if applicable)</li>
          </ul>

          <h3>Payment Information</h3>
          <p>
            Payment processing is handled entirely by Stripe. We never store your credit card number,
            CVV, or full billing details on our servers. We only store your Stripe customer ID to
            manage your subscription.
          </p>

          <h2>3. Equipment Files &mdash; Zero Data Retention</h2>
          <p>
            <strong>We do not store your uploaded equipment files or specification documents.</strong>
          </p>
          <ul>
            <li>Files are processed in memory during validation</li>
            <li>Files are permanently deleted immediately after validation completes</li>
            <li>Files are never written to persistent storage</li>
            <li>Files are never used for AI training or model improvement</li>
            <li>Files are never shared with third parties</li>
            <li>Validation results (match/mismatch summaries) are stored in your account for your reference, but the original file contents are not</li>
          </ul>

          <h2>4. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain the EquipCheck service</li>
            <li>Process your equipment validations</li>
            <li>Manage your account and subscription</li>
            <li>Send transactional emails (account confirmation, password reset)</li>
            <li>Improve the accuracy of our validation engine</li>
            <li>Monitor service health and prevent abuse</li>
          </ul>

          <h2>5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Supabase</strong> &mdash; Authentication and database hosting</li>
            <li><strong>Google Gemini API</strong> &mdash; AI-powered equipment comparison (your data is sent to Google for processing but is not retained by Google for training per their API terms)</li>
            <li><strong>Stripe</strong> &mdash; Payment processing</li>
            <li><strong>Vercel</strong> &mdash; Application hosting</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement industry-standard security measures including TLS encryption for all data in
            transit, secure authentication via Supabase, and row-level security policies ensuring users
            can only access their own data.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your account data</li>
            <li>Delete your account and all associated data</li>
            <li>Export your validation history</li>
            <li>Opt out of non-essential communications</li>
          </ul>

          <h2>8. Cookies</h2>
          <p>
            We use essential cookies only for authentication session management. We do not use
            advertising cookies or third-party tracking cookies.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            updating the &ldquo;Last updated&rdquo; date at the top of this page.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:support@equipcheck.app">support@equipcheck.app</a>.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            &larr; Back to EquipCheck
          </Link>
        </div>
      </footer>
    </div>
  );
}
