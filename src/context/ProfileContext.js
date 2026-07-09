// src/Context/ProfileContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProfileContext = createContext();

const generateStylishUsername = () => {
  const prefixes = [
    'Shadow','Nova','Vortex','Zynko','Cyber','Phantom','Neon','Echo',
    'Blaze','Frost','Raven','Hawk','Stealth','Quantum','Cipher',
    'Nexus','Apex','Ignite','Void','Crimson',
  ];
  const suffixes = ['4832','9281','5531','4412','7742','3367','8912','2345','6789','1234'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

const safeJSONParse = (item) => {
  if (!item || item === 'undefined' || item === 'null') return null;
  try { return JSON.parse(item); } catch { return null; }
};

// JWT payload se user info nikalo — teri pv_* keys handle karta hai
const extractUserFromPayload = (payload) => {
  if (!payload) return {};
  return {
    id:    payload.user_id || payload.id || payload.sub || Date.now().toString(),
    name:  payload.pv_un   || payload.name  || payload.username || null,
    email: payload.email   || payload.pv_email || '',
    picture: payload.picture || payload.avatar || null,
    provider: payload.provider || (payload.google_id ? 'google' : 'email'),
  };
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile]               = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // ─── Core save helper ─────────────────────────────────────────────────
  const saveToStorage = (data) => {
    localStorage.setItem('userProfile', JSON.stringify(data));
  };

  // ─── updateProfile — local state + localStorage dono update ──────────
  const updateProfile = useCallback((updates) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates, lastSeen: new Date().toISOString() };
      saveToStorage(updated);   // turant localStorage mein save
      return updated;           // turant React state update
    });
  }, []);

  const updateStatus = useCallback((status) => updateProfile({ status }), [updateProfile]);

  const addGameToHistory = useCallback((gameId) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const favorites = prev.favoriteGames || [];
      if (favorites.includes(gameId)) return prev;
      const updated = {
        ...prev,
        favoriteGames: [...favorites, gameId],
        gamesPlayed:   (prev.gamesPlayed || 0) + 1,
        lastSeen:      new Date().toISOString(),
      };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem('userProfile');
  }, []);

  // ─── loadProfile — JWT payload leke profile banao/load karo ──────────
  const loadProfile = useCallback((jwtPayload) => {
    setIsProfileLoading(true);

    // JWT se real user info nikalo (pv_un, user_id, etc.)
    const userData = extractUserFromPayload(jwtPayload);

    // localStorage mein pehle se saved profile check karo
    const raw = localStorage.getItem('userProfile');
    if (raw === 'undefined' || raw === 'null') localStorage.removeItem('userProfile');
    const saved = safeJSONParse(localStorage.getItem('userProfile'));

    if (saved && saved.stylishUsername) {
      // Profile exist karti hai — SIRF missing fields add karo, kuch overwrite mat karo
      const patched = {
        ...saved,                                    // sab saved values as-is rakho
        status:   saved.status   || 'online',        // missing ho toh default
        lastSeen: new Date().toISOString(),
        // Agar JWT mein name mila aur profile mein username default hai toh update karo
        stylishUsername: saved.stylishUsername,      // hamesha saved value rakho
        avatarShape: saved.avatarShape || 'heart',
        avatarEyes:  saved.avatarEyes  || 'round',
        avatarColor: saved.avatarColor || '#c084fc',
        avatarType:  saved.avatarType  || 'custom',
        loginMethod: saved.loginMethod || 'email',
      };
      saveToStorage(patched);
      setProfile(patched);
    } else {
      // Naya profile banao
      const now = new Date().toISOString();
      const stylishUsername = userData.name || generateStylishUsername();
      const hasGoogleAvatar = userData.picture && userData.provider === 'google';

      const newProfile = {
        id:              userData.id,
        username:        stylishUsername,
        stylishUsername: stylishUsername,
        email:           userData.email,
        avatarUrl:       hasGoogleAvatar ? userData.picture : null,
        avatarType:      hasGoogleAvatar ? 'google' : 'custom',
        avatarShape:     'heart',
        avatarEyes:      'round',
        avatarColor:     '#c084fc',
        loginMethod:     userData.provider || 'email',
        createdAt:       now,
        joinDate:        now,
        status:          'online',
        lastSeen:        now,
        gamesPlayed:     0,
        favoriteGames:   [],
      };
      saveToStorage(newProfile);
      setProfile(newProfile);
    }

    setIsProfileLoading(false);
  }, []);

  // ─── Bootstrap: token se profile load karo ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsProfileLoading(false);
      return;
    }

    // JWT decode karo
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Token expire check
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setIsProfileLoading(false);
        return;
      }
      loadProfile(payload);
    } catch {
      // Token corrupt — savedProfile se hi load karo
      const saved = safeJSONParse(localStorage.getItem('userProfile'));
      if (saved) {
        setProfile(saved);
      }
      setIsProfileLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ProfileContext.Provider value={{
      profile,
      isProfileLoading,
      loadProfile,
      updateProfile,
      updateStatus,
      addGameToHistory,
      clearProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};