// src/context/ProfileContext.js
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const ProfileContext = createContext(null);

/* ─── Username generator ─── */
const USERNAME_PREFIXES = [
  "Shadow", "Nova", "Vortex", "Zynko", "Cyber",
  "Phantom", "Neon", "Echo", "Blaze", "Frost",
  "Raven", "Hawk", "Stealth", "Quantum", "Cipher",
  "Nexus", "Apex", "Ignite", "Void", "Crimson",
];
const USERNAME_SUFFIXES = [
  "4832", "9281", "5531", "4412", "7742",
  "3367", "8912", "2345", "6789", "1234",
];

const generateStylishUsername = () => {
  const p = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];
  const s = USERNAME_SUFFIXES[Math.floor(Math.random() * USERNAME_SUFFIXES.length)];
  return `${p}${s}`;
};

/* ─── Safe JSON parse ─── */
const safeJSONParse = (item) => {
  if (!item || item === "undefined" || item === "null") return null;
  try {
    const parsed = JSON.parse(item);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

/* ─── Safe localStorage read/write ─── */
const readStorage = (key) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key, value) => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
const removeStorage = (key) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
};

/* ─── Safe JWT payload decode (UTF-8 aware) ─── */
const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const binary = atob(padded);
    const json = decodeURIComponent(
      Array.prototype.map
        .call(binary, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
};

/* ─── Extract user info from JWT payload ─── */
const extractUserFromPayload = (payload) => {
  if (!payload || typeof payload !== "object") return {};
  return {
    id:
      payload.user_id ||
      payload.id ||
      payload.sub ||
      Date.now().toString(),
    name:
      payload.pv_un ||
      payload.name ||
      payload.username ||
      null,
    email: payload.email || payload.pv_email || "",
    picture: payload.picture || payload.avatar || null,
    provider:
      payload.provider ||
      (payload.google_id ? "google" : "email"),
  };
};

const PROFILE_KEY = "userProfile";

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  /* ─── Save helper ─── */
  const saveToStorage = useCallback((data) => {
    writeStorage(PROFILE_KEY, JSON.stringify(data));
  }, []);

  /* ─── updateProfile ─── */
  const updateProfile = useCallback((updates) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        ...updates,
        lastSeen: new Date().toISOString(),
      };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const updateStatus = useCallback(
    (status) => updateProfile({ status }),
    [updateProfile]
  );

  /* ─── addGameToHistory ─── */
  const addGameToHistory = useCallback((gameId) => {
    if (!gameId) return;
    setProfile((prev) => {
      if (!prev) return prev;
      const favorites = Array.isArray(prev.favoriteGames)
        ? prev.favoriteGames
        : [];
      const alreadySaved = favorites.includes(gameId);
      const updated = {
        ...prev,
        favoriteGames: alreadySaved
          ? favorites
          : [...favorites, gameId],
        gamesPlayed: (prev.gamesPlayed || 0) + (alreadySaved ? 0 : 1),
        lastSeen: new Date().toISOString(),
      };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  /* ─── clearProfile ─── */
  const clearProfile = useCallback(() => {
    setProfile(null);
    removeStorage(PROFILE_KEY);
  }, []);

  /* ─── loadProfile: build or load profile from JWT payload ─── */
  const loadProfile = useCallback((jwtPayload) => {
    setIsProfileLoading(true);

    const userData = extractUserFromPayload(jwtPayload);

    // Cleanup corrupted storage
    const raw = readStorage(PROFILE_KEY);
    if (raw === "undefined" || raw === "null") {
      removeStorage(PROFILE_KEY);
    }

    const saved = safeJSONParse(readStorage(PROFILE_KEY));

    if (saved && saved.stylishUsername) {
      // Existing profile → only fill missing fields, never overwrite
      const patched = {
        ...saved,
        status: saved.status || "online",
        lastSeen: new Date().toISOString(),
        avatarShape: saved.avatarShape || "heart",
        avatarEyes: saved.avatarEyes || "round",
        avatarColor: saved.avatarColor || "#c084fc",
        avatarType: saved.avatarType || "custom",
        loginMethod: saved.loginMethod || "email",
      };
      saveToStorage(patched);
      setProfile(patched);
    } else {
      // New profile
      const now = new Date().toISOString();
      const stylishUsername =
        userData.name || generateStylishUsername();
      const hasGoogleAvatar =
        userData.picture && userData.provider === "google";

      const newProfile = {
        id: userData.id,
        username: stylishUsername,
        stylishUsername,
        email: userData.email,
        avatarUrl: hasGoogleAvatar ? userData.picture : null,
        avatarType: hasGoogleAvatar ? "google" : "custom",
        avatarShape: "heart",
        avatarEyes: "round",
        avatarColor: "#c084fc",
        loginMethod: userData.provider || "email",
        createdAt: now,
        joinDate: now,
        status: "online",
        lastSeen: now,
        gamesPlayed: 0,
        favoriteGames: [],
      };
      saveToStorage(newProfile);
      setProfile(newProfile);
    }

    setIsProfileLoading(false);
  }, [saveToStorage]);

  /* ─── Bootstrap: load from token on mount ─── */
  useEffect(() => {
    const token = readStorage("token");

    if (!token) {
      setIsProfileLoading(false);
      return;
    }

    const payload = decodeJwtPayload(token);

    // Expired → clear
    if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
      removeStorage("token");
      setIsProfileLoading(false);
      return;
    }

    if (payload) {
      loadProfile(payload);
    } else {
      // Corrupt token → fall back to saved profile
      const saved = safeJSONParse(readStorage(PROFILE_KEY));
      if (saved) setProfile(saved);
      setIsProfileLoading(false);
    }
  }, [loadProfile]);

  /* ─── Cross-tab sync ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (e) => {
      if (e.key !== PROFILE_KEY) return;
      const next = safeJSONParse(e.newValue);
      if (next) {
        setProfile(next);
      } else if (e.newValue === null) {
        // cleared in another tab
        setProfile(null);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ─── Memoized context value ─── */
  const value = useMemo(
    () => ({
      profile,
      isProfileLoading,
      loadProfile,
      updateProfile,
      updateStatus,
      addGameToHistory,
      clearProfile,
    }),
    [
      profile,
      isProfileLoading,
      loadProfile,
      updateProfile,
      updateStatus,
      addGameToHistory,
      clearProfile,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
};

export default ProfileContext;