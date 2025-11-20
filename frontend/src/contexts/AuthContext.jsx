import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
      }
    }
    return { userId: null, role: null, token: null };
  });

  function login(data) {
    setAuth((prev) => {
      const newAuth = { ...prev, ...data };
      localStorage.setItem("auth", JSON.stringify(newAuth));
      return newAuth;
    });
  }

  function logout() {
    setAuth({ userId: null, role: null, token: null });
    localStorage.removeItem("auth");
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
