import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("gradlink_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem("gradlink_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem("gradlink_user", JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem("gradlink_token");
        localStorage.removeItem("gradlink_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { token, user } = await authService.login(credentials);
    localStorage.setItem("gradlink_token", token);
    localStorage.setItem("gradlink_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { token, user } = await authService.register(payload);
    localStorage.setItem("gradlink_token", token);
    localStorage.setItem("gradlink_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("gradlink_token");
      localStorage.removeItem("gradlink_user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
