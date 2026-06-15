import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Smile, Check, CheckCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

type Msg = {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  isRead: boolean;
  imageUrl?: string;
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
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

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

  // Mark incoming messages as read
  const markAsRead = useCallback(async () => {
    if (!receiverId) return;
    try {
      await api.put(`/api/messages/read/${receiverId}`);
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  }, [receiverId]);

  // Load messages & setup socket listeners
  useEffect(() => {
    if (!user || !receiverId) return;
    
    const load = async () => {
      try {
        const data = await api.get(`/api/messages/${receiverId}`);
        setMessages(data);
        // Mark messages as read upon opening chat
        await markAsRead();
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
    load();

    const socket = getSocket();
    if (socket) {
      // Setup message listeners
      socket.on("receive_message", (msg: Msg) => {
        if (
          (msg.sender === user._id && msg.receiver === receiverId) ||
          (msg.sender === receiverId && msg.receiver === user._id)
        ) {
          setMessages(prev => [...prev, msg]);
          if (msg.sender === receiverId) {
            markAsRead();
          }
        }
      });

      // Setup typing listeners
      socket.on("typing", (data: { senderId: string }) => {
        if (data.senderId === receiverId) {
          setIsOtherTyping(true);
        }
      });

      socket.on("stop_typing", (data: { senderId: string }) => {
        if (data.senderId === receiverId) {
          setIsOtherTyping(false);
        }
      });

      // Setup read receipt listener
      socket.on("messages_read", (data: { readerId: string }) => {
        if (data.readerId === receiverId) {
          setMessages(prev =>
            prev.map(m => (m.sender === user._id ? { ...m, isRead: true } : m))
          );
        }
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("receive_message");
        socket.off("typing");
        socket.off("stop_typing");
        socket.off("messages_read");
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [user, receiverId, markAsRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const send = async () => {
    if (!input.trim() || !user || !receiverId) return;
    const content = input.trim();
    setInput("");
    
    // Stop typing indicator on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const socket = getSocket();
    if (socket && isTypingRef.current) {
      socket.emit("stop_typing", { senderId: user._id, receiverId });
      isTypingRef.current = false;
    }

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

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!user || !receiverId) return;
    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { senderId: user._id, receiverId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { senderId: user._id, receiverId });
      isTypingRef.current = false;
    }, 2500);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !receiverId) return;

    const formData = new FormData();
    formData.append("image", file);
    setIsUploading(true);

    try {
      const data = await api.post("/api/messages/upload", formData);
      if (data?.imageUrl) {
        const newMsg = await api.post("/api/messages", {
          receiverId,
          content: "Sent an image",
          imageUrl: data.imageUrl,
        });
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            {isOtherTyping ? (
              <p className="text-xs text-primary font-medium animate-pulse">typing...</p>
            ) : (
              <p className="text-xs text-success font-medium">Online</p>
            )}
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
              {m.imageUrl && (
                <div className="relative rounded-lg overflow-hidden mb-2 max-w-sm border border-border/10 bg-black/5">
                  <img
                    src={m.imageUrl}
                    alt="Attachment"
                    className="max-h-60 w-full object-cover transition-transform hover:scale-105 duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              {(!m.imageUrl || m.content !== "Sent an image") && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
              )}
              <div className={`flex items-center gap-1 mt-1 ${m.sender === user?._id ? "justify-end" : ""}`}>
                <span className={`text-[10px] ${m.sender === user?._id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{formatTime(m.createdAt)}</span>
                {m.sender === user?._id && (
                  m.isRead ? <CheckCheck className="w-3 h-3 text-primary-foreground/60" /> : <Check className="w-3 h-3 text-primary-foreground/60" />
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isOtherTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-card shadow-card text-card-foreground rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">{otherName} is typing</span>
              <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-card/90 backdrop-blur-md border-t border-border p-4">
        <div className="container mx-auto flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleImageClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={input}
            onChange={e => handleInputChange(e.target.value)}
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

