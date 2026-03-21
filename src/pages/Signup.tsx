import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowLeft, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone },
        emailRedirectTo: window.location.origin + "/profile-setup",
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Account created! Let's set up your profile 🎓" });
    navigate("/profile-setup");
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/profile-setup" },
    });
    if (error) toast({ title: error.message, variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary-foreground" style={{ width: `${60 + i * 40}px`, height: `${60 + i * 40}px`, top: `${10 + i * 15}%`, right: `${5 + i * 12}%`, opacity: 0.1 + i * 0.05 }} />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
          </motion.div>
          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-4">Join the Community</h2>
          <p className="text-primary-foreground/70 text-lg max-w-sm">Connect with thousands of students and find your perfect roommate.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">College Zone</span>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">Start your journey to the perfect college experience</p>

          <Button variant="outline" size="lg" className="w-full mb-6" onClick={handleGoogleSignup}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" className="pl-10" value={form.name} onChange={e => update("name", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">College Email *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@college.edu" className="pl-10" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="pl-10" value={form.phone} onChange={e => update("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={form.password} onChange={e => update("password", e.target.value)} />
              </div>
            </div>
            <Button variant="hero" size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">Log in</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
