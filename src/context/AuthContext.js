import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const decodeToken = (token) => {
    try {
      if (!token || typeof token !== "string" || !token.includes(".")) return null;
      return JSON.parse(atob(token.split(".")[1]));
    } catch { return null; }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const payload = decodeToken(token);
    if (!payload) {
      localStorage.removeItem("token");
      setUser(null);
    } else if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      setUser(null);
    } else {
      setUser(payload);
    }
    setAuthLoading(false);
  }, []);

  const login = (token) => {
    if (!token || typeof token !== "string") return;
    localStorage.setItem("token", token);
    const payload = decodeToken(token);
    if (payload) setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);