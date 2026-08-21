/**
 * Pure helpers for the submission review pipeline (see ./review.ts).
 *
 * Everything here is deliberately free of Convex and network imports so it can
 * be unit-tested directly — the interesting failure modes (a hostile URL, a
 * model that answers with prose, a model that contradicts its own checks) are
 * all decidable without a deployment.
 */

export type ReviewChecks = {
  loads: boolean;
  isPersonalPortfolio: boolean;
  hasOwnWork: boolean;
  isPlaceholder: boolean;
  isTemplateDemo: boolean;
  nsfw: boolean;
};

export type Verdict = 'approve' | 'review' | 'reject';

export type ReviewPayload = {
  verdict?: Verdict;
  confidence?: number;
  reason?: string;
  checks?: ReviewChecks;
  suggestedName?: string;
  titles?: string[];
  tags?: string[];
  socials?: string[];
  tech?: string[];
  description?: string;
};

/**
 * Canonical form of a submitted link, used to notice that a URL is already
 * listed. Scheme, `www.`, query and hash are all noise for that comparison —
 * two people submitting http://Foo.com/?ref=x and https://www.foo.com mean the
 * same site.
 */
export function normalizeLink(link: string): string {
  const trimmed = link.trim();
  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname.replace(/\/+$/, '');
    return `${host}${path}`;
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, '');
  }
}

const BLOCKED_HOSTNAME =
  /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.home\.arpa)$/i;

const PRIVATE_IPV4 =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/;

/**
 * Gate on a URL before we hand it to a headless browser.
 *
 * The link is attacker-controlled — anyone can post to `createSubmission` — so
 * this is the boundary that stops a submission from pointing the renderer at a
 * loopback or private-network address. Plain http is allowed through (a few
 * real portfolios are still http-only); it is the host, not the scheme, that
 * carries the risk here.
 */
export function checkSubmittedUrl(
  link: string,
): { ok: true; url: string } | { ok: false; reason: string } {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return { ok: false, reason: 'Not a valid URL.' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, reason: `Unsupported protocol ${url.protocol}` };
  }
  if (url.port !== '' && url.port !== '80' && url.port !== '443') {
    return { ok: false, reason: `Unsupported port ${url.port}` };
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (BLOCKED_HOSTNAME.test(host) || PRIVATE_IPV4.test(host)) {
    return { ok: false, reason: `Refusing to fetch private host ${host}` };
  }
  // IPv6 loopback / unique-local / link-local.
  if (host === '::1' || /^(fc|fd|fe80)/i.test(host)) {
    return { ok: false, reason: `Refusing to fetch private host ${host}` };
  }
  if (!host.includes('.')) {
    return { ok: false, reason: `Not a public hostname: ${host}` };
  }

  return { ok: true, url: url.toString() };
}

/**
 * Pull the JSON object out of an LLM reply. The agent is told to answer with
 * JSON and nothing else, but models still occasionally wrap it in ```json
 * fences or a sentence of preamble, and a whole run should not be lost to that.
 */
export function parseAgentJson(raw: string): unknown {
  const fenced = raw.trim().match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(body);
  } catch {
    const start = body.indexOf('{');
    const end = body.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(body.slice(start, end + 1));
    }
    throw new Error('No JSON object found in the agent response.');
  }
}

function stringList(value: unknown, max: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim().slice(0, 120);
    if (trimmed) seen.add(trimmed);
    if (seen.size >= max) break;
  }
  return seen.size > 0 ? [...seen] : undefined;
}

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function checks(value: unknown): ReviewChecks | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const raw = value as Record<string, unknown>;
  const keys: (keyof ReviewChecks)[] = [
    'loads',
    'isPersonalPortfolio',
    'hasOwnWork',
    'isPlaceholder',
    'isTemplateDemo',
    'nsfw',
  ];
  // The schema stores checks as a fixed object of booleans, so a partial answer
  // has to be rejected wholesale rather than written half-filled.
  if (keys.some((key) => typeof raw[key] !== 'boolean')) return undefined;
  return Object.fromEntries(
    keys.map((key) => [key, raw[key] as boolean]),
  ) as unknown as ReviewChecks;
}

const VERDICTS = new Set<Verdict>(['approve', 'review', 'reject']);

/** Coerce whatever the model returned into the shape the schema accepts. */
export function coerceReviewPayload(parsed: unknown): ReviewPayload {
  if (typeof parsed !== 'object' || parsed === null) return {};
  const raw = parsed as Record<string, unknown>;

  const confidence =
    typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
      ? Math.min(1, Math.max(0, raw.confidence))
      : undefined;

  return {
    verdict: VERDICTS.has(raw.verdict as Verdict)
      ? (raw.verdict as Verdict)
      : undefined,
    confidence,
    reason: text(raw.reason, 400),
    checks: checks(raw.checks),
    suggestedName: text(raw.suggestedName, 100),
    titles: stringList(raw.titles, 3),
    tags: stringList(raw.tags, 5),
    socials: stringList(raw.socials, 8),
    tech: stringList(raw.tech, 8),
    description: text(raw.description, 600),
  };
}

/**
 * The verdict the admin actually sees, computed from the structured checks
 * rather than taken from the model's own `verdict` string.
 *
 * Doing it here means the thresholds are a code change and a unit test instead
 * of a re-prompt, and it keeps a page that talks its way to "approve" in prose
 * from overriding checks that say otherwise. The model's own verdict is still
 * honoured in one direction: a "reject" is never upgraded, because it may have
 * seen something none of these booleans covers (an injection attempt, say).
 */
export function computeVerdict(
  payload: ReviewPayload,
  approveThreshold = 0.7,
): Verdict {
  const { checks: c, confidence, verdict } = payload;
  if (verdict === 'reject') return 'reject';
  if (!c) return verdict ?? 'review';

  if (!c.loads || c.isPlaceholder || c.nsfw) return 'reject';
  if (!c.isPersonalPortfolio || c.isTemplateDemo) return 'reject';
  if (!c.hasOwnWork) return 'review';

  return (confidence ?? 0) >= approveThreshold ? 'approve' : 'review';
}

/** Keep the page text inside a sane prompt budget. */
export function truncate(value: string, max: number): string {
  return value.length <= max
    ? value
    : `${value.slice(0, max)}\n\n[truncated at ${max} characters]`;
}

/**
 * Hosts worth surfacing as a portfolio's socials. Suffix-matched, so
 * `www.linkedin.com` and `bsky.app` both land.
 */
const SOCIAL_HOSTS = [
  'github.com',
  'gitlab.com',
  'linkedin.com',
  'x.com',
  'twitter.com',
  'bsky.app',
  'mastodon.social',
  'threads.net',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'dribbble.com',
  'behance.net',
  'are.na',
  'figma.com',
  'codepen.io',
  'medium.com',
  'substack.com',
  'dev.to',
  'read.cv',
  'soundcloud.com',
  'vimeo.com',
  'producthunt.com',
];

/** Paths that tend to hold contact details when the homepage does not. */
const CONTACT_PATHS =
  /^\/(about|contact|links|connect|info|hire|cv|resume)\/?$/i;

export type ExtractedLinks = {
  /** Absolute URLs (or `mailto:`) pointing at a known social or contact host. */
  socials: string[];
  /** Same-origin page paths, for deciding whether a second look is worthwhile. */
  internal: string[];
};

/**
 * Pull links out of rendered markdown.
 *
 * The model is perfectly capable of reading a footer, but only when the footer
 * reaches it — and asking it to transcribe URLs invites typos and invention.
 * Extracting them mechanically means the socials are exact by construction, and
 * the model's job shrinks to choosing which ones belong to the portfolio owner.
 */
export function extractLinks(
  markdown: string,
  baseUrl: string,
): ExtractedLinks {
  let origin = '';
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    origin = '';
  }

  const socials = new Set<string>();
  const internal = new Set<string>();

  // Markdown links `[label](target)` plus any bare absolute URL left in the text.
  const targets: string[] = [];
  for (const m of markdown.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    targets.push(m[1]);
  }
  for (const m of markdown.matchAll(/(?<![("])\bhttps?:\/\/[^\s)<>"']+/g)) {
    targets.push(m[0]);
  }

  for (const raw of targets) {
    const target = raw.replace(/[).,]+$/, '');
    if (target.startsWith('mailto:')) {
      socials.add(target);
      continue;
    }
    let url: URL;
    try {
      url = new URL(target, origin || undefined);
    } catch {
      continue;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;

    const host = url.hostname.replace(/^www\./, '');
    if (SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      // Bare profile roots (github.com with no path) say nothing about the owner.
      if (url.pathname !== '/' && url.pathname !== '') {
        socials.add(`${url.origin}${url.pathname}`.replace(/\/$/, ''));
      }
      continue;
    }
    if (origin && url.origin === origin && url.pathname !== '/') {
      internal.add(url.pathname);
    }
  }

  return { socials: [...socials], internal: [...internal] };
}

/** The single most promising page to check when the homepage yields no socials. */
export function pickContactPage(internal: string[]): string | undefined {
  return internal.find((path) => CONTACT_PATHS.test(path));
}
