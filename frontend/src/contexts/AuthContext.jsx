import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? storedToken : null;
  });

  function storeToken(token) {
    setToken(token);
    localStorage.setItem("token", token);
  }

  const [userIdAndRole, setUserIdAndRole] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : { userId: null, role: null };
  });

  function storeUserIdAndRole({ id, role }) {
    setUserIdAndRole({ id, role });
    localStorage.setItem("user", JSON.stringify({ id, role }));
  }

  function removeTokenAndUser() {
    setToken(null);
    setUserIdAndRole({ userId: null, role: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ token, storeToken, userIdAndRole, storeUserIdAndRole, removeTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
