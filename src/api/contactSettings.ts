import { CONTACT_EMAIL } from '../constants';
import { mobileFetch } from './client';

type ContactSettingsApiResponse = {
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactMailtoHref?: string | null;
};

export type ContactSettings = {
  contactEmail: string;
  contactPhone: string | null;
  contactMailtoHref: string;
};

let cachedToken: string | null = null;
let cachedSettings: ContactSettings | null = null;

function normalize(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveSettings(payload?: ContactSettingsApiResponse): ContactSettings {
  const contactEmail = normalize(payload?.contactEmail) ?? CONTACT_EMAIL;
  const contactPhone = normalize(payload?.contactPhone);
  const contactMailtoHref =
    normalize(payload?.contactMailtoHref) ?? `mailto:${contactEmail}`;

  return { contactEmail, contactPhone, contactMailtoHref };
}

export function getDefaultContactSettings(): ContactSettings {
  return resolveSettings();
}

export async function getContactSettings(
  token: string,
  opts?: { forceRefresh?: boolean },
): Promise<ContactSettings> {
  const shouldReuseCache =
    !opts?.forceRefresh && cachedToken === token && cachedSettings;
  if (shouldReuseCache) {
    return cachedSettings;
  }

  try {
    const response = await mobileFetch<ContactSettingsApiResponse>(
      '/api/mobile/contact-settings',
      { token },
    );
    const resolved = resolveSettings(response);
    cachedToken = token;
    cachedSettings = resolved;
    return resolved;
  } catch {
    const fallback = resolveSettings();
    cachedToken = token;
    cachedSettings = fallback;
    return fallback;
  }
}
