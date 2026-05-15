import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const TOKEN_KEY = "admin_auth_token";

function setAuthHeader(token) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthHeader(token);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetchCurrentUser();
  }, [token]);

  async function fetchCurrentUser() {
    try {
      const { data } = await axios.get("/api/auth/me");
      setUser(data.user ?? null);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAuthHeader("");
      setToken("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const { data } = await axios.post("/api/auth/login", credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthHeader(data.token);
    setToken(data.token);
    setUser(data.user ?? null);
    return data;
  }

  async function logout() {
    try {
      if (token) {
        await axios.post("/api/auth/logout");
      }
    } catch {
      // no-op
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAuthHeader("");
      setToken("");
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
