import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ArrowLeft, Check, GraduationCap, Moon, Droplets, BookOpen, Wine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const steps = ["Basic Info", "Preferences", "Lifestyle"];

type Pref = { label: string; field: string; icon: React.ElementType; options: string[] };
const preferences: Pref[] = [
  { label: "Sleep Schedule", field: "sleep_schedule", icon: Moon, options: ["Early Bird", "Night Owl", "Flexible"] },
  { label: "Cleanliness", field: "cleanliness", icon: Droplets, options: ["Very Tidy", "Moderate", "Relaxed"] },
  { label: "Study Habits", field: "study_habits", icon: BookOpen, options: ["Library Lover", "Room Studier", "Café Goer"] },
  { label: "Smoking/Drinking", field: "smoking_drinking", icon: Wine, options: ["Neither", "Social Only", "Regular"] },
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ college: "", course: "", year: "" });
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const selectPref = (field: string, option: string) => {
    setPrefs(p => ({ ...p, [field]: option }));
  };

  const next = async () => {
    if (step === 0 && (!info.college || !info.course || !info.year)) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          college: info.college,
          course: info.course,
          year: info.year,
          sleep_schedule: prefs.sleep_schedule || "",
          cleanliness: prefs.cleanliness || "",
          study_habits: prefs.study_habits || "",
          smoking_drinking: prefs.smoking_drinking || "",
        })
        .eq("user_id", user!.id);
      setSaving(false);
      if (error) {
        toast({ title: "Error saving profile", variant: "destructive" });
        return;
      }
      toast({ title: "Profile complete! Welcome to College Zone 🎉" });
      navigate("/dashboard");
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">College Zone</span>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">Tell us about yourself</h2>
                </div>
                <div><Label>College / University</Label><Input className="mt-1" placeholder="e.g. MIT" value={info.college} onChange={e => setInfo(f => ({ ...f, college: e.target.value }))} /></div>
                <div><Label>Course / Major</Label><Input className="mt-1" placeholder="e.g. Computer Science" value={info.course} onChange={e => setInfo(f => ({ ...f, course: e.target.value }))} /></div>
                <div><Label>Year</Label><Input className="mt-1" placeholder="e.g. Sophomore" value={info.year} onChange={e => setInfo(f => ({ ...f, year: e.target.value }))} /></div>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Your Preferences</h2>
                {preferences.slice(0, 2).map(p => (
                  <div key={p.field}>
                    <div className="flex items-center gap-2 mb-3">
                      <p.icon className="w-5 h-5 text-primary" />
                      <Label className="text-base">{p.label}</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.options.map(o => (
                        <button key={o} onClick={() => selectPref(p.field, o)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${prefs[p.field] === o ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Lifestyle</h2>
                {preferences.slice(2).map(p => (
                  <div key={p.field}>
                    <div className="flex items-center gap-2 mb-3">
                      <p.icon className="w-5 h-5 text-primary" />
                      <Label className="text-base">{p.label}</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.options.map(o => (
                        <button key={o} onClick={() => selectPref(p.field, o)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${prefs[p.field] === o ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="hero" onClick={next} disabled={saving}>
              {step < 2 ? "Next" : saving ? "Saving..." : "Complete"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
