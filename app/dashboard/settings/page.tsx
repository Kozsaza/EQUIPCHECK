"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? "");
    }
    load();
  }, [supabase]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      toast.success("Password updated");
      setNewPassword("");
    }
    setLoading(false);
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This will permanently delete all your specs, validations, and data. This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete account");
        return;
      }

      await supabase.auth.signOut();
      router.push("/login");
      toast.success("Account deleted successfully.");
    } catch {
      setError("Failed to delete account. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Settings</h1>
        <p className="mt-1 text-secondary">Manage your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading || !newPassword}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
