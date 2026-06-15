import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/services/api";
import { initiateSocketConnection, disconnectSocket } from "@/utils/socket";

export type UserProfile = {
  college?: string;
  course?: string;
  year?: string;
  sleep_schedule?: string;
  cleanliness?: string;
  study_habits?: string;
  smoking_drinking?: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  googleId?: string;
  profile?: UserProfile;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signUp: (token: string, user: AuthUser) => void;
  signOut: () => void;
  updateUser: (updatedUser: AuthUser) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const userData = await api.get("/api/users/me");
      setUser(userData);
      initiateSocketConnection(userData._id);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    return () => {
      disconnectSocket();
    };
  }, []);

  const signIn = (token: string, userData: AuthUser) => {
    localStorage.setItem("token", token);
    setUser(userData);
    initiateSocketConnection(userData._id);
  };

  const signUp = (token: string, userData: AuthUser) => {
    localStorage.setItem("token", token);
    setUser(userData);
    initiateSocketConnection(userData._id);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
