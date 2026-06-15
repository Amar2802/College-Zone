import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Share2,
} from "lucide-react";

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    showPhone: false,
    showEmail: false,
    showSocials: false,
    publicProfileVisibility: true,
  });

  // Populate state from user object
  useEffect(() => {
    if (user?.privacySettings) {
      setSettings({
        showPhone: !!user.privacySettings.showPhone,
        showEmail: !!user.privacySettings.showEmail,
        showSocials: !!user.privacySettings.showSocials,
        publicProfileVisibility: user.privacySettings.publicProfileVisibility !== false,
      });
    }
  }, [user]);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/api/profile/privacy", settings);
      updateUser(res.user);
      toast({
        title: "Privacy settings updated!",
        description: "Your visibility and sharing preferences have been saved.",
      });
    } catch (err) {
      toast({
        title: "Failed to update settings",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/profile")}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display text-3xl font-bold">Privacy Settings</h1>
        </div>

        {/* Global Directory Visibility */}
        <Card className="p-6 shadow-card space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                {settings.publicProfileVisibility ? (
                  <Eye className="w-5 h-5 text-primary" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
                Profile Visibility
              </h2>
              <p className="text-sm text-muted-foreground">
                When enabled, your roommate profile card is displayed in the matching directory and matches search results.
              </p>
            </div>
            <Switch
              checked={settings.publicProfileVisibility}
              onCheckedChange={() => handleToggle("publicProfileVisibility")}
              id="public-visibility"
            />
          </div>
        </Card>

        {/* Contact Info Toggles */}
        <Card className="p-6 shadow-card space-y-6">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <ShieldCheck className="w-5 h-5 text-primary" /> Contact Sharing Controls
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Control which contact details and external links are shown on your profile to prospective roommates.
          </p>

          <div className="space-y-6">
            {/* Show Phone Number */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <Label htmlFor="show-phone" className="text-base font-semibold cursor-pointer">
                    Share Phone Number
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your telephone number on your profile card.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.showPhone}
                onCheckedChange={() => handleToggle("showPhone")}
                id="show-phone"
              />
            </div>

            {/* Show Email Address */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <Label htmlFor="show-email" className="text-base font-semibold cursor-pointer">
                    Share University Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email address to verified students.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={() => handleToggle("showEmail")}
                id="show-email"
              />
            </div>

            {/* Show Social Profiles */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Share2 className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <Label htmlFor="show-socials" className="text-base font-semibold cursor-pointer">
                    Share Social Profiles
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Make your LinkedIn and Instagram handles visible.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.showSocials}
                onCheckedChange={() => handleToggle("showSocials")}
                id="show-socials"
              />
            </div>
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-primary text-primary-foreground gap-2 min-w-[120px]"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
