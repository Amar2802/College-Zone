import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";
import { initiateSocketConnection, disconnectSocket } from "@/utils/socket";
const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  updateUser: () => {}
});
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(null);
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
      // Only clear auth state if the token we checked is still the active one.
      // This avoids a stale startup request wiping out a fresh login.
      if (localStorage.getItem("token") === token) {
        localStorage.removeItem("token");
        setUser(null);
      }
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
  const signIn = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    initiateSocketConnection(userData._id);
  };
  const signUp = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    initiateSocketConnection(userData._id);
  };
  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    disconnectSocket();
  };
  const updateUser = updatedUser => {
    setUser(updatedUser);
  };
  return <AuthContext.Provider value={{
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser
  }}>
      {children}
    </AuthContext.Provider>;
};
