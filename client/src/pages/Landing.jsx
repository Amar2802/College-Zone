import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, MessageCircle, Search, Shield, Sparkles, ArrowRight, Sun, Moon } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";
import { useTheme } from "next-themes";

const features = [
  {
    icon: Search,
    title: "Smart Matching",
    desc: "Compare the details that matter and see who fits your routine",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    desc: "Message matches and campus groups without leaving the app",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    desc: "Student email verification helps keep the community genuine",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Join campus groups, find study buddies, and meet people nearby",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">College Zone</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-1 relative flex items-center justify-center"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            </Button>
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium text-muted-foreground mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              Find a roommate who fits your life
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your College Life,{" "}
              <span className="text-gradient">Better Together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Find roommates, join campus groups, and keep everything in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/signup")}>
                Join College Zone <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate("/login")}>
                I have an account
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-background"
                  />
                ))}
              </div>
              <span>
                <strong className="text-foreground">2,500+</strong> students already matched
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-hero rounded-3xl opacity-10 blur-3xl scale-110" />
            <img
              src={heroImage}
              alt="College students socializing"
              className="relative z-10 w-full rounded-3xl"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Why College Zone?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to find the right roommate and build your college network.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto bg-gradient-hero rounded-3xl p-12 lg:p-16 text-center"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to find your next roommate?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Set up your profile and start talking to students who match your routine.
          </p>
          <Button variant="hero-outline" size="xl" onClick={() => navigate("/signup")}>
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">College Zone</span>
          </div>
          <span>© 2026 College Zone. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
