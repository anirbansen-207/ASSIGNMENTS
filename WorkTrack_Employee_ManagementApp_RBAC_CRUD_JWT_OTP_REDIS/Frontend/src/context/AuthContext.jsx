
import { useEffect, useState } from "react";

import axiosInstance from "../api/axios";
import { logoutApi } from "../api/logoutApi";
import AuthContext from "./AuthContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/auth/profile",
        );

        setUser(response.data.user);
      } catch (error) {
        console.log(
          error.response?.data?.message || error.message,
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
    } catch (error) {
      console.log(
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
