const AUTH_CACHE_KEY = "auth";
const AUTH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedAuth {
  sessionKey: string;
  organizationId: string;
  cachedAt: number;
}

export interface ResolvedAuth {
  sessionKey: string;
  organizationId: string; // UUID format
}

/**
 * Resolve sessionKey and organizationId by:
 * 1. Checking cache (5 min TTL)
 * 2. Extracting sessionKey from cookies
 * 3. Fetching organizations and picking the best one
 */
export async function resolveAuth(): Promise<ResolvedAuth> {
  // Check cache
  const cached = await chrome.storage.session.get(AUTH_CACHE_KEY);
  if (cached[AUTH_CACHE_KEY]) {
    const auth = cached[AUTH_CACHE_KEY] as CachedAuth;
    if (Date.now() - auth.cachedAt < AUTH_CACHE_TTL_MS) {
      return {
        sessionKey: auth.sessionKey,
        organizationId: auth.organizationId,
      };
    }
  }

  // Get sessionKey from cookies
  const cookies = await chrome.cookies.get({
    url: "https://claude.ai",
    name: "sessionKey",
  });

  if (!cookies) {
    throw new Error("Not logged in to claude.ai. Please visit https://claude.ai and log in.");
  }

  const sessionKey = cookies.value;

  // Fetch organizations
  const response = await fetch("https://claude.ai/api/organizations", {
    headers: {
      accept: "application/json",
      cookie: `sessionKey=${sessionKey}`,
      referer: "https://claude.ai/",
      "user-agent": "Mozilla/5.0 Claude Usage Float",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch organizations: ${response.status} ${body}`);
  }

  const data = await response.json();

  // Handle both formats: { results: [...] } and [...]
  let orgs: Array<{ id: string; uuid: string; capabilities?: Record<string, unknown>; api_disabled_reason?: string | null }> = [];
  if (Array.isArray(data)) {
    orgs = data;
  } else if (data && typeof data === "object" && "results" in data) {
    orgs = (data as { results: Array<{ id: string; uuid: string; capabilities?: Record<string, unknown>; api_disabled_reason?: string | null }> }).results ?? [];
  }

  if (orgs.length === 0) {
    console.error("[auth] No organizations in response");
    throw new Error("No organizations found. Please check your Claude account.");
  }

  // Pick org: prefer claude_pro capabilities, then chat, then first
  const orgId = pickOrganization(orgs);

  // Cache
  await chrome.storage.session.set({
    [AUTH_CACHE_KEY]: {
      sessionKey,
      organizationId: orgId,
      cachedAt: Date.now(),
    } satisfies CachedAuth,
  });

  return { sessionKey, organizationId: orgId };
}

function pickOrganization(orgs: Array<{ id: string; uuid: string; capabilities?: Record<string, unknown>; api_disabled_reason?: string | null }>): string {
  // First: Prefer organizations with API enabled (api_disabled_reason is null)
  const enabledOrgs = orgs.filter(org => !org.api_disabled_reason);

  if (enabledOrgs.length > 0) {
    // Among enabled orgs, prefer claude_pro
    for (const org of enabledOrgs) {
      if (org.capabilities?.["claude_pro"]) {
        return org.uuid;
      }
    }

    // Then prefer chat
    for (const org of enabledOrgs) {
      if (org.capabilities?.["chat"]) {
        return org.uuid;
      }
    }

    // Fall back to first enabled org
    return enabledOrgs[0].uuid;
  }

  // If no enabled orgs, still prefer claude_pro/chat
  for (const org of orgs) {
    if (org.capabilities?.["claude_pro"]) {
      return org.uuid;
    }
  }

  for (const org of orgs) {
    if (org.capabilities?.["chat"]) {
      return org.uuid;
    }
  }

  // Last resort: first org
  return orgs[0].uuid;
}
