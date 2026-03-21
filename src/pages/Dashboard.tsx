import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageCircle, Users, User, Search, Bell, Heart, X, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  college: string;
  course: string;
  year: string;
  sleep_schedule: string | null;
  cleanliness: string | null;
  study_habits: string | null;
  smoking_drinking: string | null;
};

const prefFields = ["sleep_schedule", "cleanliness", "study_habits", "smoking_drinking"] as const;

function calcMatch(me: Profile, other: Profile): number {
  let score = 0;
  let total = 0;
  for (const f of prefFields) {
    if (me[f] && other[f]) {
      total++;
      if (me[f] === other[f]) score++;
    }
  }
  if (me.college && other.college && me.college.toLowerCase() === other.college.toLowerCase()) score += 1;
  total += 1;
  return total > 0 ? Math.round((score / total) * 100) : 50;
}

function getTraits(p: Profile) {
  return [p.sleep_schedule, p.cleanliness, p.study_habits].filter(Boolean) as string[];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";
}

type Tab = "matches" | "chats" | "profile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("matches");
  const [search, setSearch] = useState("");
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: all } = await supabase.from("profiles").select("*");
      if (all) {
        const me = all.find(p => p.user_id === user.id) || null;
        setMyProfile(me);
        setProfiles(all.filter(p => p.user_id !== user.id));
      }
      setLoadingData(false);
    };
    load();
  }, [user]);

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary animate-pulse" />
      </div>
    );
  }

  const matches = profiles
    .map(p => ({
      ...p,
      match: myProfile ? calcMatch(myProfile, p) : 50,
      traits: getTraits(p),
      initials: getInitials(p.full_name),
    }))
    .sort((a, b) => b.match - a.match);

  const filtered = matches.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()));

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getMatchBg = (score: number) => {
    if (score >= 80) return "bg-success/10";
    if (score >= 60) return "bg-warning/10";
    return "bg-muted";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">College Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {tab === "matches" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold">Your Matches</h1>
                <p className="text-muted-foreground text-sm">{matches.length} roommate{matches.length !== 1 ? "s" : ""} found</p>
              </div>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search matches..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">No matches yet</h3>
                <p className="text-muted-foreground">More students are joining every day. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/chat?to=${m.user_id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                        {m.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-display font-bold text-lg">{m.full_name || "Student"}</h3>
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchBg(m.match)} ${getMatchColor(m.match)}`}>
                            {m.match}%
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{[m.course, m.year, m.college].filter(Boolean).join(" • ") || "No details yet"}</p>
                        <div className="flex flex-wrap gap-2">
                          {m.traits.map(t => (
                            <span key={t} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button variant="hero" size="sm" className="flex-1" onClick={e => { e.stopPropagation(); navigate(`/chat?to=${m.user_id}`); }}>
                        <MessageCircle className="w-4 h-4 mr-1" /> Message
                      </Button>
                      <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={e => e.stopPropagation()}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "chats" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-display text-2xl font-bold mb-6">Messages</h1>
            <div className="text-center py-16">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">No conversations yet</h3>
              <p className="text-muted-foreground">Start chatting with your matches!</p>
            </div>
          </motion.div>
        )}

        {tab === "profile" && myProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto mb-4">
                {getInitials(myProfile.full_name)}
              </div>
              <h1 className="font-display text-2xl font-bold">{myProfile.full_name || "Your Name"}</h1>
              <p className="text-muted-foreground">{[myProfile.course, myProfile.year, myProfile.college].filter(Boolean).join(" • ")}</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-display font-bold text-lg">My Preferences</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sleep", value: myProfile.sleep_schedule },
                  { label: "Cleanliness", value: myProfile.cleanliness },
                  { label: "Study", value: myProfile.study_habits },
                  { label: "Social", value: myProfile.smoking_drinking },
                ].map(p => (
                  <div key={p.label} className="bg-secondary rounded-xl p-3">
                    <span className="text-xs text-muted-foreground">{p.label}</span>
                    <p className="font-semibold text-sm">{p.value || "Not set"}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/profile-setup")}>
                Edit Profile
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-card/90 backdrop-blur-md border-t border-border z-50">
        <div className="container mx-auto flex justify-around py-2">
          {([
            { key: "matches" as Tab, icon: Users, label: "Matches" },
            { key: "chats" as Tab, icon: MessageCircle, label: "Chats" },
            { key: "profile" as Tab, icon: User, label: "Profile" },
          ]).map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${tab === item.key ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
