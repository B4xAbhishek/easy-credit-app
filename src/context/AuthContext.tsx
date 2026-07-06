import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { mobileFetch } from '../api/client';
import { loadPersistedSession, persistSession } from '../api/session';
import type { AuthContextValue, MobileAuthResponse, SessionState } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applySession = useCallback(async (response: MobileAuthResponse) => {
    const nextSession: SessionState = {
      token: response.token,
      expiresAt: response.expiresAt,
      user: response.user,
    };

    setSession(nextSession);
    await persistSession(nextSession);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const storedSession = await loadPersistedSession();
      setSession(storedSession);
      setIsBootstrapping(false);
    }
    bootstrap();
  }, []);

  const signInWithFirebaseToken = useCallback(
    async (phoneE164: string, idToken: string) => {
      const response = await mobileFetch<MobileAuthResponse>(
        '/api/mobile/auth/session',
        {
          method: 'POST',
          body: {
            provider: 'firebase',
            assertedPhoneE164: phoneE164,
            idToken,
          },
        },
      );

      await applySession(response);
    },
    [applySession],
  );

  const signInWithFallbackCode = useCallback(
    async (phoneE164: string, code: string) => {
      const response = await mobileFetch<MobileAuthResponse>(
        '/api/mobile/auth/session',
        {
          method: 'POST',
          body: { provider: 'fallback_code', phoneE164, code },
        },
      );

      await applySession(response);
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    if (session?.token) {
      try {
        await mobileFetch('/api/mobile/auth/logout', {
          method: 'POST',
          token: session.token,
        });
      } catch {
        // local cleanup still signs the user out
      }
    }
    setSession(null);
    await persistSession(null);
  }, [session?.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isBootstrapping,
      signInWithFirebaseToken,
      signInWithFallbackCode,
      signOut,
    }),
    [isBootstrapping, session, signInWithFirebaseToken, signInWithFallbackCode, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
