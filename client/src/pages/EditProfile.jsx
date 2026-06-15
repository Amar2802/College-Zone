import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Sparkles,
  Heart,
  Linkedin,
  Instagram,
  Globe,
  Loader2,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Save,
  Plus,
  X,
} from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Form states
  const [basic, setBasic] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    city: "",
    state: "",
    college: "",
    course: "",
    year: "",
  });

  const [bio, setBio] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [hobbyInput, setHobbyInput] = useState("");
  const [interests, setInterests] = useState([]);
  const [hobbies, setHobbies] = useState([]);

  const [socials, setSocials] = useState({
    linkedin: "",
    instagram: "",
    portfolio: "",
  });

  const [prefs, setPrefs] = useState({
    budgetRange: "",
    preferredLocation: "",
    moveInDate: "",
    smokingPreference: "",
    drinkingPreference: "",
    cleanlinessLevel: "",
    sleepSchedule: "",
    studyHabits: "",
    guestPolicy: "",
    petsPreference: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await api.get("/api/profile");
        const u = res.user;

        setBasic({
          name: u.name || "",
          phone: u.phone || "",
          age: u.age || "",
          gender: u.gender || "",
          city: u.city || "",
          state: u.state || "",
          college: u.profile?.college || "",
          course: u.profile?.course || "",
          year: u.profile?.year || "",
        });

        setBio(u.bio || "");
        setInterests(u.interests || []);
        setHobbies(u.hobbies || []);

        setSocials({
          linkedin: u.socialLinks?.linkedin || "",
          instagram: u.socialLinks?.instagram || "",
          portfolio: u.socialLinks?.portfolio || "",
        });

        setPrefs({
          budgetRange: u.preferences?.budgetRange || "",
          preferredLocation: u.preferences?.preferredLocation || "",
          moveInDate: u.preferences?.moveInDate || "",
          smokingPreference: u.preferences?.smokingPreference || "",
          drinkingPreference: u.preferences?.drinkingPreference || "",
          cleanlinessLevel: u.preferences?.cleanlinessLevel || "",
          sleepSchedule: u.preferences?.sleepSchedule || "",
          studyHabits: u.preferences?.studyHabits || "",
          guestPolicy: u.preferences?.guestPolicy || "",
          petsPreference: u.preferences?.petsPreference || "",
        });
      } catch (err) {
        toast({
          title: "Error loading profile data",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate, toast]);

  // Handle image updates (Profile/Cover)
  const handleImageMockUpload = async (type) => {
    setImageUploading(true);
    try {
      const res = await api.post("/api/profile/image", { type });
      updateUser(res.user);
      toast({
        title: "Success",
        description: `New ${type === "profile" ? "profile avatar" : "banner image"} uploaded successfully!`,
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Add Tags
  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const removeInterest = (tag) => {
    setInterests(interests.filter((i) => i !== tag));
  };

  const addHobby = () => {
    if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim())) {
      setHobbies([...hobbies, hobbyInput.trim()]);
      setHobbyInput("");
    }
  };

  const removeHobby = (tag) => {
    setHobbies(hobbies.filter((h) => h !== tag));
  };

  // Save General Profile Data
  const handleSaveGeneral = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/api/profile", {
        ...basic,
        bio,
        interests,
        hobbies,
        socialLinks: socials,
      });
      updateUser(res.user);
      toast({ title: "Profile saved successfully!" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Preferences Data
  const handleSavePreferences = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/api/profile/preferences", prefs);
      updateUser(res.user);
      toast({ title: "Preferences saved successfully!" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/profile")} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display text-3xl font-bold">Edit Profile</h1>
        </div>

        {/* Banner upload preview */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-muted border group">
          <img
            src={user?.coverImage || "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={() => handleImageMockUpload("cover")}
              disabled={imageUploading}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <ImageIcon className="w-4 h-4" /> Change Banner
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 -mt-16 sm:pl-8 relative z-10">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-md bg-muted group">
            <img
              src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name)}`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={() => handleImageMockUpload("profile")}
                disabled={imageUploading}
                variant="secondary"
                size="icon"
                className="w-10 h-10 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full pt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Basic Info
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> About & Tags
            </TabsTrigger>
            <TabsTrigger value="prefs" className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Preferences
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card className="p-6 mt-4 shadow-card">
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={basic.name}
                      onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={basic.phone}
                      onChange={(e) => setBasic({ ...basic, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={basic.age}
                      onChange={(e) => setBasic({ ...basic, age: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={basic.gender}
                      onChange={(e) => setBasic({ ...basic, gender: e.target.value })}
                      className="mt-1"
                      placeholder="e.g. Male, Female, Non-binary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={basic.city}
                      onChange={(e) => setBasic({ ...basic, city: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={basic.state}
                      onChange={(e) => setBasic({ ...basic, state: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="college">College / University</Label>
                    <Input
                      id="college"
                      value={basic.college}
                      onChange={(e) => setBasic({ ...basic, college: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course">Course / Major</Label>
                    <Input
                      id="course"
                      value={basic.course}
                      onChange={(e) => setBasic({ ...basic, course: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year of Study</Label>
                    <Input
                      id="year"
                      value={basic.year}
                      onChange={(e) => setBasic({ ...basic, year: e.target.value })}
                      className="mt-1"
                      placeholder="e.g. Junior, Senior, 1st Year"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* About & Tags Tab */}
          <TabsContent value="about">
            <Card className="p-6 mt-4 shadow-card">
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                <div>
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 resize-none"
                    placeholder="Tell other students about yourself..."
                  />
                </div>

                {/* Interests Tags */}
                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex gap-2">
                    <Input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                      placeholder="e.g. Gaming, Coding, Football"
                    />
                    <Button type="button" onClick={addInterest}>
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {interests.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs bg-muted border px-2.5 py-1 rounded-full font-medium"
                      >
                        {tag}
                        <button type="button" onClick={() => removeInterest(tag)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hobbies Tags */}
                <div className="space-y-2">
                  <Label>Hobbies</Label>
                  <div className="flex gap-2">
                    <Input
                      value={hobbyInput}
                      onChange={(e) => setHobbyInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHobby())}
                      placeholder="e.g. Painting, Reading, Hiking"
                    />
                    <Button type="button" onClick={addHobby}>
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {hobbies.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full font-medium"
                      >
                        {tag}
                        <button type="button" onClick={() => removeHobby(tag)} className="text-primary hover:text-primary-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-display font-bold text-lg">Social links</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-primary" /> LinkedIn URL
                      </Label>
                      <Input
                        id="linkedin"
                        value={socials.linkedin}
                        onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                        className="mt-1"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-primary" /> Instagram Username
                      </Label>
                      <Input
                        id="instagram"
                        value={socials.instagram}
                        onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                        className="mt-1"
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolio" className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" /> Portfolio Website
                      </Label>
                      <Input
                        id="portfolio"
                        value={socials.portfolio}
                        onChange={(e) => setSocials({ ...socials, portfolio: e.target.value })}
                        className="mt-1"
                        placeholder="https://mywebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="prefs">
            <Card className="p-6 mt-4 shadow-card">
              <form onSubmit={handleSavePreferences} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Monthly Budget Range</Label>
                    <Input
                      id="budget"
                      value={prefs.budgetRange}
                      onChange={(e) => setPrefs({ ...prefs, budgetRange: e.target.value })}
                      placeholder="e.g. $400 - $600"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Preferred Location</Label>
                    <Input
                      id="location"
                      value={prefs.preferredLocation}
                      onChange={(e) => setPrefs({ ...prefs, preferredLocation: e.target.value })}
                      placeholder="e.g. Downtown, Near Campus"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="movein">Target Move-in Date</Label>
                    <Input
                      id="movein"
                      value={prefs.moveInDate}
                      onChange={(e) => setPrefs({ ...prefs, moveInDate: e.target.value })}
                      placeholder="e.g. Fall 2026, Aug 1st"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cleanliness">Cleanliness Level</Label>
                    <select
                      id="cleanliness"
                      value={prefs.cleanlinessLevel}
                      onChange={(e) => setPrefs({ ...prefs, cleanlinessLevel: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="">Select option</option>
                      <option value="Very Clean">Very Clean</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Relaxed">Relaxed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sleep">Sleep Schedule</Label>
                    <select
                      id="sleep"
                      value={prefs.sleepSchedule}
                      onChange={(e) => setPrefs({ ...prefs, sleepSchedule: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="">Select option</option>
                      <option value="Early Bird">Early Bird</option>
                      <option value="Night Owl">Night Owl</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="study">Study Habits</Label>
                    <select
                      id="study"
                      value={prefs.studyHabits}
                      onChange={(e) => setPrefs({ ...prefs, studyHabits: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="">Select option</option>
                      <option value="Quiet">Quiet</option>
                      <option value="Group Study">Group Study</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="smoking">Smoking Preference</Label>
                    <select
                      id="smoking"
                      value={prefs.smokingPreference}
                      onChange={(e) => setPrefs({ ...prefs, smokingPreference: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="">Select option</option>
                      <option value="Non-smoker">Non-smoker</option>
                      <option value="Social Smoker">Social Smoker</option>
                      <option value="Regular Smoker">Regular Smoker</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="drinking">Drinking Preference</Label>
                    <select
                      id="drinking"
                      value={prefs.drinkingPreference}
                      onChange={(e) => setPrefs({ ...prefs, drinkingPreference: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="">Select option</option>
                      <option value="Non-drinker">Non-drinker</option>
                      <option value="Social Drinker">Social Drinker</option>
                      <option value="Regular Drinker">Regular Drinker</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="guests">Guest Policy</Label>
                    <Input
                      id="guests"
                      value={prefs.guestPolicy}
                      onChange={(e) => setPrefs({ ...prefs, guestPolicy: e.target.value })}
                      placeholder="e.g. No overnight guests, Weekends only"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pets">Pets Preference</Label>
                    <Input
                      id="pets"
                      value={prefs.petsPreference}
                      onChange={(e) => setPrefs({ ...prefs, petsPreference: e.target.value })}
                      placeholder="e.g. Cats okay, No dogs"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditProfile;
