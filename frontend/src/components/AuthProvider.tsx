"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("http://localhost:8000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          clearUser();
          return;
        }

        const user = await response.json();

        setUser(user);
      } catch (error) {
        console.error("Failed to load user:", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
}
