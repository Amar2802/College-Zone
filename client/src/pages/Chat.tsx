import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Smile, Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

type Msg = {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  isRead: boolean;
  createdAt: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("to") || "";
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [otherName, setOtherName] = useState("Chat");
  const [otherInitials, setOtherInitials] = useState("??");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  // Load other user's name
  useEffect(() => {
    if (!receiverId) return;
    api.get(`/api/users/${receiverId}`).then((data) => {
      if (data?.name) {
        setOtherName(data.name);
        setOtherInitials(data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2));
      }
    }).catch((err) => {
      console.error("Failed to load other user details:", err);
    });
  }, [receiverId]);

  // Load messages
  useEffect(() => {
    if (!user || !receiverId) return;
    const load = async () => {
      try {
        const data = await api.get(`/api/messages/${receiverId}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
    load();

    const socket = getSocket();
    if (socket) {
      socket.on("receive_message", (msg: Msg) => {
        if (
          (msg.sender === user._id && msg.receiver === receiverId) ||
          (msg.sender === receiverId && msg.receiver === user._id)
        ) {
          setMessages(prev => [...prev, msg]);
        }
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("receive_message");
      }
    };
  }, [user, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !user || !receiverId) return;
    const content = input.trim();
    setInput("");
    try {
      const newMsg = await api.post("/api/messages", {
        receiverId,
        content,
      });
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center gap-3 h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
            {otherInitials}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold">{otherName}</h2>
            <p className="text-xs text-success font-medium">Online</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={m._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className={`flex ${m.sender === user?._id ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.sender === user?._id ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card shadow-card text-card-foreground rounded-bl-md"}`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
              <div className={`flex items-center gap-1 mt-1 ${m.sender === user?._id ? "justify-end" : ""}`}>
                <span className={`text-[10px] ${m.sender === user?._id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{formatTime(m.createdAt)}</span>
                {m.sender === user?._id && (
                  m.isRead ? <CheckCheck className="w-3 h-3 text-primary-foreground/60" /> : <Check className="w-3 h-3 text-primary-foreground/60" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-card/90 backdrop-blur-md border-t border-border p-4">
        <div className="container mx-auto flex items-center gap-2">
          <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <Button variant="hero" size="icon" onClick={send} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
