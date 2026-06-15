import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
  User,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Instagram,
  Globe,
  Settings,
  Shield,
  Heart,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const viewId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [completion, setCompletion] = useState(0);
  const isOwnProfile = !viewId || viewId === currentUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (isOwnProfile) {
          const res = await api.get("/api/profile");
          setProfileUser(res.user);
          setCompletion(res.completionPercentage);
          // Keep auth context updated
          updateUser(res.user);
        } else {
          // View other user
          const userRes = await api.get(`/api/users/${viewId}`);
          setProfileUser(userRes);
          // Calculate completion dynamically
          const calculateCompletionLocal = (u) => {
            let score = 0;
            if (u.profileImage) score += 10;
            const basic = [u.name, u.age, u.gender, u.profile?.college, u.profile?.course, u.profile?.year, u.city, u.state];
            score += Math.round((basic.filter(Boolean).length / basic.length) * 25);
            if (u.bio) score += 5;
            if (u.interests?.length) score += 5;
            if (u.hobbies?.length || u.languages?.length) score += 5;
            const prefs = [
              u.preferences?.budgetRange, u.preferences?.preferredLocation, u.preferences?.moveInDate,
              u.preferences?.smokingPreference, u.preferences?.drinkingPreference, u.preferences?.cleanlinessLevel,
              u.preferences?.sleepSchedule, u.preferences?.studyHabits, u.preferences?.guestPolicy, u.preferences?.petsPreference
            ];
            score += Math.round((prefs.filter(Boolean).length / prefs.length) * 30);
            if (u.socialLinks?.linkedin || u.socialLinks?.instagram || u.socialLinks?.portfolio) score += 10;
            if (u.verificationStatus === "verified") score += 10;
            return Math.min(score, 100);
          };
          setCompletion(calculateCompletionLocal(userRes));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast({
          title: "Error loading profile",
          description: err.message || "Failed to fetch user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [viewId, currentUser, isOwnProfile, toast, updateUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Profile not found</h1>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const defaultCover = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80";
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileUser.name)}`;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Top Banner & Header */}
      <div className="relative h-64 w-full overflow-hidden bg-muted">
        <img
          src={profileUser.coverImage || defaultCover}
          alt="Profile cover banner"
          className="w-full h-full object-cover"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="absolute top-6 left-6 z-10 bg-background/80 backdrop-blur-sm shadow-card rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Card: Avatar, Badges, Completion, Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6 text-center shadow-card relative overflow-hidden bg-card/90 backdrop-blur-sm border-primary/10">
              <div className="relative w-36 h-36 mx-auto mb-4 rounded-full border-4 border-background overflow-hidden shadow-md">
                <img
                  src={profileUser.profileImage || defaultAvatar}
                  alt={profileUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h1 className="font-display text-2xl font-bold text-foreground">{profileUser.name}</h1>
                {profileUser.verificationStatus === "verified" && (
                  <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" title="Verified Account" />
                )}
              </div>

              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mb-4">
                <GraduationCap className="w-4 h-4" />
                {profileUser.profile?.college || "No College Selected"}
              </p>

              {/* Progress Completion Indicator for Own Profile */}
              {isOwnProfile && (
                <div className="mb-6 bg-muted/60 p-4 rounded-xl text-left border">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Profile Completion</span>
                    <span className="text-primary">{completion}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  {completion < 100 && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Complete your profile to increase visibility to roommate matches!
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {isOwnProfile ? (
                  <>
                    <Button onClick={() => navigate("/edit-profile")} className="w-full bg-gradient-primary text-primary-foreground">
                      Edit Profile
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate("/account-settings")} className="text-xs">
                        <Settings className="w-3.5 h-3.5 mr-1" /> Account
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/privacy-settings")} className="text-xs">
                        <Shield className="w-3.5 h-3.5 mr-1" /> Privacy
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button onClick={() => navigate(`/chat?to=${profileUser._id}`)} className="w-full bg-gradient-primary text-primary-foreground">
                    Message {profileUser.name.split(" ")[0]}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Details Column: Info, Bio, Preferences */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info & Social Links */}
            <Card className="p-6 shadow-card bg-card/90 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>
                    <strong className="text-foreground">Course:</strong> {profileUser.profile?.course || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    <strong className="text-foreground">Year:</strong> {profileUser.profile?.year || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span>
                    <strong className="text-foreground">Age / Gender:</strong> {profileUser.age || "N/A"} / {profileUser.gender || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    <strong className="text-foreground">Location:</strong> {profileUser.city && profileUser.state ? `${profileUser.city}, ${profileUser.state}` : "N/A"}
                  </span>
                </div>
                {(isOwnProfile || profileUser.privacySettings?.showEmail) && profileUser.email && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>
                      <strong className="text-foreground">Email:</strong> {profileUser.email}
                    </span>
                  </div>
                )}
                {(isOwnProfile || profileUser.privacySettings?.showPhone) && profileUser.phone && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>
                      <strong className="text-foreground">Phone:</strong> {profileUser.phone}
                    </span>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {(isOwnProfile || profileUser.privacySettings?.showSocials) && (
                <div className="flex flex-wrap gap-2.5 pt-4 border-t">
                  {profileUser.socialLinks?.linkedin && (
                    <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 hover:text-[#0A66C2] hover:border-[#0A66C2]">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </Button>
                    </a>
                  )}
                  {profileUser.socialLinks?.instagram && (
                    <a href={`https://instagram.com/${profileUser.socialLinks.instagram.replace("@", "")}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 hover:text-[#E1306C] hover:border-[#E1306C]">
                        <Instagram className="w-3.5 h-3.5" /> Instagram
                      </Button>
                    </a>
                  )}
                  {profileUser.socialLinks?.portfolio && (
                    <a href={profileUser.socialLinks.portfolio} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 hover:text-primary hover:border-primary">
                        <Globe className="w-3.5 h-3.5" /> Portfolio
                      </Button>
                    </a>
                  )}
                  {!profileUser.socialLinks?.linkedin && !profileUser.socialLinks?.instagram && !profileUser.socialLinks?.portfolio && (
                    <span className="text-xs text-muted-foreground italic">No social links added</span>
                  )}
                </div>
              )}
            </Card>

            {/* About Me Section */}
            <Card className="p-6 shadow-card bg-card/90 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> About Me
              </h2>
              <p className="text-foreground text-sm leading-relaxed mb-6 whitespace-pre-line">
                {profileUser.bio || "This user hasn't written a bio yet."}
              </p>

              {/* Tags/Interests */}
              <div className="space-y-4">
                {profileUser.interests?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profileUser.interests.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profileUser.hobbies?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Hobbies</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profileUser.hobbies.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-2.5 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Roommate Preferences Section */}
            <Card className="p-6 shadow-card bg-card/90 backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" /> Roommate Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Budget Range</span>
                  <span className="font-medium text-foreground mt-1 flex items-center gap-0.5">
                    <DollarSign className="w-4 h-4 text-primary" />
                    {profileUser.preferences?.budgetRange || "Flexible"}
                  </span>
                </div>
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Preferred Location</span>
                  <span className="font-medium text-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    {profileUser.preferences?.preferredLocation || "Flexible"}
                  </span>
                </div>
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Target Move-in</span>
                  <span className="font-medium text-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    {profileUser.preferences?.moveInDate || "Flexible"}
                  </span>
                </div>
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Cleanliness Level</span>
                  <span className="font-medium text-foreground mt-1">
                    {profileUser.preferences?.cleanlinessLevel || "N/A"}
                  </span>
                </div>
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Sleep Schedule</span>
                  <span className="font-medium text-foreground mt-1">
                    {profileUser.preferences?.sleepSchedule || "N/A"}
                  </span>
                </div>
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Study Habits</span>
                  <span className="font-medium text-foreground mt-1">
                    {profileUser.preferences?.studyHabits || "N/A"}
                  </span>
                </div>
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Smoking / Drinking</span>
                  <span className="font-medium text-foreground mt-1">
                    {profileUser.preferences?.smokingPreference || "N/A"} / {profileUser.preferences?.drinkingPreference || "N/A"}
                  </span>
                </div>
                <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Guest Policy</span>
                  <span className="font-medium text-foreground mt-1">
                    {profileUser.preferences?.guestPolicy || "N/A"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
