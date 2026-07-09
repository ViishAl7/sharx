// src/app/providers.js
"use client";

import { AuthProvider } from "../Context/AuthContext";
import { ProfileProvider } from "../Context/ProfileContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </AuthProvider>
  );
}