import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ restore session on reload
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setUser({ loggedIn: true });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);

      console.log("LOGIN DATA:", data);

      if (!data.accessToken) {
        throw new Error("Token missing");
      }

      localStorage.setItem("accessToken", data.accessToken);

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      setUser({ loggedIn: true });

    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {}

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!localStorage.getItem("accessToken"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ THIS WAS MISSING / BROKEN BEFORE
export const useAuth = () => useContext(AuthContext);