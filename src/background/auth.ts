const AUTH_CACHE_KEY = "auth";
const AUTH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedAuth {
  sessionKey: string;
  organizationId: string;
  cachedAt: number;
}

export interface ResolvedAuth {
  sessionKey: string;
  organizationId: string;
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

  const data = (await response.json()) as { results: Array<{ id: string; capabilities?: Record<string, unknown> }> };
  const orgs = data.results ?? [];

  if (orgs.length === 0) {
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

function pickOrganization(orgs: Array<{ id: string; capabilities?: Record<string, unknown> }>): string {
  // Prefer claude_pro
  for (const org of orgs) {
    if (org.capabilities?.["claude_pro"]) {
      return org.id;
    }
  }

  // Then prefer chat
  for (const org of orgs) {
    if (org.capabilities?.["chat"]) {
      return org.id;
    }
  }

  // Fall back to first
  return orgs[0].id;
}
