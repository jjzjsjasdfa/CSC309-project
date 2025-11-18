import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    userId: null,
    role: null,
    token: null,
  });

  function login({ userId, role, token }) {
    setAuth({ userId, role, token });
    localStorage.setItem("auth", JSON.stringify({ userId, role, token }));
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
