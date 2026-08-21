import { describe, expect, it } from 'vitest';

import {
  checkSubmittedUrl,
  coerceReviewPayload,
  computeVerdict,
  normalizeLink,
  parseAgentJson,
  type ReviewChecks,
} from './reviewLogic';

const passing: ReviewChecks = {
  loads: true,
  isPersonalPortfolio: true,
  hasOwnWork: true,
  isPlaceholder: false,
  isTemplateDemo: false,
  nsfw: false,
};

describe('normalizeLink', () => {
  it('collapses the ways one site can be written', () => {
    const forms = [
      'https://www.foo.com',
      'http://foo.com/',
      'https://FOO.com/?ref=twitter',
      'https://www.foo.com/#about',
    ];

    expect(new Set(forms.map(normalizeLink)).size).toBe(1);
    expect(normalizeLink(forms[0])).toBe('foo.com');
  });

  it('keeps paths, which are different sites on a shared host', () => {
    expect(normalizeLink('https://foo.github.io/a')).not.toBe(
      normalizeLink('https://foo.github.io/b'),
    );
  });
});

describe('checkSubmittedUrl', () => {
  it('accepts a normal portfolio URL', () => {
    expect(checkSubmittedUrl('https://janedoe.dev/')).toMatchObject({
      ok: true,
    });
  });

  // The link is attacker-controlled, so this is the SSRF boundary.
  it.each([
    'http://localhost:3000',
    'http://127.0.0.1/admin',
    'https://10.0.0.5',
    'https://192.168.1.1',
    'https://169.254.169.254/latest/meta-data/',
    'https://router.local',
    'file:///etc/passwd',
    'https://example.com:8080',
    'not a url',
  ])('refuses %s', (link) => {
    expect(checkSubmittedUrl(link).ok).toBe(false);
  });
});

describe('parseAgentJson', () => {
  it('reads a bare object', () => {
    expect(parseAgentJson('{"verdict":"approve"}')).toEqual({
      verdict: 'approve',
    });
  });

  it('reads a fenced object', () => {
    expect(parseAgentJson('```json\n{"verdict":"reject"}\n```')).toEqual({
      verdict: 'reject',
    });
  });

  it('reads an object buried in prose', () => {
    expect(
      parseAgentJson(
        'Here is the review:\n{"verdict":"review"}\nHope that helps!',
      ),
    ).toEqual({ verdict: 'review' });
  });

  it('throws when there is no object at all', () => {
    expect(() => parseAgentJson('I cannot help with that.')).toThrow();
  });
});

describe('coerceReviewPayload', () => {
  it('drops junk rather than writing it to the row', () => {
    const payload = coerceReviewPayload({
      verdict: 'looks good to me',
      confidence: 7,
      titles: ['Developer', '  ', 'Developer', 42],
      checks: { loads: true },
      socials: 'https://github.com/x',
    });

    expect(payload.verdict).toBeUndefined();
    expect(payload.confidence).toBe(1);
    expect(payload.titles).toEqual(['Developer']);
    // A half-filled checks object cannot be stored, so it is dropped whole.
    expect(payload.checks).toBeUndefined();
    expect(payload.socials).toBeUndefined();
  });

  it('survives a model answering with a bare string', () => {
    expect(coerceReviewPayload('nope')).toEqual({});
  });
});

describe('computeVerdict', () => {
  it('approves a confident pass', () => {
    expect(computeVerdict({ checks: passing, confidence: 0.9 })).toBe(
      'approve',
    );
  });

  it('holds back an unconfident pass for a human', () => {
    expect(computeVerdict({ checks: passing, confidence: 0.4 })).toBe('review');
  });

  it.each([
    ['loads', { ...passing, loads: false }],
    ['isPlaceholder', { ...passing, isPlaceholder: true }],
    ['nsfw', { ...passing, nsfw: true }],
    ['isTemplateDemo', { ...passing, isTemplateDemo: true }],
    ['isPersonalPortfolio', { ...passing, isPersonalPortfolio: false }],
  ])('rejects on %s regardless of confidence', (_label, checks) => {
    expect(computeVerdict({ checks, confidence: 1 })).toBe('reject');
  });

  // The checks cannot express everything the model might notice — an injection
  // attempt in the page text, say — so its own reject is never overridden.
  it('never upgrades the model own reject', () => {
    expect(
      computeVerdict({ verdict: 'reject', checks: passing, confidence: 1 }),
    ).toBe('reject');
  });

  it('falls back to review when checks are missing', () => {
    expect(computeVerdict({ confidence: 1 })).toBe('review');
  });
});
