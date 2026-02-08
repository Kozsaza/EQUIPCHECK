"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "equipcheck_nudge_dismissed";

export function SignInNudge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) setVisible(true);
    });
  }, []);

  if (!visible) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            Want to save these results and validate your own files?
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            Create a free account to keep your specs, export PDF reports, and run 3 validations per month.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md"
          >
            <Link href="/signup">
              Create Free Account <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <button
            onClick={dismiss}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
