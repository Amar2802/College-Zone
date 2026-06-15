import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldAlert,
  ArrowLeft,
  Loader2,
  Trash2,
  Lock,
  Key,
  CheckCircle,
} from "lucide-react";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser, signOut } = useAuth();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Password fields
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle mock verification request
  const handleRequestVerification = async () => {
    setVerifying(true);
    try {
      const res = await api.put("/api/profile/verify");
      updateUser(res.user);
      
      toast({
        title: "Account Verified Successfully!",
        description: "Your student credentials have been verified. You now have the verified badge!",
      });
    } catch (err) {
      toast({
        title: "Request failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast({
        title: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Mock password update
      toast({
        title: "Password changed successfully!",
        description: "Your security settings have been updated.",
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast({
        title: "Failed to change password",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you absolutely sure you want to delete your College Zone account? This action is permanent and cannot be undone."
    );
    if (!confirm) return;

    setDeleting(true);
    try {
      await api.delete("/api/profile");
      toast({
        title: "Account Deleted",
        description: "Your account and matching preferences have been permanently removed.",
      });
      signOut();
      navigate("/");
    } catch (err) {
      toast({
        title: "Deletion failed",
        description: err.message,
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/profile")} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display text-3xl font-bold">Account Settings</h1>
        </div>

        {/* Student Verification Card */}
        <Card className="p-6 shadow-card">
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" /> Student Verification
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Verify your account using your university email address or student ID badge to receive a verification check badge and gain priority visibility in matching results.
          </p>
          {user?.verificationStatus === "verified" ? (
            <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-xl flex items-center gap-2.5 text-sm font-semibold">
              <CheckCircle className="w-5 h-5" /> Your account is verified!
            </div>
          ) : (
            <Button
              onClick={handleRequestVerification}
              disabled={verifying}
              className="bg-gradient-primary text-primary-foreground"
            >
              {verifying ? "Submitting..." : "Verify My Student Account"}
            </Button>
          )}
        </Card>

        {/* Change Password Card */}
        <Card className="p-6 shadow-card">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone Card */}
        <Card className="p-6 shadow-card border-destructive/20 bg-destructive/5">
          <h2 className="font-display text-xl font-bold text-destructive mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Permanently delete your College Zone student profile, roommate preferences, and chat history. This action cannot be reverted.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="flex items-center gap-2"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete My Account
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
