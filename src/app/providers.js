"use client";

import { AuthProvider } from "../context/AuthContext";
import { CommunityAuthProvider } from "../context/CommunityAuthContext";
import { ProfileProvider } from "../context/ProfileContext";
import { RewardProvider } from "../context/RewardContext";
import RewardExperience from "../legacy/RewardExperience";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CommunityAuthProvider>
        <ProfileProvider>
          <RewardProvider>
            {children}
            <RewardExperience />
          </RewardProvider>
        </ProfileProvider>
      </CommunityAuthProvider>
    </AuthProvider>
  );
}
