import CookieManager from '@react-native-cookies/cookies';
import { API_BASE_URL, MOBILE_SESSION_COOKIE } from '../constants';
import type { SessionState } from '../types';

export async function persistSession(session: SessionState | null): Promise<void> {
  if (session) {
    await CookieManager.set(API_BASE_URL, {
      name: MOBILE_SESSION_COOKIE,
      value: encodeURIComponent(JSON.stringify(session)),
      path: '/',
      secure: true,
      httpOnly: false,
      expires: new Date(session.expiresAt * 1000).toISOString(),
    });
    return;
  }
  await CookieManager.set(API_BASE_URL, {
    name: MOBILE_SESSION_COOKIE,
    value: '',
    path: '/',
    secure: true,
    httpOnly: false,
    expires: new Date(0).toISOString(),
  });
}

export async function loadPersistedSession(): Promise<SessionState | null> {
  const cookies = await CookieManager.get(API_BASE_URL);
  const raw = cookies[MOBILE_SESSION_COOKIE]?.value;
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as SessionState;
    if (!parsed.token || parsed.expiresAt <= Date.now() / 1000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
