import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageCircle, Users, User, Search, Bell, Heart, X, LogOut, Sun, Moon, BookOpen, Calendar, MapPin, Clock, Plus, Check, Award, Info, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useTheme } from "next-themes";
const prefFields = ["sleep_schedule", "cleanliness", "study_habits", "smoking_drinking"];
function calcMatch(me, other) {
  let score = 0;
  let total = 0;
  
  // Core matching fields
  const fields = [
    "sleep_schedule",
    "cleanliness",
    "study_habits",
    "smoking_drinking",
    "budgetRange",
    "preferredLocation",
    "guestPolicy",
    "petsPreference"
  ];
  
  for (const f of fields) {
    if (me[f] && other[f]) {
      total++;
      if (me[f].toString().toLowerCase() === other[f].toString().toLowerCase()) {
        score++;
      }
    }
  }
  
  // College compatibility carries higher weight
  if (me.college && other.college) {
    total += 2;
    if (me.college.toLowerCase() === other.college.toLowerCase()) {
      score += 2;
    }
  }
  
  return total > 0 ? Math.round((score / total) * 100) : 50;
}
function calcStudyMatch(me, other) {
  let score = 30; // base score
  if (me.course && other.course && me.course.trim().toLowerCase() === other.course.trim().toLowerCase()) {
    score += 40;
  }
  if (me.year && other.year && me.year === other.year) {
    score += 15;
  }
  if (me.study_habits && other.study_habits && me.study_habits === other.study_habits) {
    score += 15;
  }
  return score;
}
function getTraits(p) {
  return [p.sleep_schedule, p.cleanliness, p.study_habits].filter(Boolean);
}
function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";
}
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    signOut,
    loading: authLoading
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
  const [tab, setTab] = useState("matches");
  const [search, setSearch] = useState("");

  // Data States
  const [myProfile, setMyProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [studyBuddies, setStudyBuddies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Event Posting Modal States
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventError, setEventError] = useState("");
  const [submittingEvent, setSubmittingEvent] = useState(false);
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (!user.profileCompleted) {
        navigate("/profile-setup");
      }
    }
  }, [user, authLoading, navigate]);
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoadingData(true);

        // 1. Fetch Roommate Profiles
        const allUsers = await api.get("/api/users");
        const mappedProfiles = allUsers.map(u => ({
          id: u._id,
          user_id: u._id,
          full_name: u.name,
          college: u.profile?.college || "",
          course: u.profile?.course || "",
          year: u.profile?.year || "",
          sleep_schedule: u.preferences?.sleepSchedule || u.profile?.sleep_schedule || null,
          cleanliness: u.preferences?.cleanlinessLevel || u.profile?.cleanliness || null,
          study_habits: u.preferences?.studyHabits || u.profile?.study_habits || null,
          smoking_drinking: u.preferences?.smokingPreference ? `${u.preferences.smokingPreference}/${u.preferences.drinkingPreference || "Neither"}` : u.profile?.smoking_drinking || null,
          budgetRange: u.preferences?.budgetRange || null,
          preferredLocation: u.preferences?.preferredLocation || null,
          guestPolicy: u.preferences?.guestPolicy || null,
          petsPreference: u.preferences?.petsPreference || null
        }));
        const meProfile = {
          id: user._id,
          user_id: user._id,
          full_name: user.name,
          college: user.profile?.college || "",
          course: user.profile?.course || "",
          year: user.profile?.year || "",
          sleep_schedule: user.preferences?.sleepSchedule || user.profile?.sleep_schedule || null,
          cleanliness: user.preferences?.cleanlinessLevel || user.profile?.cleanliness || null,
          study_habits: user.preferences?.studyHabits || user.profile?.study_habits || null,
          smoking_drinking: user.preferences?.smokingPreference ? `${user.preferences.smokingPreference}/${user.preferences.drinkingPreference || "Neither"}` : user.profile?.smoking_drinking || null,
          budgetRange: user.preferences?.budgetRange || null,
          preferredLocation: user.preferences?.preferredLocation || null,
          guestPolicy: user.preferences?.guestPolicy || null,
          petsPreference: user.preferences?.petsPreference || null
        };
        setMyProfile(meProfile);
        setProfiles(mappedProfiles);

        // 2. Fetch Study Buddies (if college is set)
        if (user.profile?.college) {
          try {
            const buddies = await api.get("/api/users/study-buddies");
            const mappedBuddies = buddies.map(u => ({
              id: u._id,
              user_id: u._id,
              full_name: u.name,
              college: u.profile?.college || "",
              course: u.profile?.course || "",
              year: u.profile?.year || "",
              sleep_schedule: u.profile?.sleep_schedule || null,
              cleanliness: u.profile?.cleanliness || null,
              study_habits: u.profile?.study_habits || null,
              smoking_drinking: u.profile?.smoking_drinking || null
            }));
            setStudyBuddies(mappedBuddies);
          } catch (err) {
            console.error("Failed to load study buddies:", err);
          }

          // 3. Fetch Campus Events
          try {
            const evts = await api.get("/api/events");
            setEvents(evts);
          } catch (err) {
            console.error("Failed to load events:", err);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [user]);
  const handleRSVP = async eventId => {
    try {
      const updatedEvent = await api.put(`/api/events/${eventId}/rsvp`);
      setEvents(prev => prev.map(e => e._id === eventId ? updatedEvent : e));
    } catch (err) {
      console.error("Failed to toggle RSVP:", err);
    }
  };
  const handleCreateEvent = async e => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDesc.trim() || !eventDate || !eventLocation.trim()) {
      setEventError("Please fill in all fields");
      return;
    }
    setSubmittingEvent(true);
    setEventError("");
    try {
      const newEvent = await api.post("/api/events", {
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        date: eventDate,
        location: eventLocation.trim()
      });
      // Append local organizer data
      const eventWithOrganizer = {
        ...newEvent,
        organizer: {
          _id: user?._id,
          name: user?.name
        }
      };
      setEvents(prev => [eventWithOrganizer, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setShowCreateEventModal(false);
      // Reset form fields
      setEventTitle("");
      setEventDesc("");
      setEventDate("");
      setEventLocation("");
    } catch (err) {
      setEventError(err.message || "Failed to create event");
    } finally {
      setSubmittingEvent(false);
    }
  };
  if (authLoading || loadingData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary animate-pulse" />
      </div>;
  }

  // Roommate Filtering
  const roommateMatches = profiles.map(p => ({
    ...p,
    match: myProfile ? calcMatch(myProfile, p) : 50,
    traits: getTraits(p),
    initials: getInitials(p.full_name)
  })).sort((a, b) => b.match - a.match);
  const filteredRoommates = roommateMatches.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()) || m.course.toLowerCase().includes(search.toLowerCase()));

  // Study Buddies Filtering
  const studyBuddyMatches = studyBuddies.map(p => ({
    ...p,
    match: myProfile ? calcStudyMatch(myProfile, p) : 50,
    traits: getTraits(p),
    initials: getInitials(p.full_name)
  })).sort((a, b) => b.match - a.match);
  const filteredStudyBuddies = studyBuddyMatches.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()) || m.course.toLowerCase().includes(search.toLowerCase()));
  const getMatchColor = score => {
    if (score >= 80) return "text-success";
    if (score >= 65) return "text-warning";
    return "text-muted-foreground";
  };
  const getMatchBg = score => {
    if (score >= 80) return "bg-success/10";
    if (score >= 65) return "bg-warning/10";
    return "bg-muted";
  };
  return <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">College Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="mr-1 relative flex items-center justify-center">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {
            signOut();
            navigate("/");
          }}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* ROOMMATES MATCH TAB */}
        {tab === "matches" && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold">Roommate Matcher</h1>
                <p className="text-muted-foreground text-sm">{filteredRoommates.length} student{filteredRoommates.length !== 1 ? "s" : ""} found</p>
              </div>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search roommates..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {filteredRoommates.length === 0 ? <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">No roommates found</h3>
                <p className="text-muted-foreground">Adjust your search or check back soon!</p>
              </div> : <div className="space-y-4">
                {filteredRoommates.map((m, i) => <motion.div key={m.id} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: i * 0.05
          }} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer" onClick={() => navigate(`/chat?to=${m.user_id}`)}>
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
                          {m.traits.map(t => <span key={t} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{t}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button variant="hero" size="sm" className="flex-1" onClick={e => {
                e.stopPropagation();
                navigate(`/chat?to=${m.user_id}`);
              }}>
                        <MessageCircle className="w-4 h-4 mr-1" /> Message
                      </Button>
                      <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={e => e.stopPropagation()}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>)}
              </div>}
          </motion.div>}

        {/* STUDY BUDDIES TAB */}
        {tab === "study-buddies" && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold">Study Buddy Finder</h1>
                <p className="text-muted-foreground text-sm">Classmates at {myProfile?.college || "your college"}</p>
              </div>
            </div>
            {!myProfile?.college ? <div className="bg-card rounded-2xl p-6 shadow-card text-center py-12 border border-dashed border-border">
                <Info className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">College Details Missing</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Please complete your profile to set your college name so we can find study partners on your campus.
                </p>
                <Button variant="hero" onClick={() => navigate("/profile-setup")}>
                  Update Profile
                </Button>
              </div> : <>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by name or course..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {filteredStudyBuddies.length === 0 ? <div className="text-center py-16">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display font-bold text-lg mb-2">No study buddies found</h3>
                    <p className="text-muted-foreground">Adjust your search criteria or check back later!</p>
                  </div> : <div className="space-y-4">
                    {filteredStudyBuddies.map((m, i) => <motion.div key={m.id} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: i * 0.05
            }} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer" onClick={() => navigate(`/chat?to=${m.user_id}`)}>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                            {m.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-display font-bold text-lg">{m.full_name || "Student"}</h3>
                              <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${getMatchBg(m.match)} ${getMatchColor(m.match)}`}>
                                <Award className="w-3.5 h-3.5" />
                                {m.match}% Match
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">
                              <span className="font-semibold text-foreground">{m.course}</span> • Year {m.year}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {m.traits.map(t => <span key={t} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{t}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <Button variant="hero" size="sm" className="flex-1" onClick={e => {
                  e.stopPropagation();
                  navigate(`/chat?to=${m.user_id}`);
                }}>
                            <MessageCircle className="w-4 h-4 mr-1" /> Send Message
                          </Button>
                          <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                            Connect
                          </Button>
                        </div>
                      </motion.div>)}
                  </div>}
              </>}
          </motion.div>}

        {/* CAMPUS EVENT BOARD TAB */}
        {tab === "events" && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold">Event Board</h1>
                <p className="text-muted-foreground text-sm">Events at {myProfile?.college || "your college"}</p>
              </div>
              {myProfile?.college && <Button variant="hero" size="sm" onClick={() => setShowCreateEventModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Post Event
                </Button>}
            </div>

            {!myProfile?.college ? <div className="bg-card rounded-2xl p-6 shadow-card text-center py-12 border border-dashed border-border">
                <Info className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">College Details Missing</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Please update your profile to include your college name so we can load events happening at your campus.
                </p>
                <Button variant="hero" onClick={() => navigate("/profile-setup")}>
                  Update Profile
                </Button>
              </div> : <>
                {events.length === 0 ? <div className="text-center py-16 bg-card rounded-2xl p-6 shadow-card border border-dashed border-border">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display font-bold text-lg mb-2">No campus events yet</h3>
                    <p className="text-muted-foreground mb-4">Post an event to start gathering classmates!</p>
                    <Button variant="hero" size="sm" onClick={() => setShowCreateEventModal(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Post Event
                    </Button>
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((e, idx) => {
              const isAttending = e.attendees.includes(user?._id);
              return <motion.div key={e._id} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: idx * 0.05
              }} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between border border-border/50">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                Campus Event
                              </span>
                              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                By {e.organizer?.name || "Student"}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">{e.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{e.description}</p>
                            
                            <div className="space-y-2 mb-4 text-xs text-muted-foreground font-medium">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{new Date(e.date).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{e.location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                            <span className="text-xs text-muted-foreground font-semibold">
                              {e.attendees.length} attendee{e.attendees.length !== 1 ? "s" : ""}
                            </span>
                            <Button variant={isAttending ? "secondary" : "outline"} size="sm" className={isAttending ? "bg-success/15 text-success hover:bg-success/20 border-transparent" : ""} onClick={() => handleRSVP(e._id)}>
                              {isAttending ? <span className="flex items-center gap-1 font-bold"><Check className="w-3.5 h-3.5" /> RSVP'd</span> : "Join Event"}
                            </Button>
                          </div>
                        </motion.div>;
            })}
                  </div>}
              </>}
          </motion.div>}

        {/* CHATS TAB */}
        {tab === "chats" && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <h1 className="font-display text-2xl font-bold mb-6">Chats</h1>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {filteredRoommates.length === 0 ? <div className="text-center py-16">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">No chats yet</h3>
                <p className="text-muted-foreground">Select a roommate or study buddy to start chatting!</p>
              </div> : <div className="space-y-2">
                {filteredRoommates.map(m => <div key={m.id} onClick={() => navigate(`/chat?to=${m.user_id}`)} className="flex items-center gap-4 p-4 rounded-2xl bg-card hover:bg-secondary/40 border border-border/50 transition-all duration-200 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-sm text-foreground">{m.full_name}</h4>
                        <span className="text-[10px] text-muted-foreground">Online</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{m.course || "Tap to chat"}</p>
                    </div>
                  </div>)}
              </div>}
          </motion.div>}

        {/* PROFILE TAB */}
        {tab === "profile" && myProfile && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto mb-4">
                {getInitials(myProfile.full_name)}
              </div>
              <h1 className="font-display text-2xl font-bold">{myProfile.full_name || "Your Name"}</h1>
              <p className="text-muted-foreground">{[myProfile.course, myProfile.year, myProfile.college].filter(Boolean).join(" • ") || "Preferences not set"}</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-display font-bold text-lg">My Preferences</h2>
              <div className="grid grid-cols-2 gap-3">
                {[{
              label: "Sleep",
              value: myProfile.sleep_schedule
            }, {
              label: "Cleanliness",
              value: myProfile.cleanliness
            }, {
              label: "Study Habits",
              value: myProfile.study_habits
            }, {
              label: "Social Life",
              value: myProfile.smoking_drinking
            }].map(p => <div key={p.label} className="bg-secondary rounded-xl p-3">
                    <span className="text-xs text-muted-foreground">{p.label}</span>
                    <p className="font-semibold text-sm">{p.value || "Not set"}</p>
                  </div>)}
              </div>
              <div className="space-y-2.5 pt-4 border-t border-border">
                <Button className="w-full bg-gradient-primary text-primary-foreground" onClick={() => navigate("/profile")}>
                  View Public Profile
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate("/edit-profile")} className="text-xs">
                    Edit Info
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/account-settings")} className="text-xs">
                    Account
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/privacy-settings")} className="text-xs">
                    Privacy
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>}
      </main>

      {/* CREATE CAMPUS EVENT MODAL */}
      {/* @ts-ignore */}
      <AnimatePresence>
        {showCreateEventModal && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.95
        }} className="bg-card w-full max-w-md rounded-2xl p-6 shadow-elevated border border-border relative overflow-hidden">
              <h2 className="font-display font-bold text-xl mb-2">Post a Campus Event</h2>
              <p className="text-xs text-muted-foreground mb-4">Host a study session, hobby group, or social meetup for your college mates.</p>
              
              {eventError && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg mb-4 font-medium">
                  {eventError}
                </div>}

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Event Title</label>
                  <Input placeholder="e.g. Midterm Prep & Coffee Study Session 📚" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
                  <textarea className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Provide details about the event, what to bring, etc." value={eventDesc} onChange={e => setEventDesc(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Date & Time</label>
                    <Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Location</label>
                    <Input placeholder="e.g. Central Library Study Room 302" value={eventLocation} onChange={e => setEventLocation(e.target.value)} required />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCreateEventModal(false)} disabled={submittingEvent}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1" disabled={submittingEvent}>
                    {submittingEvent ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Publish Event"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>}
      </AnimatePresence>

      <nav className="fixed bottom-0 w-full bg-card/90 backdrop-blur-md border-t border-border z-50">
        <div className="container mx-auto flex justify-around py-2">
          {[{
          key: "matches",
          icon: Users,
          label: "Roommates"
        }, {
          key: "study-buddies",
          icon: BookOpen,
          label: "Study Buddies"
        }, {
          key: "events",
          icon: Calendar,
          label: "Events"
        }, {
          key: "chats",
          icon: MessageCircle,
          label: "Chats"
        }, {
          key: "profile",
          icon: User,
          label: "Profile"
        }].map(item => <button key={item.key} onClick={() => item.key === "profile" ? navigate("/profile") : setTab(item.key)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${tab === item.key ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>)}
        </div>
      </nav>
    </div>;
};
export default Dashboard;