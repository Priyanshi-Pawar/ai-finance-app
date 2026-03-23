import { createContext, useContext, useState } from "react";
import { loginUser, logoutUser } from "../api/authApi";
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  clearTokens,
} from "../utils/tokenManager";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const data = await loginUser(email, password);

      console.log("LOGIN DATA:", data);

      // ✅ Store token correctly
      setAccessToken(data.accessToken);

      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }

      // ✅ Mark user authenticated
      setUser({ authenticated: true });

    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {}

    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        // ✅ Use token instead of user state
        isAuthenticated: !!getAccessToken(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);