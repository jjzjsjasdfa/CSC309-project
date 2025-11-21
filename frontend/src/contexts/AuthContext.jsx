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

  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  function storeCurrentUser(user) {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  }

  function removeTokenAndUser() {
    setToken(null);
    setCurrentUser({});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ token, storeToken, currentUser, storeCurrentUser, removeTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
